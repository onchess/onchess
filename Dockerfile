# syntax=docker.io/docker/dockerfile:1

# This enforces that the packages downloaded from the repositories are the same
# for the defined date, no matter when the image is built.
ARG APT_UPDATE_SNAPSHOT=20260415T030400Z
ARG MACHINE_GUEST_TOOLS_VERSION=0.17.2
ARG MACHINE_GUEST_TOOLS_SHA256SUM=c077573dbcf0cdc146adf14b480bfe454ca63aa4d3e8408c5487f550a5b77a41

################################################################################
# riscv64 base stage
FROM --platform=linux/riscv64 cartesi/node:24.17.0-noble-slim AS base

ARG APT_UPDATE_SNAPSHOT
ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt-get update
apt-get install -y --no-install-recommends ca-certificates
apt-get update --snapshot=${APT_UPDATE_SNAPSHOT}
apt-get remove -y --purge ca-certificates
apt-get autoremove -y --purge
EOF

################################################################################
# tooling base: bun + turbo, shared by the prune and build stages

# The build does not need to run on riscv64: @tuler/node-libcmt ships a
# linux-riscv64 prebuild that node-gyp-build selects at runtime, so the addon
# installed here on $BUILDPLATFORM still loads inside the riscv64 machine.
FROM --platform=$BUILDPLATFORM oven/bun:1 AS bun-turbo
RUN bun install -g turbo
WORKDIR /app

################################################################################
# prune stage: produce a partial monorepo containing only what
# @onchess/backend needs (package.json files, pruned lockfile and sources)
FROM bun-turbo AS prune
COPY . .
RUN turbo prune @onchess/backend --docker

################################################################################
# build stage: install the pruned deps and build the backend bundle

FROM bun-turbo AS build-stage

# Install dependencies first (they change less often than source). The hoisted
# linker keeps the native addon (@tuler/node-libcmt) and its node-gyp-build
# loader as real top-level dirs, which the rootfs step below copies verbatim.
COPY --from=prune /app/out/json/ .
RUN bun install --linker=hoisted

# Build the backend (turbo builds @onchess/core first via ^build). esbuild
# bundles src/index.ts into dist/index.js with @tuler/node-libcmt left external.
COPY --from=prune /app/out/full/ .
RUN turbo build --filter=@onchess/backend

# Stage the runtime files: the JS bundle plus @tuler/node-libcmt's native addon,
# which esbuild cannot inline (it is marked --external) and must be required at
# runtime. Copy the addon and its node-gyp-build loader next to the bundle.
RUN mkdir -p rootfs/node_modules/@tuler \
 && cp apps/backend/dist/index.js rootfs/index.js \
 && cp -R node_modules/@tuler/node-libcmt rootfs/node_modules/@tuler/ \
 && cp -R node_modules/node-gyp-build rootfs/node_modules/node-gyp-build

################################################################################
# runtime stage: produces final image that will be executed

# Here the image's platform MUST be linux/riscv64.
# Give preference to small base images, which lead to better start-up
# performance when loading the Cartesi Machine.
FROM base AS runtime

ARG MACHINE_GUEST_TOOLS_VERSION
ARG MACHINE_GUEST_TOOLS_SHA256SUM
ADD --checksum=sha256:${MACHINE_GUEST_TOOLS_SHA256SUM} \
  https://github.com/cartesi/machine-guest-tools/releases/download/v${MACHINE_GUEST_TOOLS_VERSION}/machine-guest-tools_riscv64.deb \
  /tmp/machine-guest-tools_riscv64.deb

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt-get install -y --no-install-recommends \
  busybox-static \
  /tmp/machine-guest-tools_riscv64.deb

rm /tmp/machine-guest-tools_riscv64.deb
rm -rf /var/lib/apt/lists/* /var/log/* /var/cache/*
EOF

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=build-stage /app/rootfs .

ENTRYPOINT ["node"]
CMD ["index.js"]

FROM runtime AS mainnet
ENV CHAIN_ID=8453

FROM runtime AS testnet
ENV CHAIN_ID=84532

FROM runtime
ENV CHAIN_ID=31337
