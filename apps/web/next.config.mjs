/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next 16 defaults to Turbopack (used by `next build`/`next dev`), which
    // resolves these optional deps natively — an empty config is enough.
    turbopack: {},
    // Kept for the Storybook build, which still bundles with webpack and needs
    // these optional Node-only deps externalized.
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding");
        return config;
    },
};

export default nextConfig;
