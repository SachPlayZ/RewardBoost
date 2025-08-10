"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import { getConfig } from "./config";
import { seiTestnet } from "viem/chains";
import "@sei-js/sei-global-wallet/eip6963";

const customTheme: Theme = {
  blurs: {
    modalOverlay: "blur(8px)",
  },
  colors: {
    accentColor: "#FF5722", // vibrant red-orange to match app theme
    accentColorForeground: "#FFFFFF",
    actionButtonBorder: "#E64A19",
    actionButtonBorderMobile: "#E64A19",
    actionButtonSecondaryBackground: "#FF7043",
    closeButton: "#E5E7EB",
    closeButtonBackground: "#E64A19",
    connectButtonBackground: "#FF5722",
    connectButtonBackgroundError: "#EF4444",
    connectButtonInnerBackground: "#FF8A65",
    connectButtonText: "#FFFFFF",
    connectButtonTextError: "#FFFFFF",
    connectionIndicator: "#22C55E",
    downloadBottomCardBackground: "#E64A19",
    downloadTopCardBackground: "#FF7043",
    error: "#EF4444",
    generalBorder: "#FF7043",
    generalBorderDim: "#E64A19",
    menuItemBackground: "#FF7043",
    modalBackdrop: "rgba(230, 74, 25, 0.5)",
    modalBackground: "#1F1F1F",
    modalBorder: "#FF7043",
    modalText: "#FFFFFF",
    modalTextDim: "#9CA3AF",
    modalTextSecondary: "#FF8A65",
    profileAction: "#E64A19",
    profileActionHover: "#FF7043",
    profileForeground: "#451F0D",
    selectedOptionBorder: "#FF5722",
    standby: "#FF8A65",
  },
  fonts: {
    body: "Inter, sans-serif",
  },
  radii: {
    actionButton: "9px",
    connectButton: "12px",
    menuButton: "9px",
    modal: "16px",
    modalMobile: "28px",
  },
  shadows: {
    connectButton: "0px 4px 12px rgba(255, 87, 34, 0.4)",
    dialog: "0px 8px 32px rgba(255, 87, 34, 0.32)",
    profileDetailsAction: "0px 2px 6px rgba(255, 87, 34, 0.24)",
    selectedOption: "0px 2px 6px rgba(255, 87, 34, 0.24)",
    selectedWallet: "0px 2px 6px rgba(255, 87, 34, 0.24)",
    walletLogo: "0px 2px 16px rgba(255, 87, 34, 0.16)",
  },
};

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={customTheme}
          modalSize="compact"
          initialChain={seiTestnet}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
