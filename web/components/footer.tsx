import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Twitter, MessageCircle, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="RewardBoost logo"
                className="h-10 w-10"
              />
              <span className="font-bold text-2xl">RewardBoost</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Revolutionizing social media presence with AI-powered campaigns
              and transparent Web3 rewards.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:hello@rewardboost.xyz"
                className="hover:text-foreground transition-colors"
              >
                hello@rewardboost.xyz
              </a>
            </div>
          </div>

          {/* Subscribe */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">
              Subscribe for Updates
            </h3>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="space-y-3">
              <a
                href="https://x.com/RewardBoostAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span>X (Twitter)</span>
              </a>
              <a
                href="https://t.me/RewardBoostAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Telegram</span>
              </a>
              <a
                href="https://www.linkedin.com/company/engageos-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 RewardBoost. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
