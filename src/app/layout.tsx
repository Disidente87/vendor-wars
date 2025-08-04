import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Noto_Sans } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { BottomNavigation } from "@/components/BottomNavigation"
import { MiniAppWrapper } from "@/components/MiniAppWrapper"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
})

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://vendor-wars.vercel.app'),
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${notoSans.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vendor Wars" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body 
        className={`${plusJakartaSans.variable} ${notoSans.variable} antialiased`}
        style={{ 
          fontFamily: 'var(--font-plus-jakarta-sans), var(--font-noto-sans), sans-serif',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none'
        }}
      >
        <MiniAppWrapper>
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:block">
            <Navigation />
          </div>
          
          {/* Main Content */}
          <main className="pb-20 md:pb-0"> {/* Add bottom padding for mobile navigation */}
            {children}
          </main>
          
          {/* Mobile Bottom Navigation - Hidden on desktop */}
          <div className="md:hidden">
            <BottomNavigation />
          </div>
        </MiniAppWrapper>
      </body>
    </html>
  )
}
