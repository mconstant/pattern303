/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TREASURY_WALLET?: string;
  readonly VITE_303_TOKEN_MINT?: string;
  readonly VITE_MINT_FEE_SOL?: string;
  readonly VITE_COLLECTION_ADDRESS?: string;
  readonly VITE_SOLANA_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Buffer: typeof Buffer;
  global: Window;
}
