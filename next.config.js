/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SQUID_INTEGRATOR_ID: process.env.SQUID_INTEGRATOR_ID,
    SQUID_API_URL: process.env.SQUID_API_URL || 'https://v2.api.squidrouter.com',
    PARASWAP_API_URL: process.env.PARASWAP_API_URL || 'https://apiv5.paraswap.io',
  },
}

module.exports = nextConfig

