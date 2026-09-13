'use client';

import { FormEvent, useState, useEffect } from 'react';
import { 
  CheckCircle2, FileKey2, PlayCircle, ShieldCheck, WalletCards, XCircle, 
  Wallet, ArrowRight, History, QrCode, Copy, Check, ExternalLink, 
  Loader2, ChevronRight, Info, Sun, Moon, AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from './hooks/useWallet';
import Header from './components/Header';
import LandingPage from './landing-page';

type AssetBalance = {
  assetCode: string;
  assetIssuer: string;
  balance: number;
};

type AttestationResponse = {
  id: string;
  stellarAddress: string;
  totalThresholdCents: number;
  assetBalances: AssetBalance[];
  totalBalanceCents: number;
  expiresAt: number;
  addressHash: string;
  attestationHash:string;
  signature: string;
  publicKey: string;
};

type SupportedAsset = {
  assetCode: string;
  assetIssuer: string;
  assetType: string;
  usdRate: number;
  decimals: number;
};

type ProofInputResponse = {
  input: Record<string, string>;
  publicSignals: Record<string, string>;
  nextStep: string;
};

type GeneratedProofResponse = {
  attestationId: string;
  verified: boolean;
  proof: unknown;
  publicSignals: string[];
  publicSignalNames: string[];
  files: {
    input: string;
    proof: string;
    public: string;
  };
  nextStep: string;
};

type ProofHistoryItem = {
  id: string;
  attestationId: string;
  createdAt: number;
  thresholdCents: number;
  stellarAddress: string;
  verified: boolean;
  proofUrl?: string;
};

type NotificationType = 'error' | 'success' | 'info';

type Notification = {
  type: NotificationType;
  message: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

const STEPS = [
  { id: 'connect', title: 'Connect Wallet', description: 'Connect your Stellar wallet' },
  { id: 'details', title: 'Set Parameters', description: 'Define your funding threshold' },
  { id: 'attestation', title: 'Generate Attestation', description: 'Create your proof attestation' },
  { id: 'proof', title: 'Generate ZK Proof', description: 'Create your zero-knowledge proof' },
  { id: 'share', title: 'Share Proof', description: 'Share your verified proof' },
];

const NotificationBanner = ({ notification, onClear }: { notification: Notification | null, onClear: () => void }) => {
  if (!notification) return null;

  const iconMap: Record<NotificationType, React.ReactNode> = {
    error: <AlertTriangle size={20} className="text-red-400" />,
    success: <CheckCircle2 size={20} className="text-green-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  const baseClasses = "flex items-center gap-3 p-4 rounded-xl border";
  const typeClasses: Record<NotificationType, string> = {
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]}`}>
      {iconMap[notification.type]}
      <p className="flex-grow text-sm">{notification.message}</p>
      <button onClick={onClear} className="p-1 rounded-full hover:bg-white/10 transition-colors">
        <XCircle size={18} />
      </button>
    </div>
  );
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const { publicKey: walletPublicKey, loading: walletLoading, error: walletError, connectWallet, disconnectWallet: disconnectWalletHook } = useWallet();
  
  const [supportedAssets, setSupportedAssets] = useState<SupportedAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set(['USDC']));
  const [threshold, setThreshold] = useState('1000');
  const [attestation, setAttestation] = useState<AttestationResponse | null>(null);

  // Fetch supported assets from API on mount
  useEffect(() => {
    fetch(`${apiBase}/supported-assets`)
      .then(res => res.json())
      .then(data => setSupportedAssets(data))
      .catch(err => console.error('Failed to fetch supported assets:', err));
  }, []);
  const [proofInput, setProofInput] = useState<ProofInputResponse | null>(null);
  const [generatedProof, setGeneratedProof] = useState<GeneratedProofResponse | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [proofHistory, setProofHistory] = useState<ProofHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const setAndClearNotification = (notif: Notification | null, duration: number = 5000) => {
    setNotification(notif);
    if (notif) {
      setTimeout(() => setNotification(null), duration);
    }
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleAssetSelection = (assetCode: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetCode)) {
      if (newSelected.size > 1) { // Keep at least one asset selected
        newSelected.delete(assetCode);
      }
    } else {
      newSelected.add(assetCode);
    }
    setSelectedAssets(newSelected);
  };

  const disconnectWallet = () => {
    disconnectWalletHook();
    setCurrentStep(0);
    setAttestation(null);
    setProofInput(null);
    setGeneratedProof(null);
    setNotification(null);
  };

  useEffect(() => {
    if (walletPublicKey) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [walletPublicKey]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('fundproof_history');
      if (savedHistory) {
        setProofHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Failed to load proof history:', err);
      try { localStorage.removeItem('fundproof_history'); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!isPolling || !attestation) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiBase}/verify/${attestation.id}`);
        const data = await response.json();

        if (data.verified) {
          setGeneratedProof(data);
          setCurrentStep(4);
          saveToHistory(data, attestation);
          setIsPolling(false);
          setProofLoading(false);
          setAndClearNotification({ type: 'success', message: 'Zero-knowledge proof successfully generated and verified!' });
        }
      } catch (err) {
        setAndClearNotification({ type: 'error', message: 'Failed to poll for proof status. Please try again.' });
        setIsPolling(false);
        setProofLoading(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPolling, attestation]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const saveToHistory = (proof: GeneratedProofResponse, attestationData: AttestationResponse) => {
    const newItem: ProofHistoryItem = {
      id: Date.now().toString(),
      attestationId: proof.attestationId,
      createdAt: Date.now(),
      thresholdCents: attestationData.totalThresholdCents,
      stellarAddress: attestationData.stellarAddress,
      verified: proof.verified,
      proofUrl: `${window.location.origin}/verify/${proof.attestationId}`,
    };
    
    const updatedHistory = [newItem, ...proofHistory].slice(0, 20);
    setProofHistory(updatedHistory);
    localStorage.setItem('fundproof_history', JSON.stringify(updatedHistory));
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotification(null);
    setProofInput(null);
    setGeneratedProof(null);
    setAttestation(null);
    setLoading(true);

    try {
      const thresholdCents = Math.round(Number(threshold) * 100);
      const attestationResponse = await fetch(`${apiBase}/attestations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stellarAddress: walletPublicKey, 
          thresholdCents,
          selectedAssets: Array.from(selectedAssets)
        }),
      });

      if (!attestationResponse.ok) {
        throw new Error(await attestationResponse.text());
      }

      const nextAttestation = (await attestationResponse.json()) as AttestationResponse;
      setAttestation(nextAttestation);
      setCurrentStep(2);
      setAndClearNotification({ type: 'success', message: 'Attestation created successfully. You can now generate the proof.' });

    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Request failed.';
      setAndClearNotification({ type: 'error', message: `Attestation failed: ${message}` });
    } finally {
      setLoading(false);
    }
  }

  async function generateProof() {
    if (!attestation) {
      return;
    }

    setNotification(null);
    setGeneratedProof(null);
    setProofLoading(true);

    try {
      const proofResponse = await fetch(`${apiBase}/proofs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attestationId: attestation.id }),
      });

      if (!proofResponse.ok) {
        throw new Error(await proofResponse.text());
      }
      
      setCurrentStep(3);
      setIsPolling(true);
      setAndClearNotification({ type: 'info', message: 'Proof generation started. This may take a moment. We are polling for the result.' });

    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Proof generation failed.';
      setAndClearNotification({ type: 'error', message });
      setProofLoading(false);
    }
  }

  const passes = attestation ? true : false;

  const formatUsd = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'complete';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      <Header 
        setShowApp={setShowApp}
        setShowHistory={setShowHistory}
        showHistory={showHistory}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header
        setShowApp={() => {}}
        setShowHistory={setShowHistory}
        showHistory={showHistory}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />

      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mb-4">
              Private multi-asset proof-of-funds for Stellar
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Prove a wallet meets a combined funding threshold across multiple assets without revealing individual balances. The local demo uses a backend-signed attestation and Circom/Groth16 circuit input ready for Stellar verification.
            </p>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between overflow-x-auto pb-4 gap-4">
              {STEPS.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-300 ${
                        status === 'complete' 
                          ? 'bg-green-500/20 border-green-500 text-green-400' 
                          : status === 'current' 
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-500'
                      }`}>
                        {status === 'complete' ? <CheckCircle2 size={20} /> : <span className="font-semibold">{index + 1}</span>}
                      </div>
                      <div className="hidden sm:block">
                        <h3 className={`font-semibold text-sm ${status === 'current' ? 'text-white' : 'text-slate-400'}`}>{step.title}</h3>
                        <p className="text-xs text-slate-500">{step.description}</p>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <ChevronRight className={`ml-4 flex-shrink-0 ${index < currentStep ? 'text-green-500' : 'text-slate-700'}`} size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-8">
            <NotificationBanner notification={notification} onClear={() => setNotification(null)} />
          </div>

          {showHistory && (
            <div className="mb-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <History className="text-blue-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Proof History</h2>
                </div>
              </div>
              <div className="p-6">
                {proofHistory.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No proofs generated yet. Your proof history will appear here.</p>
                ) : (
                  <div className="space-y-4">
                    {proofHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={item.verified ? 'text-green-400' : 'text-red-400'}>
                            {item.verified ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                          </div>
                          <div>
                            <p className="font-mono text-sm text-slate-300">{item.stellarAddress.slice(0, 12)}...{item.stellarAddress.slice(-8)}</p>
                            <p className="text-sm text-slate-500">Threshold: {formatUsd(item.thresholdCents)} • {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {item.proofUrl && (
                          <button 
                            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                            onClick={() => copyToClipboard(item.proofUrl!)}
                            title="Copy link"
                          >
                            <Copy size={16} className="text-slate-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!walletPublicKey ? (
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Wallet className="text-blue-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Connect Your Wallet</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                  <div className="flex gap-3">
                    <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-300">To use FundProof, you need to connect your Freighter wallet. Freighter is the official wallet for the Stellar network.</p>
                  </div>
                </div>
                <button 
                  onClick={connectWallet} 
                  disabled={walletLoading}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {walletLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet aria-hidden />
                      Connect Freighter Wallet
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                {walletError && <p className="mt-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{walletError}</p>}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <p className="text-slate-500 mb-2">Don't have Freighter installed?</p>
                  <a 
                    href="https://www.freighter.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Install Freighter <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <WalletCards className="text-cyan-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Create Your Claim</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-400" size={20} />
                    <span className="font-mono text-sm text-slate-300">Connected: {walletPublicKey.slice(0, 12)}...{walletPublicKey.slice(-8)}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={disconnectWallet}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Stellar Address Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Stellar address (read-only)</label>
                  <input 
                    value={walletPublicKey} 
                    readOnly
                    disabled
                    placeholder="Connect your wallet to populate this field"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 font-mono text-sm focus:outline-none focus:border-slate-600 disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-slate-500">This is automatically populated from your connected Freighter wallet and cannot be edited.</p>
                </div>

                {/* Asset Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select assets to include in proof</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {supportedAssets.map((asset) => (
                      <button
                        key={asset.assetCode}
                        type="button"
                        onClick={() => toggleAssetSelection(asset.assetCode)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedAssets.has(asset.assetCode)
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-semibold text-lg">{asset.assetCode}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {asset.assetType === 'native' ? 'Native asset' : `${asset.assetIssuer.slice(0, 8)}...`}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Select which assets to include in your combined balance proof. At least one asset must be selected.</p>
                </div>

                {/* Threshold Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Minimum total balance threshold (USD)</label>
                  <input 
                    value={threshold} 
                    onChange={(event) => setThreshold(event.target.value)} 
                    inputMode="decimal"
                    placeholder="1000.00"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <p className="mt-2 text-xs text-slate-500">This is the minimum combined balance you want to prove you hold. Your exact individual asset balances remain private.</p>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading || proofLoading || isPolling}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating Attestation...
                    </>
                  ) : (
                    <>
                      <FileKey2 aria-hidden />
                      Create Attestation
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {attestation && (
            <div className="mt-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <ShieldCheck className="text-purple-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Generate Proof</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex gap-3">
                    <Info size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-300">The attestation is ready. Click below to generate the zero-knowledge proof. This is a computationally intensive process and may take a moment.</p>
                  </div>
                </div>
                <button 
                  onClick={generateProof} 
                  disabled={proofLoading || isPolling}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {proofLoading || isPolling ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {isPolling ? 'Polling for result...' : 'Generating proof...'}
                    </>
                  ) : (
                    <>
                      <PlayCircle aria-hidden />
                      Generate ZK Proof
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {generatedProof && (
            <div className="mt-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle2 className="text-green-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Proof Generated & Verified</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-slate-300">Your proof has been successfully generated and verified. You can now share the verification link.</p>
                
                <div className="relative">
                  <input 
                    value={`${window.location.origin}/verify/${generatedProof.attestationId}`} 
                    readOnly
                    className="w-full px-4 py-3 pr-28 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 font-mono text-sm"
                  />
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/verify/${generatedProof.attestationId}`)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex items-center justify-center pt-4">
                  <button onClick={() => setShowQR(!showQR)} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                    <QrCode size={16} />
                    {showQR ? 'Hide' : 'Show'} QR Code
                  </button>
                </div>

                {showQR && (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-xl">
                    <QRCodeSVG 
                      value={`${window.location.origin}/verify/${generatedProof.attestationId}`} 
                      size={192}
                      bgColor="#1e293b"
                      fgColor="#ffffff"
                      level="Q"
                      className="rounded-lg"
                    />
                    <p className="mt-4 text-sm text-slate-400">Scan to verify proof</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}