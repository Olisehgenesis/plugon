import { NextResponse } from 'next/server';

// Farcaster MiniApp configuration
const farcasterConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Plug It",
    iconUrl: "https://plugon.vercel.app/icon.png",
    homeUrl: "https://plugon.vercel.app/",
    imageUrl: "https://plugon.vercel.app/og-image.svg",
    buttonTitle: "🔌 Plug It",
    splashImageUrl: "https://plugon.vercel.app/icon.svg",
    splashBackgroundColor: "#2563eb",
    description: "Bridge between Web3 apps and Farcaster wallet. Connect to any dApp via WalletConnect and swap tokens across chains.",
    requiredChains: [
      "eip155:1",
      "eip155:137",
      "eip155:42161",
      "eip155:8453"
    ],
    requiredCapabilities: [
      "wallet.getEthereumProvider",
      "actions.swapToken"
    ]
  }
};

export async function GET() {
  return NextResponse.json(farcasterConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

