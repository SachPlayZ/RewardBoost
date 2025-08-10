import type React from "react"
import { Calendar, Clock, Send } from "lucide-react"

const ContentScheduler: React.FC = () => {
  const themeVars = {
    "--scheduler-primary-color": "hsl(var(--primary))",
    "--scheduler-background-color": "hsl(var(--background))",
    "--scheduler-text-color": "hsl(var(--foreground))",
    "--scheduler-text-muted": "hsl(var(--muted-foreground))",
    "--scheduler-border-color": "hsl(var(--border))",
    "--scheduler-card-bg": "hsl(var(--card) / 0.8)",
  }

  const scheduledPosts = [
    { time: "2:00 PM", content: "🚀 New DeFi protocol launching...", status: "scheduled" },
    { time: "4:30 PM", content: "💎 Diamond hands holding strong...", status: "scheduled" },
    { time: "7:00 PM", content: "🌙 GM crypto fam! Today's alpha...", status: "pending" },
  ]

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
      aria-label="Content scheduling interface"
    >
      {/* Main Scheduler Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--scheduler-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--scheduler-border-color)",
          overflow: "hidden",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Calendar size={16} color="var(--scheduler-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--scheduler-text-color)",
            }}
          >
            Content Schedule
          </span>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              color: "var(--scheduler-text-muted)",
            }}
          >
            Today
          </div>
        </div>

        {/* Scheduled Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {scheduledPosts.map((post, index) => (
            <div
              key={index}
              style={{
                background: "hsl(var(--background) / 0.5)",
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid var(--scheduler-border-color)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  minWidth: "60px",
                }}
              >
                <Clock size={10} color="var(--scheduler-text-muted)" />
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--scheduler-text-muted)",
                    fontWeight: 500,
                  }}
                >
                  {post.time}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--scheduler-text-color)",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.content}
                </div>
              </div>

              <div
                style={{
                  background: post.status === "scheduled" ? "#22c55e20" : "#f59e0b20",
                  color: post.status === "scheduled" ? "#22c55e" : "#f59e0b",
                  fontSize: "8px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                }}
              >
                {post.status}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <div style={{ marginTop: "12px" }}>
          <button
            style={{
              background: "var(--scheduler-primary-color)",
              color: "var(--scheduler-background-color)",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Send size={12} />
            Schedule New Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContentScheduler
