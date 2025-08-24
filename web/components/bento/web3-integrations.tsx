import type React from "react";

const Web3Integrations: React.FC = () => {
  const themeVars = {
    "--web3-primary-color": "hsl(var(--primary))",
    "--web3-background-color": "hsl(var(--background))",
    "--web3-text-color": "hsl(var(--foreground))",
    "--web3-text-muted": "hsl(var(--muted-foreground))",
    "--web3-border-color": "hsl(var(--border))",
    "--web3-card-bg": "hsl(var(--card) / 0.8)",
  };

  const integrations = [
    { name: "Twitter", status: "connected", color: "#1DA1F2" },
    { name: "Discord", status: "connected", color: "#5865F2" },
    {
      name: "Sei Network",
      status: "connected",
      color: "var(--web3-primary-color)",
    },
    { name: "Telegram", status: "pending", color: "#0088cc" },
    { name: "MetaMask", status: "connected", color: "#f6851b" },
    { name: "WalletConnect", status: "available", color: "#3b99fc" },
  ];

  return (
    <div
      style={
        {
          width: "100%",
          height: "100%",
          position: "relative",
          background: "transparent",
          ...themeVars,
        } as React.CSSProperties
      }
      role="img"
      aria-label="Web3 platform integrations interface"
    >
      {/* Main Integration Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--web3-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--web3-border-color)",
          overflow: "hidden",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "4px",
              background: "var(--web3-primary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--web3-background-color)",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--web3-text-color)",
            }}
          >
            Platform Integrations
          </span>
        </div>

        {/* Integration Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {integrations.map((integration, index) => (
            <div
              key={index}
              style={{
                background: "hsl(var(--background) / 0.5)",
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid var(--web3-border-color)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  background: integration.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    background: "white",
                    opacity: 0.9,
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--web3-text-color)",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {integration.name}
                </div>
                <div
                  style={{
                    fontSize: "8px",
                    color:
                      integration.status === "connected"
                        ? "#22c55e"
                        : integration.status === "pending"
                        ? "#f59e0b"
                        : "var(--web3-text-muted)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                  }}
                >
                  {integration.status}
                </div>
              </div>

              {integration.status === "connected" && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Web3Integrations;
