import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Zap, Globe, Sparkles, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useIntegrations } from '../hooks/useIntegrations';
import type { IntegrationId } from '../types';

interface PrismSetupProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const PrismSetup: React.FC<PrismSetupProps> = ({ isOpen, onComplete }) => {
    const { integrations, connectWithApiKey, connectDirect } = useIntegrations();
    const [step, setStep] = useState<'welcome' | 'selection' | 'config' | 'success'>('welcome');
    const [selectedEngine, setSelectedEngine] = useState<IntegrationId | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aiOptions = integrations.filter(i => i.isAIAssistant);

    const handleSelectEngine = (id: IntegrationId) => {
        setSelectedEngine(id);
        const engine = aiOptions.find(i => i.id === id);
        if (engine?.supportsLocalBridge) {
            handleConnectDirect(id);
        } else {
            setStep('config');
        }
    };

    const handleConnectDirect = async (id: IntegrationId) => {
        setIsConnecting(true);
        setError(null);
        try {
            await connectDirect(id);
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Failed to connect to local engine. Is Ollama running?');
            setStep('selection');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleConnectApiKey = async () => {
        if (!selectedEngine || !apiKey.trim()) return;
        setIsConnecting(true);
        setError(null);
        try {
            await connectWithApiKey(selectedEngine, apiKey.trim());
            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Invalid API Key or connection error.');
        } finally {
            setIsConnecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-[#111] rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.3)] border border-white/10"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-white/5">
                        <motion.div 
                            className="h-full bg-violet-500"
                            initial={{ width: '0%' }}
                            animate={{ 
                                width: step === 'welcome' ? '25%' : step === 'selection' ? '50%' : step === 'config' ? '75%' : '100%' 
                            }}
                        />
                    </div>

                    <div className="p-10">
                        {step === 'welcome' && (
                            <div className="text-center space-y-6">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-500/10 border border-violet-500/20 text-violet-500 mb-4">
                                    <Bot size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Initialize Prism</h1>
                                    <p className="text-gray-500 dark:text-white/40 text-sm max-w-md mx-auto">
                                        Your personal Context Engineer needs a brain to analyze, arrange, and manage your life's data.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setStep('selection')}
                                    className="group h-14 px-8 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs flex items-center gap-3 mx-auto mt-8 hover:scale-105 transition-transform"
                                >
                                    Choose Engine
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}

                        {step === 'selection' && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Select Your Brain</h2>
                                    <p className="text-xs text-gray-400 mt-2">Where should Prism's intelligence run?</p>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {aiOptions.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleSelectEngine(option.id)}
                                            className="group relative p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-violet-500 transition-all text-left flex flex-col gap-4"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center border border-black/5 dark:border-white/10 group-hover:scale-110 transition-transform">
                                                {option.id === 'ollama' ? <Cpu size={20} className="text-violet-500" /> : <Zap size={20} className="text-amber-500" />}
                                            </div>
                                            <div>
                                                <div className="font-black text-[10px] uppercase tracking-widest text-gray-900 dark:text-white mb-1">
                                                    {option.label}
                                                </div>
                                                <div className="text-[10px] text-gray-500 dark:text-white/40 leading-relaxed">
                                                    {option.id === 'ollama' ? 'Local-first. Runs offline on your hardware.' : 'Cloud-powered. High speed and reasoning.'}
                                                </div>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowUpRight size={14} className="text-violet-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 'config' && (
                            <div className="space-y-6">
                                <button onClick={() => setStep('selection')} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    ← Back
                                </button>
                                <div className="text-center">
                                    <div className="h-16 w-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-black/5">
                                        <Globe size={24} className="text-violet-500" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Authorize {aiOptions.find(i => i.id === selectedEngine)?.label}</h2>
                                    <p className="text-xs text-gray-400 mt-2">Enter your API key to power Prism's analysis.</p>
                                </div>

                                <div className="space-y-4 max-w-sm mx-auto">
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk-..."
                                            className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 text-sm focus:border-violet-500 outline-none dark:text-white"
                                        />
                                        {isConnecting && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Loader2 size={16} className="animate-spin text-violet-500" />
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleConnectApiKey}
                                        disabled={!apiKey.trim() || isConnecting}
                                        className="w-full h-12 bg-violet-600 text-white font-black uppercase tracking-widest text-xs rounded-xl disabled:opacity-50"
                                    >
                                        Connect Engine
                                    </button>
                                    {error && <p className="text-center text-[10px] text-red-500">{error}</p>}
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center space-y-6 py-4">
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="h-20 w-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                                >
                                    <CheckCircle2 size={40} />
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Prism is Online</h2>
                                    <p className="text-gray-500 dark:text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                                        Intelligence core established. Prism can now pull data from your tools and organize them into your structured UserMap.
                                    </p>
                                </div>
                                <button 
                                    onClick={onComplete}
                                    className="h-14 px-10 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs mt-8 hover:scale-105 transition-transform shadow-xl"
                                >
                                    Enter Workspace
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const ArrowUpRight = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 7h10v10" /><path d="M7 17 17 7" />
    </svg>
);
