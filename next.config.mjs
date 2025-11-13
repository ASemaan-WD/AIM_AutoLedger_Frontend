/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    // Note: serverComponentsExternalPackages was removed in Next.js 15
    // The OpenAI SDK works fine in serverless without this config
};

export default nextConfig;
