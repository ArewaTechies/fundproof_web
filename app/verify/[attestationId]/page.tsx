'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, XCircle, Loader2, Copy, Check, ArrowLeft, BadgeCheck, Clock, Wallet, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

type VerificationResponse = {
  verified: boolean;
  attestation?: {
    stellarAddress: string;
    thresholdCents: number;
    createdAt: number;
    verifiedAt: number;
  };
  error?: string;
  attestationId?: string;
  publicSignals?: string[];
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export default function VerifyPage() {
  const { attestationId } = useParams();
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verifyProof = async () => {
      if (!attestationId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${apiBase}/verify/${attestationId}`);
        
        if (!response.ok) {
          throw new Error('Failed to verify proof');
        }
        
        const data = await response.json();
        setVerification(data);
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify the proof. It may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyProof();
  }, [attestationId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Animated Background - matching the main app's design language */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header - matching the app's header style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50 shadow-2xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 p-2.5 rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">FundProof</span>
            </Link>
            
            <Link 
              href="/"
              className="group relative inline-flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-36 pb-20 px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
              <Loader2 className="relative h-16 w-16 text-blue-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verifying Attestation...</h2>
            <p className="text-slate-400">Validating zero-knowledge proof on the Stellar network</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3 text-red-300">Verification Failed</h2>
            <p className="text-red-200/80 mb-6">{error}</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        )}

        {verification && !loading && !error && (
          <div className="space-y-8">
            {/* Status Banner */}
            <div className={`relative overflow-hidden rounded-3xl p-8 ${verification.verified ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className={`p-4 rounded-2xl ${verification.verified ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                  {verification.verified ? (
                    <BadgeCheck className="h-12 w-12 text-emerald-400" />
                  ) : (
                    <Loader2 className="h-12 w-12 text-amber-400 animate-spin" />
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">
                    {verification.verified ? 'Attestation Verified!' : 'Processing Attestation...'}
                  </h1>
                  <p className="text-slate-300 text-lg">
                    {verification.verified 
                      ? 'This zero-knowledge proof has been successfully validated on the FundProof network'
                      : 'Your proof is still being generated. Please check back in a moment.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Attestation Details Card */}
            {verification.attestation && (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-cyan-400" />
                  Attestation Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Threshold Card */}
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 text-slate-400 mb-4">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <BadgeCheck className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="font-medium">Threshold Balance</span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(verification.attestation.thresholdCents)}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Minimum required balance verified</p>
                  </div>

                  {/* Stellar Address Card */}
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 text-slate-400 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Wallet className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-medium">Stellar Address</span>
                    </div>
                    <p className="text-lg font-mono text-white break-all">
                      {verification.attestation.stellarAddress.slice(0, 12)}...{verification.attestation.stellarAddress.slice(-8)}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(verification.attestation!.stellarAddress)}
                      className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy full address
                    </button>
                  </div>

                  {/* Created At Card */}
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 text-slate-400 mb-4">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="font-medium">Created At</span>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {formatDate(verification.attestation.createdAt)}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Attestation generation timestamp</p>
                  </div>

                  {/* Attestation ID Card */}
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 text-slate-400 mb-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <LinkIcon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <span className="font-medium">Attestation ID</span>
                    </div>
                    <p className="text-lg font-mono text-white break-all">
                      {attestationId?.slice(0, 16)}...
                    </p>
                    <button 
                      onClick={() => copyToClipboard(window.location.href)}
                      className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Link copied!' : 'Copy verification link'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Details Section */}
            {verification.verified && (
              <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6">Technical Verification Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-900/40 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-400">Groth16</div>
                    <div className="text-xs text-slate-500 mt-1">Proof System</div>
                  </div>
                  <div className="text-center p-4 bg-slate-900/40 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-400">ZK-SNARK</div>
                    <div className="text-xs text-slate-500 mt-1">Cryptography</div>
                  </div>
                  <div className="text-center p-4 bg-slate-900/40 rounded-xl">
                    <div className="text-2xl font-bold text-blue-400">Stellar</div>
                    <div className="text-xs text-slate-500 mt-1">Blockchain</div>
                  </div>
                  <div className="text-center p-4 bg-slate-900/40 rounded-xl">
                    <div className="text-2xl font-bold text-purple-400">100%</div>
                    <div className="text-xs text-slate-500 mt-1">Validity Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="text-center pt-4">
              <Link 
                href="/"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                Create Your Own Attestation
                <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}