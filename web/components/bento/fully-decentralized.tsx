import type React from "react";
import { Globe, ShieldCheck, Link } from "lucide-react";

const FullyDecentralized: React.FC = () => {
  const themeVars = {
    "--decent-primary-color": "hsl(var(--primary))",
    "--decent-background-color": "hsl(var(--background))",
    "--decent-text-color": "hsl(var(--foreground))",
    "--decent-text-muted": "hsl(var(--muted-foreground))",
    "--decent-border-color": "hsl(var(--border))",
    "--decent-card-bg": "hsl(var(--card) / 0.8)",
  } as React.CSSProperties;

  const nodes = [
    { label: "Node A", status: "active" },
    { label: "Node B", status: "active" },
    { label: "Node C", status: "syncing" },
    { label: "Node D", status: "active" },
  ];

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
      aria-label="Decentralized, peer-to-peer network visualization"
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
          background: "var(--decent-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--decent-border-color)",
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
          <Globe size={16} color="var(--decent-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--decent-text-color)",
            }}
          >
            Decentralized Network
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10px",
              color: "var(--decent-text-muted)",
            }}
          >
            <ShieldCheck size={14} color="var(--decent-primary-color)" />
            Trustless
          </div>
        </div>

        {/* Network Illustration */}
        <div
          style={{
            position: "relative",
            height: "120px",
            marginBottom: "10px",
            border: "1px dashed var(--decent-border-color)",
            borderRadius: "10px",
            padding: "10px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              background: "hsl(var(--primary) / 0.12)",
              border: "1px solid var(--decent-border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--decent-primary-color)",
              fontWeight: 700,
              fontSize: "11px",
            }}
          >
            DApp
          </div>

          {/* Satellite nodes */}
          {[
            { top: 6, left: 18 },
            { top: 10, right: 18 },
            { bottom: 10, left: 22 },
            { bottom: 6, right: 22 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "hsl(var(--background) / 0.6)",
                border: "1px solid var(--decent-border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--decent-text-color)",
                fontSize: "10px",
                ...(pos as React.CSSProperties),
              }}
            >
              <Link size={14} color="var(--decent-primary-color)" />
            </div>
          ))}
        </div>

        {/* Node Status */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {nodes.map((n, idx) => (
            <div
              key={idx}
              style={{
                background: "hsl(var(--background) / 0.5)",
                border: "1px solid var(--decent-border-color)",
                borderRadius: "8px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "10px",
                color: "var(--decent-text-color)",
              }}
            >
              <span style={{ fontWeight: 600 }}>{n.label}</span>
              <span
                style={{
                  padding: "2px 6px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  color: n.status === "active" ? "#22c55e" : "#f59e0b",
                  background: n.status === "active" ? "#22c55e20" : "#f59e0b20",
                  textTransform: "uppercase",
                }}
              >
                {n.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullyDecentralized;
