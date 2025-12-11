# Plug It — Farcaster MiniApp

**Plug It** is a Farcaster MiniApp that *plugs* your Farcaster wallet into any dApp and routes swaps through third-party aggregators (Squid, ParaSwap, CoW Protocol) to avoid in-wallet swap fees.

## Features

- 🔐 **Non-custodial wallet connection** via Farcaster MiniApp SDK
- 💱 **Multi-aggregator swap routing** (Squid for cross-chain, ParaSwap/CoW for on-chain)
- 📊 **Real-time quotes** with gas estimates
- 📜 **Transaction history** tracking
- ⚙️ **Customizable settings** (slippage, preferred aggregator, chain selection)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Backend**: Next.js API Routes (for aggregator calls)
- **Wallet Integration**: Farcaster MiniApp SDK
- **Swap Routing**: Squid Router API (cross-chain), ParaSwap API (on-chain)
- **Blockchain**: Viem for transaction handling
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Farcaster account
- Squid Router API access (get integrator ID from [Squid Dashboard](https://docs.squidrouter.com))

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
SQUID_INTEGRATOR_ID=your-squid-integrator-id
SQUID_API_URL=https://v2.api.squidrouter.com
PARASWAP_API_URL=https://apiv5.paraswap.io
```

3. **Start development server:**

```bash
npm run dev
```

4. **Open in browser:**

The app will be available at `http://localhost:3000`. To test as a MiniApp:
- Use Farcaster's MiniApp development tools
- Or deploy to a public URL and add it to your Farcaster client

## Project Structure

```
plugit/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Main page (home)
│   │   └── api/
│   │       └── quotes/
│   │           └── route.ts       # API route for aggregator quotes
│   ├── components/
│   │   ├── WalletConnect.tsx      # Farcaster wallet connection
│   │   ├── SwapWidget.tsx         # Main swap interface
│   │   ├── QuoteDisplay.tsx       # Display swap quotes
│   │   ├── TransactionReview.tsx  # Review before signing
│   │   ├── History.tsx            # Transaction history
│   │   └── Settings.tsx           # User preferences
│   ├── hooks/
│   │   ├── useFarcasterWallet.ts  # Wallet hook
│   │   ├── useSwapQuotes.ts       # Fetch quotes from aggregators
│   │   └── useTransactionHistory.ts
│   ├── services/
│   │   ├── squid.ts               # Squid Router API reference
│   │   ├── paraswap.ts            # ParaSwap API reference
│   │   └── storage.ts             # Local storage for history/prefs
│   ├── utils/
│   │   ├── tokens.ts              # Token lists and helpers
│   │   └── chains.ts              # Chain configurations
│   ├── App.css
│   └── index.css
├── public/
│   └── manifest.json              # Farcaster MiniApp manifest
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

## Development

### Available Scripts

- `npm run dev` - Start development server (runs on port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing Swap Flow

1. Connect your Farcaster wallet
2. Select token pair (e.g., USDC → ETH)
3. Choose source and destination chains
4. Review quotes from different aggregators
5. Sign and execute transaction

### Testing on Testnets

Update chain configurations in `src/utils/chains.ts` to use testnet RPCs:

```typescript
export const TESTNET_CHAINS = {
  ethereum: { id: 5, rpc: 'https://goerli.infura.io/...' },
  polygon: { id: 80001, rpc: 'https://rpc-mumbai.maticvigil.com' },
  // ...
};
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Farcaster MiniApp Setup

1. Deploy to a public URL
2. Create `manifest.json` in `/public` (see example below)
3. Register your MiniApp in Farcaster
4. Test in Farcaster client

## API Integration

### Squid Router

Get your integrator ID from the [Squid Dashboard](https://docs.squidrouter.com/api-and-sdk-integration/api).

API Documentation: https://docs.squidrouter.com/api-and-sdk-integration/api

### ParaSwap

No API key required for basic usage. Rate limits apply.

API Documentation: https://developers.paraswap.network/

## Security

- **Non-custodial**: Never holds private keys
- **Transparent**: Shows exact transaction calls before signing
- **User control**: Configurable slippage and approval limits
- **Rate limiting**: Frontend query throttling

## Roadmap

- [ ] Multi-chain balance display
- [ ] Batch swap support
- [ ] Gas optimization features
- [ ] Advanced routing analysis
- [ ] Mobile notifications
- [ ] Social sharing features

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check [Farcaster MiniApp docs](https://miniapps.farcaster.xyz/)
- Review [Squid Router docs](https://docs.squidrouter.com)

---

Built with ❤️ for the Farcaster community

