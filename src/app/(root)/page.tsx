"use client";
import Login from "@/components/modules/Login";
import Image from "next/image";

export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-evenly py-32 px-16 bg-white sm:items-start">
        <Image
          className="w-auto h-auto"
          src="/OJT Connect.svg"
          alt="OJT Connect logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            OJT Connect Admin
          </h1>
          <Login />
        </div>
      </main>
    </div>
  );
}
