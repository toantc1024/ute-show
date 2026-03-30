import { Geist_Mono, Space_Grotesk, Outfit } from "next/font/google"
import "./globals.css"
import { SupabaseProvider } from "@/components/supabase-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { EventProvider } from "@/components/event-context"
import { cn } from "@/lib/utils"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "vietnamese"], variable: "--font-space-grotesk" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "UTE Checkin",
  description: "Hệ thống quản lý check-in sự kiện thông minh cho cộng đồng HCMUTE",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body
        className={cn(
          "bg-background min-h-screen antialiased text-on-surface font-sans",
          outfit.variable,
          spaceGrotesk.variable,
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
            <EventProvider>
              {children}
            </EventProvider>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
