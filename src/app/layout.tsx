import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { MiniAppWrapper } from "@/components/MiniAppWrapper"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Vendor Wars - Farcaster MiniApp",
  description: "Battle of the vendors - who will reign supreme?",
  keywords: ["farcaster", "miniapp", "vendor", "battle", "competition"],
  authors: [{ name: "Vendor Wars Team" }],
  openGraph: {
    title: "Vendor Wars",
    description: "Battle of the vendors - who will reign supreme?",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vendor Wars",
    description: "Battle of the vendors - who will reign supreme?",
    images: ["/og-image.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      "version": "1",
      "imageUrl": "https://vendor-wars.vercel.app/og-image.png",
      "button": {
        "title": "⚔️ Start Battle",
        "action": {
          "type": "launch_frame",
          "name": "Vendor Wars",
          "url": "https://vendor-wars.vercel.app",
          "splashImageUrl": "https://vendor-wars.vercel.app/og-image.png",
          "splashBackgroundColor": "#f97316"
        }
      }
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <MiniAppWrapper>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <div className="flex-1">{children}</div>
          </div>
        </MiniAppWrapper>
      </body>
    </html>
  )
}
