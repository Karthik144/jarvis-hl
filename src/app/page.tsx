import Image from "next/image";
import { SmartAccountDemo } from "@/components/SmartAccountDemo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/next.svg"
                alt="Jarvis-HL"
                width={120}
                height={25}
                className="dark:invert"
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Jarvis-HL
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              AI Assistant with Account Abstraction
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Jarvis-HL
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            A full-stack AI assistant with Web3 capabilities, smart contract interactions, and account abstraction powered by Privy + ZeroDev
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              🤖 AI Integration
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              🌐 Web3 Ready
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              ⚡ Account Abstraction
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              🔗 Smart Contracts
            </span>
          </div>
        </div>

        {/* Smart Account Demo */}
        <SmartAccountDemo />
      </main>
    </div>
  );
}
