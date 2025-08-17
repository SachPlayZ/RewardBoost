"use client"

import { AnimatedSection } from "./animated-section"
import { BarChart3, Bot, Calendar, Zap, Twitter, Shield } from "lucide-react"

const DashboardComponent = () => {
  const themeVars = {
    "--dashboard-primary": "hsl(var(--primary))",
    "--dashboard-background": "hsl(var(--background))",
    "--dashboard-foreground": "hsl(var(--foreground))",
    "--dashboard-muted": "hsl(var(--muted-foreground))",
    "--dashboard-border": "hsl(var(--border))",
    "--dashboard-card": "hsl(var(--card) / 0.8)",
  }

  return (
    <div
      style={{
        width: "100%",
        height: "700px",
        background: "var(--dashboard-background)",
        borderRadius: "16px",
        border: "1px solid var(--dashboard-border)",
        position: "relative",
        overflow: "hidden",
        ...themeVars,
      }}
    >
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-border animate-spin-slow opacity-60"
          style={{
            background: `conic-gradient(from 0deg, var(--dashboard-primary), var(--dashboard-primary)40, transparent, var(--dashboard-primary))`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            padding: "2px",
          }}
        />
      </div>

      {/* Dashboard Content */}
      <div className="relative z-10 p-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ContentFlow Dashboard</h1>
            <p className="text-muted-foreground">Web3 Content & Campaign Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 px-3 py-1 rounded-full">
              <span className="text-primary text-sm font-medium">Sei Network</span>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100%-120px)]">
          {/* Content Generator */}
          <div className="col-span-5 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Content Generator</h3>
            </div>
            <div className="bg-background/50 rounded-lg p-3 mb-4">
              <div className="text-sm text-foreground mb-2">
                🚀 The future of DeFi is here! Our new yield farming protocol just launched on @SeiNetwork with:
              </div>
              <div className="text-xs text-muted-foreground">
                ✅ 150% APY
                <br />✅ Zero impermanent loss
                <br />✅ Instant rewards
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-medium">
                Generate More
              </button>
              <button className="border border-border px-3 py-1 rounded text-xs">Schedule</button>
            </div>
          </div>

          {/* Analytics */}
          <div className="col-span-4 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Campaign Analytics</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-background/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Total Reach</div>
                <div className="text-lg font-bold text-primary">2.4M</div>
                <div className="text-xs text-green-500">+24% ↗</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Engagement</div>
                <div className="text-lg font-bold text-primary">8.7%</div>
                <div className="text-xs text-green-500">+12% ↗</div>
              </div>
            </div>
            <div className="bg-background/30 rounded-lg p-2 h-16 flex items-end gap-1">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-sm"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Smart Contracts */}
          <div className="col-span-3 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Reward Contracts</h3>
            </div>
            <div className="bg-background/50 rounded-lg p-3 mb-3">
              <div className="text-xs text-muted-foreground mb-2">Active Pool</div>
              <div className="text-lg font-bold text-primary">50,000 SEI</div>
              <div className="text-xs text-muted-foreground">1,247 participants</div>
            </div>
            <div className="bg-background/30 rounded h-2 mb-3">
              <div className="bg-primary h-full rounded" style={{ width: "73%" }} />
            </div>
            <button className="w-full bg-primary text-primary-foreground py-2 rounded text-xs font-medium">
              Distribute Rewards
            </button>
          </div>

          {/* Content Calendar */}
          <div className="col-span-4 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Content Schedule</h3>
            </div>
            <div className="space-y-2">
              {[
                { time: "2:00 PM", content: "🚀 New DeFi protocol launching...", status: "scheduled" },
                { time: "4:30 PM", content: "💎 Diamond hands holding strong...", status: "scheduled" },
                { time: "7:00 PM", content: "🌙 GM crypto fam! Today's alpha...", status: "pending" },
              ].map((post, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-2 flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-12">{post.time}</div>
                  <div className="flex-1 text-xs text-foreground truncate">{post.content}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      post.status === "scheduled"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {post.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents */}
          <div className="col-span-4 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Agents</h3>
              <div className="ml-auto bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">3 ACTIVE</div>
            </div>
            <div className="space-y-2">
              {[
                { name: "Viral Agent", task: "Creating trending content", progress: 85 },
                { name: "Community Agent", task: "Engaging followers", progress: 92 },
                { name: "Analytics Agent", task: "Optimizing performance", progress: 67 },
              ].map((agent, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-foreground">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.progress}%</div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{agent.task}</div>
                  <div className="bg-background/30 rounded h-1">
                    <div
                      className="bg-primary h-full rounded transition-all duration-300"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Integrations */}
          <div className="col-span-4 bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Twitter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Integrations</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Twitter", status: "connected", color: "#1DA1F2" },
                { name: "Discord", status: "connected", color: "#5865F2" },
                { name: "Telegram", status: "pending", color: "#0088cc" },
                { name: "MetaMask", status: "connected", color: "#f6851b" },
              ].map((integration, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: integration.color }} />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">{integration.name}</div>
                    <div
                      className={`text-xs ${integration.status === "connected" ? "text-green-500" : "text-yellow-500"}`}
                    >
                      {integration.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}

export function DashboardPreview() {
  return (
    <AnimatedSection direction="scale" delay={0.3}>
      <div className="w-[calc(100vw-32px)] md:w-[1160px]">
        <div className="bg-gradient-to-br from-primary/20 via-primary-light/10 to-transparent rounded-2xl p-3 shadow-2xl border border-primary/30 backdrop-blur-sm">
          <DashboardComponent />
        </div>
      </div>
    </AnimatedSection>
  )
}
