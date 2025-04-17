import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./Providers";
import HeaderContainer from "@/components/layout/HeaderContainer";
import Script from "next/script";

// Fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: 'swap', // Font display swap để tránh text invisible
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: 'swap',
});

// Metadata tối ưu cho SEO
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nextstore.example.com'),
  title: {
    default: "NextStore - Mua sắm trực tuyến",
    template: "%s | NextStore"
  },
  description: "NextStore - Nền tảng mua sắm trực tuyến với hàng ngàn sản phẩm chất lượng cao, giao hàng nhanh chóng và thanh toán an toàn.",
  keywords: ["ecommerce", "shop", "online shopping", "nextjs", "react"],
  authors: [{ name: "NextStore Team" }],
  creator: "NextStore",
  publisher: "NextStore",
  applicationName: "NextStore E-commerce",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'ecommerce',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    title: "NextStore - Mua sắm trực tuyến",
    description: "NextStore - Nền tảng mua sắm trực tuyến với hàng ngàn sản phẩm chất lượng cao, giao hàng nhanh chóng và thanh toán an toàn.",
    siteName: "NextStore",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NextStore",
      },
    ],
  }
};

// Viewport
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <HeaderContainer />
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-background">
              <div className="container py-6 md:py-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">NextStore</h3>
                    <ul className="space-y-1 text-xs">
                      <li><a href="/about" className="hover:underline">Giới thiệu</a></li>
                      <li><a href="/contact" className="hover:underline">Liên hệ</a></li>
                      <li><a href="/careers" className="hover:underline">Tuyển dụng</a></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Hỗ trợ</h3>
                    <ul className="space-y-1 text-xs">
                      <li><a href="/faq" className="hover:underline">FAQ</a></li>
                      <li><a href="/shipping" className="hover:underline">Vận chuyển</a></li>
                      <li><a href="/returns" className="hover:underline">Đổi trả</a></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Chính sách</h3>
                    <ul className="space-y-1 text-xs">
                      <li><a href="/terms" className="hover:underline">Điều khoản</a></li>
                      <li><a href="/privacy" className="hover:underline">Quyền riêng tư</a></li>
                      <li><a href="/cookies" className="hover:underline">Cookies</a></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Kết nối</h3>
                    <ul className="space-y-1 text-xs">
                      <li><a href="https://facebook.com" className="hover:underline">Facebook</a></li>
                      <li><a href="https://instagram.com" className="hover:underline">Instagram</a></li>
                      <li><a href="https://twitter.com" className="hover:underline">Twitter</a></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 text-center text-xs">
                  <p> {new Date().getFullYear()} NextStore. Mọi quyền được bảo lưu.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
        
        {/* Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          />
        )}
        {process.env.NODE_ENV === 'production' && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
