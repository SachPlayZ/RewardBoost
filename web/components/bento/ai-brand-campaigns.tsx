import type React from "react";
import { Brain, Megaphone, BadgeCheck } from "lucide-react";

const AIBrandCampaigns: React.FC = () => {
  const themeVars = {
    "--brand-primary-color": "hsl(var(--primary))",
    "--brand-background-color": "hsl(var(--background))",
    "--brand-text-color": "hsl(var(--foreground))",
    "--brand-text-muted": "hsl(var(--muted-foreground))",
    "--brand-border-color": "hsl(var(--border))",
    "--brand-card-bg": "hsl(var(--card) / 0.8)",
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
      aria-label="AI assisted brand campaigns visualization"
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
          background: "var(--brand-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--brand-border-color)",
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
          <Brain size={16} color="var(--brand-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--brand-text-color)",
            }}
          >
            AI Campaign Builder
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10px",
              color: "var(--brand-text-muted)",
            }}
          >
            <BadgeCheck size={14} color="var(--brand-primary-color)" /> Brand
            Safe
          </div>
        </div>

        {/* Idea + Brand Match */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          {/* AI Idea Card */}
          <div
            style={{
              background: "hsl(var(--background) / 0.5)",
              border: "1px solid var(--brand-border-color)",
              borderRadius: "10px",
              padding: "10px",
              minHeight: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  background: "var(--brand-primary-color)",
                  color: "var(--brand-background-color)",
                  borderRadius: "6px",
                  padding: "4px",
                }}
              >
                <Brain size={14} />
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--brand-text-color)",
                }}
              >
                Idea: #MakeItYours
              </div>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--brand-text-muted)",
                lineHeight: 1.5,
              }}
            >
              UGC challenge inviting fans to show how they use the product
              daily. Best entries win exclusive perks.
            </div>
          </div>

          {/* Brand Alignment Card */}
          <div
            style={{
              background: "hsl(var(--background) / 0.5)",
              border: "1px solid var(--brand-border-color)",
              borderRadius: "10px",
              padding: "10px",
              minHeight: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-primary-color), transparent)",
                  color: "var(--brand-primary-color)",
                  borderRadius: "6px",
                  padding: "4px",
                  border: "1px solid var(--brand-border-color)",
                }}
              >
                <Megaphone size={14} />
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--brand-text-color)",
                }}
              >
                Brand Alignment
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              {[
                { label: "Tone", value: "Playful" },
                { label: "Audience", value: "Gen Z" },
                { label: "CTA", value: "Join Challenge" },
                { label: "Hashtags", value: "#MakeItYours" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "10px",
                    background: "hsl(var(--background) / 0.5)",
                    border: "1px solid var(--brand-border-color)",
                    borderRadius: "6px",
                    padding: "6px",
                    color: "var(--brand-text-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "6px",
                  }}
                >
                  <span style={{ opacity: 0.7 }}>{item.label}</span>
                  <span
                    style={{
                      color: "var(--brand-primary-color)",
                      fontWeight: 600,
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Approval Row */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "hsl(var(--background) / 0.5)",
            border: "1px solid var(--brand-border-color)",
            borderRadius: "10px",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--brand-text-muted)" }}>
            Brand Guidelines Check
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#22c55e",
              fontWeight: 700,
            }}
          >
            <BadgeCheck size={14} /> Passed
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBrandCampaigns;
