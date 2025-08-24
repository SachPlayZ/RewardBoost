import type React from "react";
import { Bot, Zap, Target } from "lucide-react";

const MultiAgentContent: React.FC = () => {
  const themeVars = {
    "--agent-primary-color": "hsl(var(--primary))",
    "--agent-background-color": "hsl(var(--background))",
    "--agent-text-color": "hsl(var(--foreground))",
    "--agent-text-muted": "hsl(var(--muted-foreground))",
    "--agent-border-color": "hsl(var(--border))",
    "--agent-card-bg": "hsl(var(--card) / 0.8)",
  };

  const agents = [
    {
      name: "Viral Agent",
      task: "Creating trending content",
      status: "active",
      progress: 85,
      icon: <Zap size={12} />,
    },
    {
      name: "Community Agent",
      task: "Engaging with followers",
      status: "active",
      progress: 92,
      icon: <Target size={12} />,
    },
    {
      name: "Analytics Agent",
      task: "Optimizing performance",
      status: "processing",
      progress: 67,
      icon: <Bot size={12} />,
    },
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
      aria-label="Multi-agent content creation system"
    >
      {/* Main Agent Panel */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "340px",
          height: "240px",
          background: "var(--agent-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--agent-border-color)",
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
          <Bot size={16} color="var(--agent-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--agent-text-color)",
            }}
          >
            AI Content Agents
          </span>
          <div
            style={{
              marginLeft: "auto",
              background: "#22c55e20",
              color: "#22c55e",
              fontSize: "9px",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: 500,
            }}
          >
            3 ACTIVE
          </div>
        </div>

        {/* Agent List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {agents.map((agent, index) => (
            <div
              key={index}
              style={{
                background: "hsl(var(--background) / 0.5)",
                borderRadius: "8px",
                padding: "12px",
                border: "1px solid var(--agent-border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    background: "var(--agent-primary-color)",
                    borderRadius: "4px",
                    padding: "4px",
                    color: "var(--agent-background-color)",
                  }}
                >
                  {agent.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--agent-text-color)",
                      marginBottom: "2px",
                    }}
                  >
                    {agent.name}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "var(--agent-text-muted)",
                    }}
                  >
                    {agent.task}
                  </div>
                </div>

                <div
                  style={{
                    background:
                      agent.status === "active" ? "#22c55e20" : "#f59e0b20",
                    color: agent.status === "active" ? "#22c55e" : "#f59e0b",
                    fontSize: "8px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                  }}
                >
                  {agent.status}
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  background: "hsl(var(--background) / 0.5)",
                  borderRadius: "4px",
                  height: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "var(--agent-primary-color)",
                    height: "100%",
                    width: `${agent.progress}%`,
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiAgentContent;
