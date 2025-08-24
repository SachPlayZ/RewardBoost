import type React from "react";
import { BarChart3 } from "lucide-react";

const CampaignAnalytics: React.FC = () => {
  const themeVars = {
    "--analytics-primary-color": "hsl(var(--primary))",
    "--analytics-background-color": "hsl(var(--background))",
    "--analytics-text-color": "hsl(var(--foreground))",
    "--analytics-text-muted": "hsl(var(--muted-foreground))",
    "--analytics-border-color": "hsl(var(--border))",
    "--analytics-card-bg": "hsl(var(--card) / 0.8)",
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
      aria-label="Real-time campaign analytics dashboard"
    >
      {/* Main Analytics Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--analytics-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--analytics-border-color)",
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
          <BarChart3 size={16} color="var(--analytics-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--analytics-text-color)",
            }}
          >
            Campaign Performance
          </span>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              background: "hsl(var(--background) / 0.5)",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid var(--analytics-border-color)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "var(--analytics-text-muted)",
                marginBottom: "4px",
              }}
            >
              Total Reach
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--analytics-primary-color)",
              }}
            >
              2.4M
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#22c55e",
              }}
            >
              +24% ↗
            </div>
          </div>

          <div
            style={{
              background: "hsl(var(--background) / 0.5)",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid var(--analytics-border-color)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                color: "var(--analytics-text-muted)",
                marginBottom: "4px",
              }}
            >
              Engagement
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--analytics-primary-color)",
              }}
            >
              8.7%
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#22c55e",
              }}
            >
              +12% ↗
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div
          style={{
            background: "hsl(var(--background) / 0.3)",
            borderRadius: "6px",
            padding: "8px",
            height: "60px",
            display: "flex",
            alignItems: "end",
            gap: "3px",
          }}
        >
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: `linear-gradient(to top, var(--analytics-primary-color), var(--analytics-primary-color)80)`,
                borderRadius: "2px",
                height: `${height}%`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      </div>

      {/* Live Indicator */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "var(--analytics-card-bg)",
          backdropFilter: "blur(8px)",
          borderRadius: "20px",
          padding: "6px 12px",
          border: "1px solid var(--analytics-border-color)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#22c55e",
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontSize: "10px",
            color: "var(--analytics-text-color)",
            fontWeight: 500,
          }}
        >
          Live
        </span>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
