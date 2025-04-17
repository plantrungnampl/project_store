/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cấu hình cho tối ưu hóa hình ảnh
    images: {
        domains: ['example.com', "images.unsplash.com", "res.cloudinary.com"],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // Tối ưu hóa và cấu hình nâng cao
    experimental: {
        serverComponentsExternalPackages: ["@node-rs/argon2"],
        optimizeCss: true, // Tối ưu hóa CSS
        scrollRestoration: true, // Khôi phục vị trí cuộn trang khi quay lại
        optimisticClientCache: true,
    },
    // Tối ưu hóa tải trang
    reactStrictMode: true,
    poweredByHeader: false, // Tăng bảo mật bằng cách loại bỏ header X-Powered-By
    swcMinify: true, // Sử dụng SWC để minimize JavaScript
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
    // Cấu hình cache
    onDemandEntries: {
        // Giữ các trang trong bộ nhớ cache (dev mode) 
        maxInactiveAge: 25 * 1000,
        // Số trang giữ trong bộ nhớ
        pagesBufferLength: 5,
    },
};

export default nextConfig;
