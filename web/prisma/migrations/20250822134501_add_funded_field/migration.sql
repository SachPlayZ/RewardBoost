-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationLogo" TEXT,
    "questBanner" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "rewardAmount" DOUBLE PRECISION NOT NULL,
    "rewardType" TEXT NOT NULL,
    "distributionMethod" TEXT NOT NULL,
    "numberOfWinners" INTEGER,
    "ownerWallet" TEXT NOT NULL,
    "funded" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "instruction" TEXT,
    "completionCriteria" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "accountToFollow" TEXT,
    "postLimit" INTEGER,
    "hashtags" TEXT[],
    "accountsToTag" TEXT[],
    "customTitle" TEXT,
    "customDescription" TEXT,
    "qpReward" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "taskId" TEXT,
    "userWallet" TEXT NOT NULL,
    "submissionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "taskData" JSONB,
    "twitterUsername" TEXT,
    "twitterPostUrl" TEXT,
    "proofImage" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifierNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitter_auth" (
    "id" TEXT NOT NULL,
    "userWallet" TEXT NOT NULL,
    "twitterId" TEXT,
    "twitterUsername" TEXT,
    "twitterName" TEXT,
    "twitterProfileImage" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "state" TEXT,
    "codeVerifier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "twitterAuthId" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submissions_userWallet_campaignId_taskId_key" ON "submissions"("userWallet", "campaignId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_auth_userWallet_key" ON "twitter_auth"("userWallet");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_auth_twitterId_key" ON "twitter_auth"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_walletAddress_key" ON "user_profiles"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_twitterAuthId_key" ON "user_profiles"("twitterAuthId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_twitterAuthId_fkey" FOREIGN KEY ("twitterAuthId") REFERENCES "twitter_auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
