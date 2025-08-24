import Image from "next/image";

export function SocialProof() {
  return (
    <section className="self-stretch py-16 flex flex-col justify-center items-center gap-6 overflow-hidden">
      <div className="text-center text-gray-300 text-sm font-medium leading-tight">
        Powered By:
      </div>
      <div className="self-stretch flex flex-wrap justify-center items-center gap-x-32">
        {[
          { name: "Sei", logo: "/logos/Sei.svg" },
          { name: "Dynamic", logo: "/logos/Dynamic logo light Trans.png" },
          { name: "Rivalz", logo: "/logos/Rivalz.png" },
          { name: "OpenAI", logo: "/logos/Open AI Light Trans.png" },
          { name: "Claude", logo: "/logos/Claude AI Light Trans.png" },
          { name: "Perplexity", logo: "/logos/Perplexity light Trans.png" },
        ].map((tech) => (
          <div
            key={tech.name}
            className="flex items-center justify-center w-24 h-16 hover:opacity-80 transition-opacity"
          >
            <Image
              src={tech.logo}
              alt={`${tech.name} logo`}
              width={96}
              height={64}
              className="w-full h-full object-contain grayscale opacity-70"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
