import DoubleRewards from "./bento/double-rewards";
import AIBrandCampaigns from "./bento/ai-brand-campaigns";
import TwitterContentGenerator from "./bento/twitter-content-generator";
import SmartContractRewards from "./bento/smart-contract-rewards";
import FullyDecentralized from "./bento/fully-decentralized";
import MultiLanguageSupport from "./bento/multi-language-support";
import { AnimatedSection } from "./animated-section";

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
);

export function BentoSection() {
  const cards = [
    {
      title: "Double Rewards",
      description:
        "Every user who completes a quest receives both pool rewards from the campaign and guaranteed platform rewards",
      Component: DoubleRewards,
    },
    {
      title: "AI Assisted Brand Campaigns",
      description:
        "Brands can create AI-powered campaign ideas and reward authentic user participation across the platform.",
      Component: AIBrandCampaigns,
    },
    {
      title: "AI Tweet Generation",
      description:
        "Generate engaging tweets in any language with advanced AI. Perfect for consistent content creation and brand campaigns.",
      Component: TwitterContentGenerator,
    },
    {
      title: "Onchain Rewards",
      description:
        "Earn cryptocurrency rewards for authentic engagement. All transactions are transparent and verifiable on the blockchain.",
      Component: SmartContractRewards,
    },
    {
      title: "Fully Decentralized",
      description:
        "No central authority controls your rewards. Smart contracts ensure fair distribution and transparent participation.",
      Component: FullyDecentralized,
    },
    {
      title: "Multi-Language Support",
      description:
        "Create content in any language to reach global audiences. Break down language barriers with AI assistance.",
      Component: MultiLanguageSupport,
    },
  ];

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />

        <AnimatedSection className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Powerful Features
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Everything you need to grow your social presence and earn rewards
              fairly
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
  );
}
