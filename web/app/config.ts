import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { sei, seiTestnet } from "viem/chains";

export function getConfig() {
  return createConfig({
    chains: [seiTestnet, sei],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [seiTestnet.id]: http(
        process.env.NEXT_PUBLIC_RPC_URL_SEI_TESTNET || 
        "https://evm-rpc-testnet.sei-apis.com"
      ),
      [sei.id]: http(
        process.env.NEXT_PUBLIC_RPC_URL_SEI_MAINNET || 
        "https://rpc.sei.com"
      ),
    },
  });
}