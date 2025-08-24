import type React from "react";
import { Shield, Coins } from "lucide-react";

const SmartContractRewards: React.FC = () => {
  const themeVars = {
    "--contract-primary-color": "hsl(var(--primary))",
    "--contract-background-color": "hsl(var(--background))",
    "--contract-text-color": "hsl(var(--foreground))",
    "--contract-text-muted": "hsl(var(--muted-foreground))",
    "--contract-border-color": "hsl(var(--border))",
    "--contract-card-bg": "hsl(var(--card) / 0.8)",
  };

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
      aria-label="Smart contract reward system interface"
    >
      {/* Main Contract Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--contract-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--contract-border-color)",
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
          <Shield size={16} color="var(--contract-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--contract-text-color)",
            }}
          >
            Reward Contract
          </span>
          <div
            style={{
              background: "#22c55e20",
              color: "#22c55e",
              fontSize: "9px",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 500,
            }}
          >
            ACTIVE
          </div>
        </div>

        {/* Contract Details */}
        <div
          style={{
            background: "hsl(var(--background) / 0.5)",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid var(--contract-border-color)",
          }}
        >
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "10px",
              color: "var(--contract-text-muted)",
              marginBottom: "8px",
            }}
          >
            Contract: 0x742d35Cc6634C0532925a3b8D...
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--contract-text-muted)",
                }}
              >
                Total Pool
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--contract-primary-color)",
                }}
              >
                50,000 SEI
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--contract-text-muted)",
                }}
              >
                Participants
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--contract-text-color)",
                }}
              >
                1,247
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              background: "hsl(var(--background) / 0.5)",
              borderRadius: "4px",
              height: "6px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: "var(--contract-primary-color)",
                height: "100%",
                width: "73%",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ fontSize: "9px", color: "var(--contract-text-muted)" }}>
            Campaign ends in 2d 14h 32m
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              background: "var(--contract-primary-color)",
              color: "var(--contract-background-color)",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flex: 1,
            }}
          >
            <Coins size={12} />
            Distribute Rewards
          </button>
        </div>
      </div>

      {/* Sei Network Badge */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          background: "var(--contract-card-bg)",
          backdropFilter: "blur(8px)",
          borderRadius: "8px",
          padding: "6px 10px",
          border: "1px solid var(--contract-border-color)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "var(--contract-primary-color)",
          }}
        />
        <span
          style={{
            fontSize: "10px",
            color: "var(--contract-text-color)",
            fontWeight: 500,
          }}
        >
          Sei Network
        </span>
      </div>
    </div>
  );
};

export default SmartContractRewards;
