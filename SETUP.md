# Setup Guide

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Then edit `.env` and add your Squid Router integrator ID:
```env
VITE_SQUID_INTEGRATOR_ID=your-actual-integrator-id
```

Get your integrator ID from: https://docs.squidrouter.com

3. **Start development server:**
```bash
npm run dev
```

4. **Open in browser:**
Navigate to `http://localhost:3000`

## Farcaster MiniApp SDK Integration

⚠️ **Important**: The current implementation includes a placeholder for the Farcaster MiniApp SDK integration in `src/hooks/useFarcasterWallet.ts`.

To complete the integration:

1. Install the actual Farcaster MiniApp SDK (when available):
```bash
npm install @farcaster/miniapp-sdk
```

2. Update `src/hooks/useFarcasterWallet.ts` with the actual SDK methods:
   - Replace placeholder `connect()` with actual SDK wallet connection
   - Replace placeholder `requestSign()` with actual SDK transaction signing
   - Follow the official Farcaster MiniApp SDK documentation

3. The SDK should provide methods like:
   - `sdk.wallet.request({ method: 'eth_requestAccounts' })`
   - `sdk.wallet.request({ method: 'eth_sendTransaction', params: [...] })`

## Testing Swap Functionality

### Testnet Testing

1. Update chain configurations in `src/utils/chains.ts` to use testnet RPCs
2. Use testnet token addresses in `src/utils/tokens.ts`
3. Ensure your Squid integrator ID supports testnet

### Local Testing

The app will work locally for UI/UX testing, but actual swaps require:
- Valid Farcaster wallet connection
- Real token balances
- Network connectivity to aggregator APIs

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Vercel or any static hosting service.

## Deployment Checklist

- [ ] Add your Squid Router integrator ID to environment variables
- [ ] Complete Farcaster MiniApp SDK integration
- [ ] Test wallet connection flow
- [ ] Test swap execution on testnet
- [ ] Update `public/manifest.json` with your app details
- [ ] Deploy to public URL
- [ ] Register MiniApp in Farcaster
- [ ] Test in Farcaster client

## Troubleshooting

### "Failed to fetch quotes"
- Check your Squid integrator ID is correct
- Verify network connectivity
- Check browser console for API errors

### "Wallet not connected"
- Ensure Farcaster MiniApp SDK is properly integrated
- Check that you're accessing the app through Farcaster client

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)

