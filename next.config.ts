import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jsdom", "bgutils-js", "@asamuzakjp/css-color"],
  outputFileTracingIncludes: {
    "/api/convert": [
      "./node_modules/jsdom/**/*",
      "./node_modules/bgutils-js/**/*",
      "./node_modules/@asamuzakjp/**/*",
      "./node_modules/@csstools/**/*",
      "./node_modules/@bramus/**/*",
      "./node_modules/@exodus/**/*",
      "./node_modules/css-tree/**/*",
      "./node_modules/parse5/**/*",
      "./node_modules/tough-cookie/**/*",
      "./node_modules/undici/**/*",
      "./node_modules/whatwg-url/**/*",
      "./node_modules/whatwg-mimetype/**/*",
      "./node_modules/xml-name-validator/**/*",
      "./node_modules/w3c-xmlserializer/**/*",
      "./node_modules/html-encoding-sniffer/**/*",
      "./node_modules/saxes/**/*",
      "./node_modules/symbol-tree/**/*",
      "./node_modules/data-urls/**/*",
      "./node_modules/decimal.js/**/*",
      "./node_modules/is-potential-custom-element-name/**/*",
      "./node_modules/webidl-conversions/**/*",
      "./node_modules/lru-cache/**/*",
    ],
  },
};

export default nextConfig;
