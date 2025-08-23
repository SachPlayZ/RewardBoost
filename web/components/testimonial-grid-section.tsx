import Image from "next/image";

const testimonials = [
  {
    quote:
      "ContentFlow's AI generated content that got us 10x more engagement on Twitter. The smart contract rewards system helped us build a loyal community of 50K+ followers in just 3 months.",
    name: "Annette Black",
    company: "DeFi Protocol",
    avatar: "/images/avatars/annette-black.png",
    type: "large-teal",
  },
  {
    quote:
      "The automated campaign management saved us 20 hours per week. Our community rewards are now completely transparent and fair.",
    name: "Dianne Russell",
    company: "NFT Marketplace",
    avatar: "/images/avatars/dianne-russell.png",
    type: "small-dark",
  },
  {
    quote:
      "Running parallel content agents for different audiences increased our reach by 300%. The Sei Network integration is seamless.",
    name: "Cameron Williamson",
    company: "Web3 Gaming",
    avatar: "/images/avatars/cameron-williamson.png",
    type: "small-dark",
  },
  {
    quote:
      "The lottery system brought massive engagement to our token launch. Fair, transparent, and completely automated on-chain.",
    name: "Robert Fox",
    company: "Crypto Exchange",
    avatar: "/images/avatars/robert-fox.png",
    type: "small-dark",
  },
  {
    quote:
      "From zero to viral in weeks. ContentFlow's AI understands crypto Twitter better than most humans. Our community growth is insane.",
    name: "Darlene Robertson",
    company: "Web3 Platform",
    avatar: "/images/avatars/darlene-robertson.png",
    type: "small-dark",
  },
  {
    quote:
      "The analytics dashboard shows exactly which content drives conversions. We optimized our campaigns and 5x'd our user acquisition.",
    name: "Cody Fisher",
    company: "DeFi Yield Farm",
    avatar: "/images/avatars/cody-fisher.png",
    type: "small-dark",
  },
  {
    quote:
      "ContentFlow transformed our marketing from manual posting to an automated content empire. The smart contracts handle all rewards fairly, and our community trusts the process completely.",
    name: "Albert Flores",
    company: "Layer 1 Blockchain",
    avatar: "/images/avatars/albert-flores.png",
    type: "large-light",
  },
];

const TestimonialCard = ({ quote, name, company, avatar, type }) => {
  const isLargeCard = type.startsWith("large");
  const avatarSize = isLargeCard ? 48 : 36;
  const avatarBorderRadius = isLargeCard
    ? "rounded-[41px]"
    : "rounded-[30.75px]";
  const padding = isLargeCard ? "p-6" : "p-[30px]";

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.08)] relative ${padding}`;
  let quoteClasses = "";
  let nameClasses = "";
  let companyClasses = "";
  let backgroundElements = null;
  let cardHeight = "";
  const cardWidth = "w-full md:w-[384px]";

  if (type === "large-teal") {
    cardClasses += " bg-primary";
    quoteClasses += " text-primary-foreground text-2xl font-medium leading-8";
    nameClasses += " text-primary-foreground text-base font-normal leading-6";
    companyClasses +=
      " text-primary-foreground/60 text-base font-normal leading-6";
    cardHeight = "h-[502px]";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/large-card-background.svg')",
          zIndex: 0,
        }}
      />
    );
  } else if (type === "large-light") {
    cardClasses += " bg-[rgba(244,235,231,0.12)]";
    quoteClasses += " text-foreground text-2xl font-medium leading-8";
    nameClasses += " text-foreground text-base font-normal leading-6";
    companyClasses += " text-muted-foreground text-base font-normal leading-6";
    cardHeight = "h-[502px]";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('/images/large-card-background.svg')",
          zIndex: 0,
        }}
      />
    );
  } else {
    cardClasses +=
      " bg-card outline outline-1 outline-border outline-offset-[-1px]";
    quoteClasses += " text-foreground/80 text-[17px] font-normal leading-6";
    nameClasses += " text-foreground text-sm font-normal leading-[22px]";
    companyClasses +=
      " text-muted-foreground text-sm font-normal leading-[22px]";
    cardHeight = "h-[244px]";
  }

  return (
    <div className={`${cardClasses} ${cardWidth} ${cardHeight}`}>
      {backgroundElements}
      <div className={`relative z-10 font-normal break-words ${quoteClasses}`}>
        {quote}
      </div>
      <div className="relative z-10 flex justify-start items-center gap-3">
        <Image
          src={avatar || "/placeholder.svg"}
          alt={`${name} avatar`}
          width={avatarSize}
          height={avatarSize}
          className={`w-${avatarSize / 4} h-${
            avatarSize / 4
          } ${avatarBorderRadius}`}
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className={nameClasses}>{name}</div>
          <div className={companyClasses}>{company}</div>
        </div>
      </div>
    </div>
  );
};

export function TestimonialGridSection() {
  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start py-6 md:py-8 lg:py-14">
      <div className="self-stretch py-6 md:py-8 lg:py-14 flex flex-col justify-center items-center gap-2">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-3xl md:text-4xl lg:text-[40px] font-semibold leading-tight md:leading-tight lg:leading-[40px]">
            Powering Web3 Success Stories
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm md:text-sm lg:text-base font-medium leading-[18.20px] md:leading-relaxed lg:leading-relaxed">
            {
              "See how Web3 companies and creators are building thriving communities,"
            }{" "}
            <br />{" "}
            {
              "generating viral content, and running fair reward campaigns with ContentFlow"
            }
          </p>
        </div>
      </div>
      <div className="w-full pt-0.5 pb-4 md:pb-6 lg:pb-10 flex flex-col md:flex-row justify-center items-start gap-4 md:gap-4 lg:gap-6 max-w-[1100px] mx-auto">
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[0]} />
          <TestimonialCard {...testimonials[1]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
          <TestimonialCard {...testimonials[4]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[5]} />
          <TestimonialCard {...testimonials[6]} />
        </div>
      </div>
    </section>
  );
}
