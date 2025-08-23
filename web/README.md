# QuestRewards - Web3 Quest & Reward Platform

A comprehensive Web3 quest and reward platform built with Next.js, wagmi, and smart contracts. Create engaging campaigns, manage community quests, and distribute blockchain-based rewards to participants.

## ✨ Features

### 🎯 Campaign Creation & Management

- **Comprehensive Campaign Builder**: Step-by-step wizard for creating detailed quest campaigns
- **Smart Contract Integration**: Direct blockchain deployment with automated reward distribution
- **Flexible Reward Systems**: Support for Lucky Draw and Equal Distribution methods
- **Social Media Integration**: Built-in X/Twitter task automation with verification
- **AI-Powered Assistance**: Generate campaign ideas and content with AI

### 🚀 Auto-Approval System

- **Automated Submission Processing**: No manual review needed - submissions are processed automatically
- **Smart Validation**: Validates X/Twitter post URLs and other submission formats
- **Real-time XP Awarding**: Automatically awards 60 XP when users complete all campaign tasks
- **Blockchain Integration**: Uses owner's private key to call smart contracts directly
- **Review Tab**: Campaign owners can still view all submissions in a dedicated review interface

### 👥 User Experience

- **Interactive Dashboard**: Participate in quests and track progress
- **XP & Leveling System**: Gamified experience with points and achievements
- **Real-time Progress**: Live updates on campaign participation and completion
- **Leaderboards**: Competitive rankings and community engagement
- **Multi-token Support**: USDC and SEI token rewards

### ⚡ Admin Features

- **Campaign Management**: Monitor, pause, and distribute rewards
- **User Analytics**: Track participation, engagement, and platform growth
- **Revenue Dashboard**: Platform fees and campaign performance metrics
- **Real-time Monitoring**: Live campaign status and participant activity

### 🔗 Blockchain Integration

- **SEI Network**: Optimized for fast, low-cost transactions
- **wagmi Integration**: Type-safe contract interactions
- **RainbowKit**: Seamless wallet connection experience
- **Smart Contract Events**: Real-time blockchain event monitoring

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: wagmi, viem, RainbowKit
- **Forms**: React Hook Form with Zod validation
- **UI/UX**: Framer Motion animations, Lucide icons
- **State Management**: TanStack Query for server state

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- SEI testnet tokens for testing

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pointer-landing-template/web
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment**

   ```bash
   cp env.example .env.local
   # Update with your specific values:
   # - Contract addresses after deployment
   # - API keys for services
   # - RPC URLs (SEI testnet: https://evm-rpc-testnet.sei-apis.com)
   # - Owner private key for auto-approval system
   # - SEI RPC URL for blockchain interactions
   ```

   **Important for Auto-Approval System:**

   - Set `OWNER_PRIVATE_KEY` to your campaign owner's private key (without 0x prefix)
   - Set `SEI_RPC_URL` to the SEI testnet RPC endpoint
   - The system will use these to automatically approve submissions and award XP

4. **Update contract address**

   ```typescript
   // In lib/contracts/quest-rewards-contract.ts
   export const QUEST_REWARDS_CONTRACT_ADDRESS =
     "0x3c21DB69Df3e069806AA55C4EbD54519B4504815"; // SEI Testnet
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application.

## 📋 Campaign Creation Guide

### 1. Basic Campaign Information

- **Campaign Title**: Short, action-oriented title (max 100 characters)
- **Description**: Clear explanation of goals and benefits (max 500 characters)
- **Quest Image**: Banner image URL or upload (recommended: 1200x600px)

### 2. Quest Configuration

- **Timeline**: Start/end dates (max 7-day duration)
- **Participation**: Maximum participant limit (500-1000 recommended)
- **Quest Steps**: Detailed task instructions with completion criteria
- **XP Rewards**: Experience points for each completed step

### 3. Compulsory Social Tasks

- **X/Twitter Follow**: Require following specific accounts (10 XP)
- **X/Twitter Post**: Content creation with hashtags and mentions (50 XP, 2x for verified users)
- **Custom Tasks**: Flexible task definitions with custom criteria

### 4. Reward Distribution

- **Lucky Draw**: Random selection of limited winners with higher individual rewards
- **Equal Distribution**: All participants receive equal reward shares
- **Token Support**: USDC or SEI token rewards
- **Platform Fee**: Flat $5 fee per campaign

## 🎮 User Quest Participation

### Dashboard Features

- **Available Quests**: Browse and join active campaigns
- **Active Quests**: Track progress on joined campaigns
- **Completed Quests**: View achievement history and earned rewards
- **Profile Stats**: XP, level, completed quests, total earnings
- **Leaderboard**: Community rankings and achievements

### Task Types

- **Follow Tasks**: Social media account following (10 XP base)
- **Content Creation**: Post creation with specific requirements (50 XP base)
- **Custom Tasks**: Brand-specific requirements with custom criteria
- **Verified User Bonus**: 2x XP multiplier for verified accounts

### XP System

- **Base Rewards**: Fixed XP per task type
- **Verified Multiplier**: 2x rewards for verified users
- **Level Progression**: Unlock achievements and higher tier rewards
- **Monthly Streaks**: Continuous engagement bonuses

## 🔧 Admin Dashboard

### Campaign Management

- **Real-time Monitoring**: Live participant count and progress tracking
- **Status Control**: Activate, pause, or cancel campaigns
- **Reward Distribution**: Manual and automated reward processing
- **Performance Analytics**: Participation rates and completion metrics

### User Management

- **User Profiles**: Individual participant tracking and verification
- **Activity Monitoring**: Quest completion and engagement metrics
- **Ranking System**: Leaderboard management and achievement tracking

### Platform Analytics

- **Revenue Tracking**: Platform fees and campaign value metrics
- **Growth Metrics**: User acquisition and retention analytics
- **Performance Insights**: Top-performing campaigns and optimization suggestions

## 🔐 Smart Contract Integration

### Contract Functions

```typescript
// Create new campaign
createCampaign(
  rewardToken: address,
  distributionMethod: RewardDistributionMethod,
  startTime: uint256,
  endTime: uint256,
  maxParticipants: uint256,
  totalRewardAmount: uint256,
  numberOfWinners: uint256
)

// Join campaign
joinCampaign(campaignId: uint256)

// Update participant progress
updateQuestScore(campaignId: uint256, participant: address, score: uint256)

// Distribute rewards
endCampaignAndDistribute(campaignId: uint256)
```

### Event Monitoring

- **CampaignCreated**: New campaign deployment
- **ParticipantJoined**: User registration events
- **QuestScoreUpdated**: Progress tracking
- **RewardDistributed**: Payment completion
- **WinnersSelected**: Lucky draw results

## 🎨 UI/UX Features

### Modern Design System

- **shadcn/ui Components**: Consistent, accessible component library
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Theme switching with user preference persistence
- **Smooth Animations**: Framer Motion micro-interactions
- **Loading States**: Skeleton screens and progress indicators

### Accessibility

- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG-compliant color schemes
- **Focus Management**: Clear focus indicators and logical flow

## 🤖 AI Integration

### Campaign Generation

- **Idea Generation**: AI-powered campaign suggestions based on category/difficulty
- **Content Creation**: Automated social media content with tone customization
- **Optimization**: Performance-based campaign improvement recommendations

### Content Features

- **Multi-language Support**: Generate content in multiple languages
- **Tone Customization**: Casual, formal, professional, engaging styles
- **Platform Optimization**: X/Twitter character limits and hashtag suggestions
- **Brand Voice**: Consistent messaging across campaigns

## 📊 Analytics & Metrics

### Campaign Performance

- **Participation Rate**: Percentage of max participants reached
- **Completion Rate**: Task completion vs. abandonment metrics
- **Engagement Score**: Quality of participant interactions
- **ROI Analysis**: Campaign cost vs. engagement value

### User Insights

- **Retention Rate**: User return frequency and loyalty metrics
- **Progression Tracking**: XP gain rates and level advancement
- **Task Preferences**: Popular task types and completion patterns
- **Reward Effectiveness**: Token distribution impact on behavior

## 🔒 Security & Best Practices

### Smart Contract Security

- **Access Control**: Role-based permissions for admin functions
- **Reentrancy Protection**: SafeGuards against attack vectors
- **Input Validation**: Comprehensive parameter checking
- **Emergency Functions**: Circuit breakers and pause mechanisms

### Frontend Security

- **Wallet Integration**: Secure signature verification
- **Input Sanitization**: XSS prevention and data validation
- **Environment Variables**: Secure configuration management
- **Error Handling**: Graceful failure states and user feedback

## 🚀 Deployment

### Smart Contract Deployment

1. **Deploy QuestRewardsContract**: Use Foundry or Hardhat with SEI testnet RPC: `https://evm-rpc-testnet.sei-apis.com`
2. **Verify Contract**: Etherscan/block explorer verification
3. **Update Frontend**: Set contract address in configuration
4. **Test Integration**: Verify all contract interactions

### Frontend Deployment

- **Vercel**: Optimized for Next.js applications
- **Environment Setup**: Configure production variables
- **Domain Configuration**: Custom domain and SSL setup
- **Performance Optimization**: Edge functions and caching

## 📄 API Reference

### Campaign Management

- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Cancel campaign

### User Management

- `GET /api/users/:address` - Get user profile
- `PUT /api/users/:address` - Update user profile
- `GET /api/users/:address/campaigns` - Get user campaigns
- `POST /api/users/:address/join` - Join campaign

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**: Describe changes and impact

### Development Guidelines

- **TypeScript**: Maintain strict type safety
- **Testing**: Write tests for new features
- **Documentation**: Update docs for API changes
- **Code Style**: Follow ESLint and Prettier configurations

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SEI Network**: Blockchain infrastructure
- **wagmi**: Ethereum library ecosystem
- **shadcn/ui**: Component library design system
- **RainbowKit**: Wallet connection UX
- **Vercel**: Hosting and deployment platform

---

Built with ❤️ for the Web3 community. [Join our Discord](https://discord.gg/web3) | [Follow on Twitter](https://twitter.com/questrewards)
