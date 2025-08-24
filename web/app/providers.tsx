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
    // Map to app theme: primary #f7b034, secondary #f27944
    accentColor: "#f7b034",
    accentColorForeground: "#1a1408",
    actionButtonBorder: "#f27944",
    actionButtonBorderMobile: "#f27944",
    actionButtonSecondaryBackground: "#fde1a8",
    closeButton: "#E5E7EB",
    closeButtonBackground: "#f27944",
    connectButtonBackground: "#f7b034",
    connectButtonBackgroundError: "#EF4444",
    connectButtonInnerBackground: "#f9c869",
    connectButtonText: "#1a1408",
    connectButtonTextError: "#FFFFFF",
    connectionIndicator: "#22C55E",
    downloadBottomCardBackground: "#f27944",
    downloadTopCardBackground: "#f9c869",
    error: "#EF4444",
    generalBorder: "#f9c869",
    generalBorderDim: "#e8a326",
    menuItemBackground: "#2a2a2a",
    modalBackdrop: "rgba(0,0,0,0.5)",
    modalBackground: "#1F1F1F",
    modalBorder: "#2a2a2a",
    modalText: "#FFFFFF",
    modalTextDim: "#9CA3AF",
    modalTextSecondary: "#f27944",
    profileAction: "#f27944",
    profileActionHover: "#f9c869",
    profileForeground: "#2a2a2a",
    selectedOptionBorder: "#f7b034",
    standby: "#fde1a8",
  },
  fonts: {
    body: "var(--font-inter), Inter, sans-serif",
  },
  radii: {
    actionButton: "9px",
    connectButton: "12px",
    menuButton: "9px",
    modal: "16px",
    modalMobile: "28px",
  },
  shadows: {
    connectButton: "0px 4px 12px rgba(247, 176, 52, 0.35)",
    dialog: "0px 8px 32px rgba(242, 121, 68, 0.28)",
    profileDetailsAction: "0px 2px 6px rgba(242, 121, 68, 0.22)",
    selectedOption: "0px 2px 6px rgba(249, 200, 105, 0.24)",
    selectedWallet: "0px 2px 6px rgba(249, 200, 105, 0.24)",
    walletLogo: "0px 2px 16px rgba(247, 176, 52, 0.16)",
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
