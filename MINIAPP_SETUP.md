# Farcaster Mini App Setup Guide

## Overview

Plug It is a **Farcaster Mini App** that acts as a bridge/gateway between external Web3 applications (using WalletConnect) and the Farcaster wallet.

## What is a Farcaster Mini App?

Mini Apps are web applications that render inside Farcaster clients (like Warpcast). They can:
- Access the user's Farcaster wallet seamlessly
- Be discovered and shared in social feeds
- Send notifications to users
- Use native Farcaster features

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@farcaster/miniapp-sdk` - Official Farcaster Mini App SDK
- `@walletconnect/ethereum-provider` - WalletConnect bridge
- Other dependencies

### 2. Create Manifest File

The manifest file at `/.well-known/farcaster.json` identifies your Mini App.

**Current status:** A template manifest exists at `public/.well-known/farcaster.json`

**To complete setup:**

1. Go to [Farcaster Mini App Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Enter your domain (e.g., `plugit.app`)
3. Fill in app details:
   - Name: "Plug It"
   - Description: "Bridge between Web3 apps and Farcaster wallet"
   - Icon URL: Your app icon (200x200px)
   - Home URL: Your app URL
   - Splash image and background color
4. Sign the manifest with your Farcaster account
5. Copy the `accountAssociation` object from the tool
6. Update `public/.well-known/farcaster.json` with the signed `accountAssociation`

### 3. Add Embed Meta Tags

Embed tags make your app shareable in Farcaster feeds. These are automatically added via the `MetaTags` component.

**For dynamic pages**, add embed tags to each shareable page:

```tsx
// In your page component
const embed = {
  version: "1",
  imageUrl: "https://plugit.app/page-image.png",
  button: {
    title: "View Page",
    action: {
      type: "launch_miniapp",
      name: "Plug It",
      url: "https://plugit.app/specific-page"
    }
  }
};

// Add to head
<meta name="fc:miniapp" content={JSON.stringify(embed)} />
```

### 4. SDK Integration

The app uses the Farcaster Mini App SDK for:

- **Wallet Access**: `sdk.wallet.getEthereumProvider()` - EIP-1193 provider
- **App Initialization**: `sdk.actions.ready()` - Hides splash screen
- **Context**: `sdk.context` - User info, location, client details

**Key Components:**

- `MiniAppInit` - Calls `sdk.actions.ready()` on mount
- `useFarcasterWallet` - Hook for wallet connection via SDK
- `useWalletConnect` - Bridge between WalletConnect and Farcaster wallet

### 5. How the Bridge Works

```
External dApp (WalletConnect)
    ↓
QR Code / URI
    ↓
Plug It (WalletConnect Client)
    ↓
Bridge Layer (useWalletConnect hook)
    ↓
Farcaster Wallet (via SDK)
    ↓
Transaction Signed
    ↓
Response back through bridge
    ↓
External dApp
```

**Flow:**
1. External dApp shows WalletConnect QR code
2. User scans QR in Plug It's "Apps" tab
3. WalletConnect session established
4. When dApp sends requests (transactions, signing):
   - Plug It receives via WalletConnect
   - Bridges to Farcaster wallet via `sdk.wallet.getEthereumProvider()`
   - User signs in Farcaster wallet
   - Response flows back through bridge to dApp

### 6. Testing Your Mini App

#### Local Development

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Use tunneling** (required for Mini Apps):
   ```bash
   # Using ngrok
   ngrok http 3000
   ```

3. **Test in Preview Tool:**
   - Go to [Mini App Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)
   - Enter your tunneled URL
   - Preview your app

#### Production Deployment

1. **Deploy to your domain** (e.g., Vercel, Netlify)
2. **Update manifest** with production URLs
3. **Sign manifest** using the manifest tool
4. **Test sharing** - Share your app URL in a cast to see the embed

### 7. Required Files

- ✅ `public/.well-known/farcaster.json` - Manifest (needs signing)
- ✅ `src/components/MiniAppInit.tsx` - SDK initialization
- ✅ `src/components/MetaTags.tsx` - Embed meta tags
- ✅ `src/hooks/useFarcasterWallet.ts` - Wallet integration
- ✅ `src/hooks/useWalletConnect.ts` - Bridge implementation

### 8. Environment Variables

```env
# WalletConnect (for bridge)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Squid Router (for swaps)
SQUID_INTEGRATOR_ID=your-squid-integrator-id
SQUID_API_URL=https://v2.api.squidrouter.com

# ParaSwap (for swaps)
PARASWAP_API_URL=https://apiv5.paraswap.io
```

### 9. Important Notes

#### SDK.actions.ready()

**CRITICAL:** You must call `sdk.actions.ready()` or users will see an infinite loading screen. This is handled automatically by `MiniAppInit` component.

#### Domain Matching

- Your manifest domain must **exactly match** your hosting domain
- Tunnel domains (ngrok, etc.) won't work for `addMiniApp()` action
- Use production domain for full functionality

#### Wallet Provider

The Farcaster wallet is accessed via:
```ts
const provider = await sdk.wallet.getEthereumProvider();
// Use as standard EIP-1193 provider
```

### 10. Next Steps

1. ✅ SDK integrated - Wallet access via `sdk.wallet.getEthereumProvider()`
2. ✅ Bridge implemented - WalletConnect → Farcaster wallet
3. ⏳ **Sign manifest** - Use manifest tool to sign `accountAssociation`
4. ⏳ **Deploy** - Deploy to production domain
5. ⏳ **Test** - Test in Farcaster client
6. ⏳ **Share** - Share your app in casts to test embeds

### Resources

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/)
- [Mini App SDK Reference](https://miniapps.farcaster.xyz/docs/sdk)
- [Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
- [Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)

---

**Plug It** - Your Farcaster wallet, everywhere! 🔌

