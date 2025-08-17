import TwitterContentGenerator from "./bento/twitter-content-generator"
import CampaignAnalytics from "./bento/campaign-analytics"
import Web3Integrations from "./bento/web3-integrations"
import SmartContractRewards from "./bento/smart-contract-rewards"
import MultiAgentContent from "./bento/multi-agent-content"
import ContentScheduler from "./bento/content-scheduler"
import { AnimatedSection } from "./animated-section"

const BentoCard = ({ title, description, Component, delay = 0 }) => (
  <AnimatedSection direction="up" delay={delay} className="h-full">
    <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative h-full">
      {/* Background with blur effect */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "rgba(244, 235, 231, 0.08)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
      {/* Additional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

      <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          <p className="self-stretch text-foreground text-lg font-normal leading-7">
            {title} <br />
            <span className="text-muted-foreground">{description}</span>
          </p>
        </div>
      </div>
      <div className="self-stretch h-72 relative -mt-0.5 z-10">
        <Component />
      </div>
    </div>
  </AnimatedSection>
)

export function BentoSection() {
  const cards = [
    {
      title: "AI-powered content generation.",
      description: "Create viral Twitter threads and posts automatically.",
      Component: TwitterContentGenerator,
    },
    {
      title: "Real-time campaign analytics",
      description: "Track engagement, reach, and reward distribution live.",
      Component: CampaignAnalytics,
    },
    {
      title: "Web3 platform integrations",
      description: "Connect with Twitter, Discord, and blockchain networks.",
      Component: Web3Integrations,
    },
    {
      title: "Smart contract automation",
      description: "Deploy fair reward systems and lotteries on Sei Network.",
      Component: SmartContractRewards,
    },
    {
      title: "Multi-agent content creation",
      description: "Run parallel AI agents for different content strategies.",
      Component: MultiAgentContent,
    },
    {
      title: "Instant campaign deployment",
      description: "Launch reward campaigns and content flows in minutes.",
      Component: ContentScheduler,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />

        <AnimatedSection className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Automate Your Content Empire
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Generate viral content, run fair campaigns, and reward your community with blockchain-powered automation
              on Sei Network.
            </p>
          </div>
        </AnimatedSection>

        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card, index) => (
            <BentoCard key={card.title} {...card} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}
