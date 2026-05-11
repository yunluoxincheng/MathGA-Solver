import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathGA Solver - 遗传算法数学求解器",
  description: "基于遗传算法的浏览器端数学数值求解平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
