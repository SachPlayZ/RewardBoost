"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  Target,
  Plus,
  LayoutDashboard,
  Settings,
  Trophy,
  Sparkles,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      requiresAuth: true,
    },
    {
      href: "/campaigns/create",
      label: "Create Campaign",
      icon: Plus,
      requiresAuth: true,
      badge: "New",
    },
    {
      href: "/admin",
      label: "Admin",
      icon: Settings,
      requiresAuth: true,
    },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">QuestRewards</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              // Hide auth-required items if not connected
              if (item.requiresAuth && !isConnected) {
                return null;
              }

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 relative",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 h-5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Create Campaign CTA */}
            {isConnected && pathname !== "/campaigns/create" && (
              <Link href="/campaigns/create">
                <Button size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Create Quest
                </Button>
              </Link>
            )}

            {/* Connect Wallet */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
