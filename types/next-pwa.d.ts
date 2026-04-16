declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    publicExcludes?: string[];
  };

  export default function withPWA(options: PWAOptions): (config: NextConfig) => NextConfig;
}

