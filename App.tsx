import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, Moon, Sun, Plug, Bot } from 'lucide-react';
import { PrismInterface } from './components/PrismInterface';
import { PrismSetup } from './components/PrismSetup';
import { ContextImportDialog } from './components/ContextImportDialog';
import { IntegrationsPanel } from './components/IntegrationsPanel';

import { UserMapView } from './components/UserMapView';
import { BrandMark } from './components/icons/BrandMark';
import { useAuth } from './hooks/useAuth';
import { useUserMap } from './hooks/useUserMap';
import { useIntegrations } from './hooks/useIntegrations';
import { queryContext } from './services/contextQuery';
import { ADAPTERS } from './services/integrations';
import { structurerService } from './services/structurerService';
import type { ToolContextItem } from './types';


const App: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    userMapTree,
    updateNode,
    deleteNode,
    addNode,
    consolidate,
    isConsolidating,
    ingestExternalMemory
  } = useUserMap(currentUser);
  const { integrations } = useIntegrations();

  const [isMemoryImportOpen, setIsMemoryImportOpen] = useState(false);
  const [isMemoryImporting, setIsMemoryImporting] = useState(false);
  const [isIntegrationsPanelOpen, setIsIntegrationsPanelOpen] = useState(false);
  const [isPrismOpen, setIsPrismOpen] = useState(false);
  const [isPrismSetupVisible, setIsPrismSetupVisible] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
  });

  useEffect(() => {
    if (!currentUser) return;
    const importHandled = localStorage.getItem('usermap_seen_memory_import_prompt') === 'true';
    if (!importHandled) setIsMemoryImportOpen(true);
  }, [currentUser]);

  const handleSkipMemoryImport = useCallback(() => {
    localStorage.setItem('usermap_seen_memory_import_prompt', 'true');
    setIsMemoryImportOpen(false);
  }, []);

  const handleImportMemory = useCallback(async (rawText: string) => {
    setIsMemoryImporting(true);
    try {
      const count = await ingestExternalMemory(rawText);
      if (count > 0) {
        await consolidate();
      }
      localStorage.setItem('usermap_seen_memory_import_prompt', 'true');
      setIsMemoryImportOpen(false);
    } catch (err: any) {
      alert(`Memory import failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsMemoryImporting(false);
    }
  }, [ingestExternalMemory, consolidate]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('theme', nextTheme);
  }, [theme]);

  const userLabel = useMemo(() => currentUser?.name || currentUser?.email || 'Architect', [currentUser]);
  const connectedCount = useMemo(
    () => integrations.filter((i) => i.status === 'connected').length,
    [integrations]
  );
  const connectedAICount = useMemo(() => {
    return integrations.filter((i) => i.isAIAssistant && i.status === 'connected').length;
  }, [integrations]);

  /** Show setup if no AI is connected on first launch */
  useEffect(() => {
    if (connectedAICount === 0 && !localStorage.getItem('prism_setup_complete')) {
      setIsPrismSetupVisible(true);
    }
  }, [connectedAICount]);

  const handleCompleteSetup = useCallback(() => {
    localStorage.setItem('prism_setup_complete', 'true');
    setIsPrismSetupVisible(false);
  }, []);

  const handleOpenPrism = useCallback(() => {
    setIsPrismOpen(true);
  }, []);

  // Initialize Continuous Structurer with the first connected AI Assistant
  useEffect(() => {
    const aiAdapterEntry = integrations.find(i => i.isAIAssistant && i.status === 'connected');
    if (aiAdapterEntry) {
      const adapter = ADAPTERS[aiAdapterEntry.id];
      if (adapter) {
        structurerService.init(adapter, {
          onSearchMap: async (query) => {
             // Basic search implementation for background task
             return `Background search result for: ${query}`;
          },
          onReadPrivate: async (id) => ({ allowed: true, data: "Private data accessed by structurer." }),
          onCreateFact: async (label, value) => {
              addNode('root', {
                id: crypto.randomUUID(),
                label,
                value,
                nodeType: 'fact',
                source: 'Prism Structurer',
                sourceDate: new Date().toISOString().split('T')[0],
                children: []
              });
              return true;
          },
          onAgentThought: (thought) => console.log("[Prism Structurer]", thought)
        });
      }
    }
  }, [integrations, addNode]);



  return (
    <div className="h-screen bg-[#F8F9FA] text-[#1A1A1A] dark:bg-[#1A1A1A] dark:text-[#FFFFFF] transition-colors duration-300 overflow-hidden">
      <div className="h-full flex flex-col">
        <header className="h-16 shrink-0 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/20 backdrop-blur-xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark size={28} className="text-gray-900 dark:text-white" />
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.26em] text-gray-900 dark:text-white">UserMap</div>
              <div className="text-[10px] text-gray-500 dark:text-white/40 truncate">{userLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Chat button */}
            <button
              onClick={handleOpenPrism}
              className="h-10 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 dark:text-white/70 flex items-center gap-2"
              title="Prism Agent"
            >
              <Bot size={14} className={connectedAICount > 0 ? 'text-violet-500' : ''} />
              <span className="hidden sm:inline">Prism</span>
              {connectedAICount > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center">
                  {connectedAICount}
                </span>
              )}
            </button>
            {/* Connected tools indicator + panel trigger */}
            <button
              onClick={() => setIsIntegrationsPanelOpen(true)}
              className="h-10 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.14em] text-gray-700 dark:text-white/70 flex items-center gap-2"
              title="Connected Tools"
            >
              <Plug size={14} />
              <span className="hidden sm:inline">Tools</span>
              {connectedCount > 0 && (
                <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
                  {connectedCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] flex items-center justify-center text-gray-600 dark:text-white/60"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

          </div>
        </header>

        <UserMapView
          tree={userMapTree}
          isConsolidating={isConsolidating}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
          onAddNode={addNode}
          onConsolidate={consolidate}
          onImportContext={() => setIsMemoryImportOpen(true)}
        />
      </div>

      <ContextImportDialog
        isOpen={isMemoryImportOpen}
        isImporting={isMemoryImporting}
        onSkip={handleSkipMemoryImport}
        onImport={handleImportMemory}
      />

      <IntegrationsPanel
        isOpen={isIntegrationsPanelOpen}
        onClose={() => setIsIntegrationsPanelOpen(false)}
      />

      <PrismInterface
        isOpen={isPrismOpen}
        onClose={() => setIsPrismOpen(false)}
        tree={userMapTree}
        onAddNode={addNode}
      />

      <PrismSetup 
        isOpen={isPrismSetupVisible}
        onComplete={handleCompleteSetup}
      />
    </div>
  );
};

export default App;
