import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "블로그 체험단 - 인플루언서와 함께하는 체험 마케팅",
  description: "인플루언서와 광고주를 연결하는 체험단 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <CurrentUserProvider initialState={currentUser}>
            <Header />
            {children}
          </CurrentUserProvider>
        </Providers>
      </body>
    </html>
  );
}
