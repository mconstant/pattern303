/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TREASURY_WALLET?: string;
  readonly VITE_MINT_FEE_SOL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Buffer: typeof Buffer;
  global: Window;
}
