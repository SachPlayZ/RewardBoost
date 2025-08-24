import type React from "react";
import { Coins, Gift, Plus } from "lucide-react";

const DoubleRewards: React.FC = () => {
  const themeVars = {
    "--double-primary-color": "hsl(var(--primary))",
    "--double-background-color": "hsl(var(--background))",
    "--double-text-color": "hsl(var(--foreground))",
    "--double-text-muted": "hsl(var(--muted-foreground))",
    "--double-border-color": "hsl(var(--border))",
    "--double-card-bg": "hsl(var(--card) / 0.8)",
  } as React.CSSProperties;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "transparent",
        ...themeVars,
      }}
      role="img"
      aria-label="Double rewards visualization: campaign pool + platform bonus"
    >
      {/* Main Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--double-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--double-border-color)",
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
            marginBottom: "12px",
          }}
        >
          <Coins size={16} color="var(--double-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--double-text-color)",
            }}
          >
            Double Rewards
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "hsl(var(--primary) / 0.12)",
              color: "var(--double-primary-color)",
              border: "1px solid var(--double-border-color)",
              padding: "2px 6px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            <Plus size={12} />
            x2
          </div>
        </div>

        {/* Reward Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "hsl(var(--background) / 0.5)",
              border: "1px solid var(--double-border-color)",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "var(--double-primary-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--double-background-color)",
              }}
            >
              <Coins size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--double-text-color)",
                }}
              >
                Campaign Pool Reward
              </div>
              <div
                style={{
                  marginTop: "6px",
                  height: "5px",
                  background: "hsl(var(--background) / 0.5)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "72%",
                    height: "100%",
                    background: "var(--double-primary-color)",
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--double-primary-color)",
              }}
            >
              +720
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "hsl(var(--background) / 0.5)",
              border: "1px solid var(--double-border-color)",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, var(--double-primary-color), transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--double-primary-color)",
                border: "1px solid var(--double-border-color)",
              }}
            >
              <Gift size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--double-text-color)",
                }}
              >
                Guaranteed Platform Bonus
              </div>
              <div
                style={{
                  marginTop: "6px",
                  height: "5px",
                  background: "hsl(var(--background) / 0.5)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "28%",
                    height: "100%",
                    background: "var(--double-primary-color)",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--double-primary-color)",
              }}
            >
              +280
            </div>
          </div>
        </div>

        {/* Total */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "hsl(var(--background) / 0.5)",
            border: "1px solid var(--double-border-color)",
            borderRadius: "10px",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--double-text-muted)",
              fontSize: "11px",
            }}
          >
            <span>Total Earned</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--double-primary-color)",
              fontWeight: 800,
              fontSize: "14px",
            }}
          >
            <Coins size={14} /> 1,000
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubleRewards;
