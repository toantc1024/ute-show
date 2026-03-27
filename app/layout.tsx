import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/supabase-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title:
    "BAN GIÁM ĐỐC TRUNG TÂM CÁC THỜI KỲ - UTE Check-in",
  description: "Hệ thống CHÀO MỪNG CÁN BỘ ĐOÀN HCM-UTE CÁC THỜI KỲ VỀ THAM DỰ CHƯƠNG TRÌNH thời gian thực",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          inter.variable,
          fontMono.variable
        )}
      >
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
