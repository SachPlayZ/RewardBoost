import type React from "react"
import { Sparkles, Calendar, TrendingUp } from "lucide-react"

const TwitterContentGenerator: React.FC = () => {
  const themeVars = {
    "--twitter-primary-color": "hsl(var(--primary))",
    "--twitter-background-color": "hsl(var(--background))",
    "--twitter-text-color": "hsl(var(--foreground))",
    "--twitter-text-muted": "hsl(var(--muted-foreground))",
    "--twitter-border-color": "hsl(var(--border))",
    "--twitter-card-bg": "hsl(var(--card) / 0.8)",
  }

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
      aria-label="AI Twitter content generator interface"
    >
      {/* Main Content Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--twitter-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--twitter-border-color)",
          overflow: "hidden",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Sparkles size={16} color="var(--twitter-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--twitter-text-color)",
            }}
          >
            AI Content Generator
          </span>
        </div>

        {/* Generated Tweet Preview */}
        <div
          style={{
            background: "hsl(var(--background) / 0.5)",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid var(--twitter-border-color)",
          }}
        >
          <div
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "12px",
              lineHeight: "1.4",
              color: "var(--twitter-text-color)",
              marginBottom: "8px",
            }}
          >
            🚀 The future of DeFi is here! Our new yield farming protocol just launched on @SeiNetwork with:
            <br />
            <br />✅ 150% APY
            <br />✅ Zero impermanent loss
            <br />✅ Instant rewards
            <br />
            <br />
            Join 10K+ farmers already earning! 🌾
            <br />
            <br />
            #DeFi #SeiNetwork #YieldFarming
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            style={{
              background: "var(--twitter-primary-color)",
              color: "var(--twitter-background-color)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Calendar size={12} />
            Schedule
          </button>
          <button
            style={{
              background: "transparent",
              color: "var(--twitter-text-muted)",
              border: "1px solid var(--twitter-border-color)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <TrendingUp size={12} />
            Optimize
          </button>
        </div>
      </div>

      {/* Floating Metrics */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "var(--twitter-card-bg)",
          backdropFilter: "blur(8px)",
          borderRadius: "8px",
          padding: "8px 12px",
          border: "1px solid var(--twitter-border-color)",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "var(--twitter-text-muted)",
            marginBottom: "2px",
          }}
        >
          Engagement Score
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--twitter-primary-color)",
          }}
        >
          94%
        </div>
      </div>
    </div>
  )
}

export default TwitterContentGenerator
