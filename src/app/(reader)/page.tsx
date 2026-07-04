import Image from 'next/image';
import { siteConfig } from '@/site.config';

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/portrait.webp"
          alt="Jonathan Wagner"
          width={400}
          height={304}
          priority
          className="h-auto w-56 select-none sm:w-64"
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-50">{siteConfig.title}</h1>
      </div>

      <div className="mt-8 space-y-4 text-lg leading-relaxed text-neutral-300">
        <p>I&apos;m Jonathan Wagner. I started programming in 1980, at twelve, on a TRS-80 Model 1 (Level 1, 4K of RAM). I learned BASIC from a book and taught myself to type with one hand while I held the book in the other.</p>
        <p>I&apos;ve been learning ever since. I remember when neural nets were brand new and AI was a pipe dream, when the internet was gopher-net and the World Wide Web didn&apos;t exist yet. Languages, protocols, anything and everything.</p>
        <p>The name Xanthakita goes back to my teens. I found the writing of Piers Anthony and fell hard for his Xanth series. Years later I came to know Akitas, back when they were all simply Akitas, before the American Akita and the Akita Inu were split into two breeds. My first girl was Xena. I planned to show and breed her under a kennel I was going to call Xanth Akitas, and that is where the name comes from. I never did get to breed her, but I held onto the identity, and the domain, all these years.</p>
        <p>Life filled in around the code. I&apos;ve been married since 1989, and my wife and I raised three sons: Kenneth, Riley, and Jesse.</p>
        <p>Now LLMs let me jump straight from an idea to a made thing. This is where I keep the projects, stories, and thoughts.</p>
      </div>
    </div>
  );
}
