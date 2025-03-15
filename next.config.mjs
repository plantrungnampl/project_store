/** @type {import('next').NextConfig} */
const nextConfig = {
    // serverExternalPackages: ["@node-rs/argon2"],
    images: {
        domains: ['example.com'], // Thêm tên miền chứa ảnh
    },
    experimental: {
        serverComponentsExternalPackages: ["@node-rs/argon2"]
    }
};

export default nextConfig;
