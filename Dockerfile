# syntax=docker.io/docker/dockerfile:1
FROM node:20.16.0-bookworm AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder

# install turbo globally
RUN pnpm add -g turbo@2.0.3

# set working directory
WORKDIR /app

# copy project
COPY . .

# Generate a partial monorepo with a pruned lockfile for the backend
RUN turbo prune @onchess/backend --docker

# First install the dependencies (as they change less often)
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm run build --filter=@onchess/backend

# runtime stage: produces final image that will be executed

# Here the image's platform MUST be linux/riscv64.
# Give preference to small base images, which lead to better start-up
# performance when loading the Cartesi Machine.
FROM --platform=linux/riscv64 cartesi/node:20.16.0-jammy-slim AS runtime

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /
RUN dpkg -i /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb \
  && rm /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb

LABEL io.cartesi.rollups.sdk_version=0.9.0
LABEL io.cartesi.rollups.ram_size=128Mi

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt-get update
apt-get install -y --no-install-recommends \
  busybox-static=1:1.30.1-7ubuntu3
rm -rf /var/lib/apt/lists/* /var/log/* /var/cache/*
useradd --create-home --user-group dapp
EOF

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=installer /app/apps/backend/dist .

ENV ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004"

ENTRYPOINT ["rollup-init"]
CMD ["node", "index.js"]

FROM runtime AS mainnet
ENV CHAIN_ID=8453

FROM runtime AS testnet
ENV CHAIN_ID=84532

FROM runtime
ENV CHAIN_ID=31337
