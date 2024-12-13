import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/toaster";
import localFont from "next/font/local";
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
})

/* const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
 */
/* const sofiaPro = localFont({
  src: [
    {
      path: './fonts/SofiaProBlack.woff',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/SofiaProBold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/SofiaProMedium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/SofiaProRegular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/SofiaProLight.woff',
      weight: '300',
      style: 'normal',
    }
  ],
});
 */
export const metadata: Metadata = {
  title: "TapFlow | Tus cobranzas con IA",
  description: "Gestiona tus cobranzas con IA de forma automatizada. No más llamadas telefónicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
