import type React from "react";
import { Globe, MessageSquare } from "lucide-react";

const MultiLanguageSupport: React.FC = () => {
  const themeVars = {
    "--lang-primary-color": "hsl(var(--primary))",
    "--lang-background-color": "hsl(var(--background))",
    "--lang-text-color": "hsl(var(--foreground))",
    "--lang-text-muted": "hsl(var(--muted-foreground))",
    "--lang-border-color": "hsl(var(--border))",
    "--lang-card-bg": "hsl(var(--card) / 0.8)",
  } as React.CSSProperties;

  const languages = [
    { code: "EN", name: "English", score: 98 },
    { code: "ES", name: "Español", score: 94 },
    { code: "FR", name: "Français", score: 92 },
    { code: "DE", name: "Deutsch", score: 90 },
    { code: "JP", name: "日本語", score: 88 },
    { code: "HI", name: "हिंदी", score: 86 },
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
      aria-label="Multi-language content support visualization"
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
          background: "var(--lang-card-bg)",
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          border: "1px solid var(--lang-border-color)",
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
          <Globe size={16} color="var(--lang-primary-color)" />
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--lang-text-color)",
            }}
          >
            Language Reach
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10px",
              color: "var(--lang-text-muted)",
            }}
          >
            <MessageSquare size={14} color="var(--lang-primary-color)" />
            Auto-translate
          </div>
        </div>

        {/* Language Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {languages.map((lang, i) => (
            <div
              key={i}
              style={{
                background: "hsl(var(--background) / 0.5)",
                border: "1px solid var(--lang-border-color)",
                borderRadius: "8px",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: "var(--lang-primary-color)",
                    color: "var(--lang-background-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  {lang.code}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--lang-text-color)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lang.name}
                </div>
              </div>

              {/* Score bar */}
              <div
                style={{
                  height: "4px",
                  borderRadius: "999px",
                  background: "hsl(var(--background) / 0.5)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${lang.score}%`,
                    height: "100%",
                    background: "var(--lang-primary-color)",
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

export default MultiLanguageSupport;
