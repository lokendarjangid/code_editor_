/** @type {import('next').NextConfig} */
const nextConfig = {
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ]
    },

    // Disable powered by header
    poweredByHeader: false,

    // Production optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error']
        } : false
    },

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['socket.io-client']
    }
};

export default nextConfig;
