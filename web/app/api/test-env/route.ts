import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("🧪 Testing environment variables in Next.js context...");

  const envCheck = {
    OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY
      ? `✅ Found (${process.env.OWNER_PRIVATE_KEY.length} chars)`
      : "❌ Missing",
    SEI_RPC_URL: process.env.SEI_RPC_URL || "Using default",
    CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_QUEST_REWARDS_CONTRACT_ADDRESS || "Using default",
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log("Environment check:", envCheck);

  return NextResponse.json({
    message: "Environment variables test",
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}
