import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    // Allow data URIs
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self'; sandbox;",
  },
   devIndicators: {
    allowedDevOrigins: [
        '*.cluster-l6vkdperq5ebaqo3qy4ksvoqom.cloudworkstations.dev'
    ]
  }
};

export default nextConfig;
