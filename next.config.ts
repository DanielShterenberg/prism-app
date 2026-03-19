import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // unsafe-eval is required by Firebase Auth's Google Sign-In popup flow
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com https://*.firebaseapp.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
