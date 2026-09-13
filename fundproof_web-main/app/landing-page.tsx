'use client';

import { ShieldCheck, Zap, Lock, ArrowRight, ChevronDown, GitBranch, BookCopy, Rss } from 'lucide-react';
import { useState } from 'react';

type LandingPageProps = {
  onGetStarted: () => void;
};

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800/50 py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <span className="text-lg font-medium text-slate-100">{q}</span>
        <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <p className="mt-4 text-slate-400">{a}</p>}
    </div>
  );
};

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background Gradient Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] opacity-30"
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2.5 rounded-xl">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">FundProof</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="hidden sm:inline-flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 text-sm font-medium py-2.5 px-5 rounded-xl transition-all"
        >
          Launch App <ArrowRight size={16} />
        </button>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-28 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6 leading-tight">
            Prove Your Funds, Preserve Your Privacy
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Generate a zero-knowledge proof to cryptographically verify your Stellar USDC balance without revealing the exact amount.
          </p>
          <button 
            onClick={onGetStarted}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-slate-900/50 border-y border-slate-800/50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">A simple, three-step process to generate your proof of funds.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full text-2xl font-bold mb-6">1</div>
                <h3 className="text-xl font-semibold mb-2">Connect & Set Threshold</h3>
                <p className="text-slate-400">Connect your Freighter wallet and specify the minimum balance you want to prove (e.g., $1,000).</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full text-2xl font-bold mb-6">2</div>
                <h3 className="text-xl font-semibold mb-2">Generate Proof</h3>
                <p className="text-slate-400">Your browser generates a zk-SNARK proof, confirming your balance is above the threshold without revealing it.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full text-2xl font-bold mb-6">3</div>
                <h3 className="text-xl font-semibold mb-2">Share & Verify</h3>
                <p className="text-slate-400">You get a shareable link. Anyone with the link can verify your claim without seeing your address or balance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Use FundProof?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">From DeFi to digital identity, private fund verification has many applications.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-3">DeFi & Airdrops</h3>
                <p className="text-slate-400">Prove eligibility for token-gated communities or airdrops without doxxing your net worth.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-3">Rental & Loan Applications</h3>
                <p className="text-slate-400">Demonstrate financial stability to landlords or lenders without sharing sensitive bank statements.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-3">Venture Capital & Angel Investing</h3>
                <p className="text-slate-400">Verify accredited investor status or proof of capital to participate in investment rounds privately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 bg-slate-900/50 border-y border-slate-800/50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Powered by Cutting-Edge Tech</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">FundProof is built on a foundation of privacy-preserving and decentralized technologies.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <Lock size={24} className="text-blue-400" />
                  <h3 className="text-2xl font-bold">Zero-Knowledge Proofs</h3>
                </div>
                <p className="text-slate-400">We use zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) to generate proofs. This allows you to prove a statement (e.g., "I have more than $1,000") is true without revealing any other information. The entire proof generation happens in your browser, so your private data never leaves your machine.</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <svg width="24" height="24" viewBox="0 0 120 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                    <path d="M60 40C26.86 40 0 31.05 0 20S26.86 0 60 0s60 8.95 60 20-26.86 20-60 20zm0-8.5c27.61 0 50-6.94 50-11.5S87.61 8.5 60 8.5 10 15.44 10 20s22.39 11.5 50 11.5z" />
                    <path d="M60 25.25c-16.57 0-30-4.14-30-5.25s13.43-5.25 30-5.25 30 4.14 30 5.25-13.43 5.25-30 5.25z" />
                  </svg>
                  <h3 className="text-2xl font-bold">Stellar Network</h3>
                </div>
                <p className="text-slate-400">FundProof leverages the speed, low cost, and reliability of the Stellar network. We use the Horizon API to securely fetch the necessary balance information without requiring direct wallet integration on our backend. All balance checks are for USDC on the Stellar mainnet.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            <FAQItem 
              q="Is this safe? Do you see my private keys?"
              a="Yes, it's completely safe. Your private keys never leave your Freighter wallet. All cryptographic operations, including proof generation, happen locally in your browser. We never have access to your funds or private information."
            />
            <FAQItem 
              q="What information is public in the final proof?"
              a="The final, verifiable proof only contains the threshold amount, a hash of your wallet address, and the proof itself. Your actual address and balance are never revealed to the public or the verifier."
            />
            <FAQItem 
              q="Does this work with any cryptocurrency?"
              a="Currently, FundProof is designed specifically for USDC on the Stellar network. We plan to support more assets and potentially other blockchains in the future."
            />
            <FAQItem 
              q="What are zk-SNARKs?"
              a="zk-SNARKs are a form of zero-knowledge cryptography that allows one party to prove to another that a statement is true, without revealing any information beyond the validity of the statement itself. They are a key component in building private, scalable blockchain applications."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2.5 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">FundProof</span>
              </div>
              <p className="text-slate-400 text-sm">Prove Your Funds, Preserve Your Privacy.</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Project</h3>
                <ul className="space-y-3">
                  <li><a href="#" onClick={onGetStarted} className="text-slate-400 hover:text-white transition-colors">Launch App</a></li>
                  <li><a href="https://github.com/your-repo/fundproof" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-3">
                  <li><a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Stellar.org</a></li>
                  <li><a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Freighter Wallet</a></li>
                  <li><a href="https://z.cash/technology/zksnarks/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">About zk-SNARKs</a></li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Stay Updated</h3>
              <p className="text-slate-400 mb-4">Follow the project on social media for the latest news.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><GitBranch size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><BookCopy size={20} /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Rss size={20} /></a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800/50 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} FundProof. A project for the Stellar Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}