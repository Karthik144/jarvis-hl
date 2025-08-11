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
        {/* Smart Account Demo */}
        <SmartAccountDemo />
      </main>
    </div>
  );
}
