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
      [seiTestnet.id]: http(),
      [sei.id]: http(),
    },
  });
}