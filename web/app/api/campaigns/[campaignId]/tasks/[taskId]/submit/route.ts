import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { ethers } from "ethers";
import QUEST_REWARDS_ABI from "@/lib/contracts/quest-rewards-contract-abi.json";

// Contract address - using the same as frontend
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QUEST_REWARDS_CONTRACT_ADDRESS || "0xf4940943311834a38A23F01732A02cE09d8e954A";

// Function to validate X/Twitter post URL
function isValidTwitterPostUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Check if it's a valid X/Twitter URL
    if (!urlObj.hostname.includes('x.com') && !urlObj.hostname.includes('twitter.com')) {
      return false;
    }

    // Check if it has the expected path structure for a post
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length < 2) {
      return false;
    }

    // Should have username/status/postId structure
    if (pathParts[1] !== 'status') {
      return false;
    }

    // Post ID should be numeric and reasonable length
    const postId = pathParts[2];
    return /^\d{10,}$/.test(postId);
  } catch {
    return false;
  }
}

// Function to get owner's private key from environment
function getOwnerPrivateKey(): string | null {
  const privateKey = process.env.OWNER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("OWNER_PRIVATE_KEY not found in environment variables");
    return null;
  }
  return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
}

// Function to update quest score on blockchain
async function updateQuestScoreOnBlockchain(
  campaignId: string,
  participantAddress: string,
  score: number
): Promise<boolean> {
  try {
    console.log("🔐 Checking for owner private key...");
    const privateKey = getOwnerPrivateKey();
    if (!privateKey) {
      console.error("❌ Cannot update quest score: Owner private key not found in environment variables");
      console.error("💡 Make sure OWNER_PRIVATE_KEY is set in your .env file");
      return false;
    }

    console.log("🔗 Connecting to blockchain provider...");
    const rpcUrl = process.env.SEI_RPC_URL || "https://evm-rpc-testnet.sei-apis.com";
    console.log(`📍 Using RPC URL: ${rpcUrl}`);

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Test provider connection
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

    // Create wallet from private key
    console.log("🔑 Creating wallet from private key...");
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Wallet address: ${wallet.address}`);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} SEI`);

    // Create contract instance
    console.log("📋 Creating contract instance...");
    console.log(`🎯 Contract address: ${CONTRACT_ADDRESS}`);
    console.log(`📄 Contract ABI: ${JSON.stringify(QUEST_REWARDS_ABI)}`);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_REWARDS_ABI, wallet);

    console.log(`🔄 Preparing quest score update transaction...`);
    console.log(`📊 Campaign ID: ${campaignId}`);
    console.log(`👤 Participant: ${participantAddress}`);
    console.log(`⭐ Score to award: ${score}`);

    // Estimate gas first
    console.log("⛽ Estimating gas for transaction...");
    const estimatedGas = await contract.updateQuestScore.estimateGas(
      BigInt(campaignId),
      participantAddress,
      BigInt(score)
    );
    console.log(`⛽ Estimated gas: ${estimatedGas.toString()}`);

    // Get current gas price
    const gasPrice = await provider.getFeeData();
    console.log(`💵 Current gas price: ${gasPrice.gasPrice} wei`);

    // Call updateQuestScore function
    console.log("🚀 Submitting transaction...");
    const tx = await contract.updateQuestScore(
      BigInt(campaignId),
      participantAddress,
      BigInt(score)
    );

    console.log(`⏳ Transaction submitted successfully!`);
    console.log(`🔗 Transaction hash: ${tx.hash}`);
    console.log(`📊 Transaction details:`, {
      to: tx.to,
      from: tx.from,
      data: tx.data,
      gasLimit: tx.gasLimit?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      value: tx.value?.toString()
    });

    // Wait for confirmation
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();

    console.log(`✅ Quest score updated successfully!`);
    console.log(`📦 Transaction receipt:`, {
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      transactionHash: receipt.hash,
      gasUsed: receipt.gasUsed?.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
      status: receipt.status
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to update quest score on blockchain:", error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error("🔍 Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      // Check for common blockchain errors
      if (error.message.includes("insufficient funds")) {
        console.error("💰 INSUFFICIENT FUNDS: The wallet doesn't have enough SEI to pay for gas");
        console.error("💡 Make sure the owner wallet has enough SEI for transaction fees");
      } else if (error.message.includes("nonce")) {
        console.error("🔢 NONCE ERROR: Check if there are pending transactions");
      } else if (error.message.includes("execution reverted")) {
        console.error("🚫 CONTRACT REVERT: The smart contract rejected the transaction");
        console.error("💡 Check if the campaign exists and the participant is valid");
      } else if (error.message.includes("network")) {
        console.error("🌐 NETWORK ERROR: Cannot connect to blockchain");
        console.error("💡 Check your SEI_RPC_URL configuration");
      }
    }

    return false;
  }
}

// Function to check if user has completed all tasks and award quest points
async function checkAndAwardQuestPoints(
  campaignId: string,
  userWallet: string,
  campaign: any
): Promise<void> {
  try {
    console.log(`🔍 Checking quest completion for user ${userWallet} in campaign ${campaignId}`);

    // Get all tasks for this campaign
    const allTasks = await prisma.task.findMany({
      where: { campaignId },
      select: { id: true }
    });

    if (allTasks.length === 0) {
      console.log("No tasks found for campaign");
      return;
    }

    // Get all approved submissions for this user
    const approvedSubmissions = await prisma.submission.findMany({
      where: {
        campaignId,
        userWallet,
        submissionType: "task_completion",
        status: "approved"
      },
      select: { taskId: true }
    });

    // Check if user has completed all tasks
    const completedTaskIds = new Set(approvedSubmissions.map(s => s.taskId));
    const totalTasks = allTasks.length;
    const completedTasks = completedTaskIds.size;

    console.log(`📊 User ${userWallet} has completed ${completedTasks}/${totalTasks} tasks`);

    if (completedTasks >= totalTasks) {
      // User has completed all tasks, award 60 XP
      console.log(`🎉 User ${userWallet} completed all tasks! Awarding 60 XP`);

      // Get the blockchain campaign ID
      const blockchainCampaignId = campaign.blockchainCampaignId;
      if (!blockchainCampaignId) {
        console.error("❌ Cannot award XP: Campaign not funded on blockchain");
        return;
      }

      // Update quest score on blockchain
      const success = await updateQuestScoreOnBlockchain(
        blockchainCampaignId,
        userWallet,
        60 // Award 60 XP as requested
      );

      if (success) {
        console.log(`✅ Successfully awarded 60 XP to ${userWallet} for completing all tasks in campaign ${campaignId}`);
      } else {
        console.error(`❌ Failed to award XP to ${userWallet} for campaign ${campaignId}`);
      }
    }
  } catch (error) {
    console.error("❌ Error checking quest completion:", error);
  }
}

const TaskSubmissionSchema = z.object({
  userWallet: z.string().min(1),
  taskType: z.enum(["x_follow", "x_post", "custom"]),
  submissionData: z.any(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string; taskId: string }> }
) {
  try {
    const { campaignId, taskId } = await params;
    const body = await req.json();
    const { userWallet, taskType, submissionData } = TaskSubmissionSchema.parse(body);

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { tasks: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if task exists in campaign
    const task = campaign.tasks.find(t => t.id === taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found in campaign" },
        { status: 404 }
      );
    }

    // Check if user has joined the campaign
    const userSubmission = await prisma.submission.findFirst({
      where: {
        campaignId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "full_quest",
      },
    });

    if (!userSubmission) {
      return NextResponse.json(
        { error: "User has not joined this campaign" },
        { status: 400 }
      );
    }

    // Check if task submission already exists
    const existingTaskSubmission = await prisma.submission.findFirst({
      where: {
        campaignId,
        taskId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "task_completion",
      },
    });

    if (existingTaskSubmission) {
      return NextResponse.json(
        { error: "Task already submitted" },
        { status: 400 }
      );
    }

    // Validate submission data for auto-approval
    let autoApproved = false;
    let approvalReason = "";

    if (taskType === "x_post" && submissionData?.twitterPostUrl) {
      // Auto-approve if it's a valid X post URL
      if (isValidTwitterPostUrl(submissionData.twitterPostUrl)) {
        autoApproved = true;
        approvalReason = "Valid X post URL detected";
      } else {
        approvalReason = "Invalid X post URL format";
      }
    } else if (taskType === "x_follow") {
      // For follow tasks, we'll auto-approve them for now
      // In a real implementation, you might want to verify the follow relationship
      autoApproved = true;
      approvalReason = "X follow task auto-approved";
    }

    // Create task submission with auto-approval status
    const submission = await prisma.submission.create({
      data: {
        campaignId,
        taskId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "task_completion",
        status: autoApproved ? "approved" : "pending",
        verifiedAt: autoApproved ? new Date() : null,
        verifierNotes: autoApproved ? approvalReason : null,
        taskData: {
          ...submissionData,
          taskQpReward: task.qpReward || 0, // Include the task's QP reward
          autoApproved,
          approvalReason,
        },
      },
    });

    // If auto-approved, check if user has completed all tasks
    if (autoApproved) {
      await checkAndAwardQuestPoints(campaignId, userWallet.toLowerCase(), campaign);
    }

    return NextResponse.json({
      success: true,
      message: autoApproved
        ? "Task submitted and auto-approved successfully"
        : "Task submitted successfully and is pending review",
      submission: {
        id: submission.id,
        campaignId: submission.campaignId,
        taskId: submission.taskId,
        userWallet: submission.userWallet,
        status: submission.status,
        taskData: submission.taskData,
        qpReward: task.qpReward || 0,
        createdAt: submission.createdAt,
        autoApproved,
        approvalReason,
      },
    });

  } catch (error) {
    console.error("Task submission error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string; taskId: string }> }
) {
  try {
    const { campaignId, taskId } = await params;
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");
    const action = searchParams.get("action");

    // Test blockchain connection
    if (action === "test_blockchain") {
      console.log("🧪 Testing blockchain connection...");

      const privateKey = getOwnerPrivateKey();
      if (!privateKey) {
        return NextResponse.json({
          success: false,
          error: "Owner private key not found",
          message: "Make sure OWNER_PRIVATE_KEY is set in your .env file"
        }, { status: 400 });
      }

      try {
        const provider = new ethers.JsonRpcProvider(process.env.SEI_RPC_URL || "https://evm-rpc-testnet.sei-apis.com");
        const wallet = new ethers.Wallet(privateKey, provider);

        const network = await provider.getNetwork();
        const balance = await provider.getBalance(wallet.address);

        return NextResponse.json({
          success: true,
          blockchain_test: {
            connected: true,
            network: network.name,
            chainId: network.chainId,
            wallet_address: wallet.address,
            balance_sei: ethers.formatEther(balance),
            contract_address: CONTRACT_ADDRESS
          }
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: "Blockchain connection failed",
          details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
      }
    }

    if (!userWallet) {
      return NextResponse.json(
        { error: "User wallet address is required" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.findFirst({
      where: {
        campaignId,
        taskId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "task_completion",
      },
    });

    return NextResponse.json({
      success: true,
      submission: submission ? {
        id: submission.id,
        status: submission.status,
        taskData: submission.taskData,
        createdAt: submission.createdAt,
        verifiedAt: submission.verifiedAt,
        verifierNotes: submission.verifierNotes,
      } : null,
    });

  } catch (error) {
    console.error("Task submission fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}