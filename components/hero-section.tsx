"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="space-y-8">
      <Image 
        src="/CoFoundUE_logo.png" 
        alt="CoFound UE Square Logo" 
        width={220} 
        height={220} 
        className="-mt-6 rounded-3xl shadow-2xl mb-6 animate-float hover:scale-105 hover:rotate-1 hover:shadow-[0_0_50px_rgba(230,0,0,0.5)] cursor-pointer transition-all duration-500 ease-out"
        priority
      />
      <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
        Encuentra a tu <br />
        <span className="text-[#E60000]">Co-Founder</span> <br />
        en el Campus.
      </h1>
      <p className="text-xl text-gray-300 max-w-xl leading-relaxed">
        La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.
      </p>
      <div className="flex items-center gap-4 text-gray-400 text-sm">
        <span className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Comunidad Activa
        </span>
        <span className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-[#E60000]"></span>
          Solo UE
        </span>
      </div>
    </div>
  );
}
