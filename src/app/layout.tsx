import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { APP_NAME } from "@/libs/constants";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: APP_NAME,
    template: `%s - ${APP_NAME}`,
  },
  description: `Aplikasi kasir dan manajemen operasional ${APP_NAME}.`,
  icons: {
    icon: [
      { url: "/img/logo-web.png" },
      { url: "/img/logo-web.png", sizes: "192x192", type: "image/png" },
      { url: "/img/logo-web.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/img/logo-web.png",
    apple: "/img/logo-web.png",
  },
  openGraph: {
    title: APP_NAME,
    description: `Aplikasi kasir dan manajemen operasional ${APP_NAME}.`,
    url: "/",
    siteName: APP_NAME,
    images: [
      {
        url: "/img/logo-web.png",
        width: 512,
        height: 512,
        alt: `Logo ${APP_NAME}`,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${notoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <NextTopLoader
          color="#f59e0b"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #f59e0b,0 0 5px #f59e0b"
        />
        {children}
      </body>
    </html>
  );
}
