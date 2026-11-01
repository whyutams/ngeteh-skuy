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
  title: `Login - ${APP_NAME}`,
  description: `Platform operasional ${APP_NAME}`,
  icons: {
    icon: "/img/logo-web.png",
    apple: "/img/logo-web.png",
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
