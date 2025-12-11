import type { Metadata } from 'next'
import '../index.css'

// Mini App Embed metadata for sharing
const miniappEmbed = {
  version: "1",
  imageUrl: "https://plugit.app/og-image.svg", // SVG version works in modern browsers
  button: {
    title: "🔌 Plug It",
    action: {
      type: "launch_miniapp",
      name: "Plug It",
      splashImageUrl: "https://plugit.app/icon.svg", // SVG version works in modern browsers
      splashBackgroundColor: "#2563eb"
    }
  }
};

export const metadata: Metadata = {
  title: 'Plug It - Farcaster MiniApp',
  description: 'Bridge between Web3 apps and Farcaster wallet. Connect to any dApp via WalletConnect and swap tokens across chains.',
  other: {
    'fc:miniapp': JSON.stringify(miniappEmbed),
    // For backward compatibility
    'fc:frame': JSON.stringify(miniappEmbed),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
