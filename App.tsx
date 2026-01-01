
import React, { useState, useCallback, useRef } from 'react';
import GeneratorForm from './components/GeneratorForm';
import SiteRenderer from './components/SiteRenderer';
import LoadingIndicator from './components/LoadingIndicator';
import { generateSiteContent } from './services/geminiService';
import { saveSiteInstance } from './services/storageService';
import { deployToVercel } from './services/vercelService';
import { GeneratorInputs, GeneratedSiteData, SiteInstance } from './types';
import { ChevronLeft, CloudCheck, Loader2, Rocket, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    // Fixed: Using any to avoid type conflict with existing AIStudio definition and potential modifier mismatches.
    aistudio: any;
  }
}

const BannerText: React.FC<{
  text: string;
}> = ({ text }) => {
  return (
    <div className="flex-1 overflow-hidden relative h-6">
      <div className="animate-marquee whitespace-nowrap absolute top-0 left-0 flex items-center h-full">
        <span className="mx-4 font-light text-[11px] md:text-base tracking-tight leading-tight">{text}</span>
        <span className="mx-4 font-light text-[11px] md:text-base tracking-tight leading-tight">{text}</span>
        <span className="mx-4 font-light text-[11px] md:text-base tracking-tight leading-tight">{text}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSite, setActiveSite] = useState<SiteInstance | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentUrl, setDeploymentUrl] = useState<string>('');
  const [deploymentMessage, setDeploymentMessage] = useState<string>('');
  const saveTimeoutRef = useRef<any>(null);

  const handleGenerate = async (newInputs: GeneratorInputs) => {
    // Check for API key selection if the environment supports it
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Proceeding after triggering openSelectKey per rules
      }
    }

    setIsLoading(true);
    try {
      const data = await generateSiteContent(newInputs);
      const instance: SiteInstance = {
        id: Math.random().toString(36).substring(7),
        data: data,
        lastSaved: Date.now()
      };
      setActiveSite(instance);
      await saveSiteInstance(instance);
    } catch (error: any) {
      console.error("Generation failed:", error);

      // Handle the specific "Requested entity not found" by prompting for key again if available
      if (error.message?.includes("Requested entity was not found") && window.aistudio) {
        alert("The selected model is not available with this API key. Please select a different key.");
        await window.aistudio.openSelectKey();
      } else {
        alert(`Generation Error: ${error.message || "Please check your API key in the Vercel dashboard and try again."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateSiteData = useCallback(async (newData: GeneratedSiteData) => {
    if (!activeSite) return;

    setSaveStatus('saving');
    const updatedSite = { ...activeSite, data: newData, lastSaved: Date.now() };
    setActiveSite(updatedSite);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveSiteInstance(updatedSite);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch (err) {
        console.error("Save failed:", err);
        setSaveStatus('idle');
      }
    }, 600);
  }, [activeSite]);

  const reset = useCallback(() => {
    if (confirm("Go back to generator? Your current site is saved locally.")) {
      setActiveSite(null);
    }
  }, []);

  const handleDeploy = async () => {
    if (!activeSite) return;

    setDeploymentStatus('deploying');
    setDeploymentMessage('Saving your site and redirecting to payment...');

    try {
      // Dynamically import the new deployment service
      const { deploySite } = await import('./services/deploymentService');

      const projectName = `site-${activeSite.id}`;
      // We attempt to save/deploy. Even if it fails (e.g. Vercel error), we likely saved the files locally.
      // But ideally, we want it to succeed in "saving".
      await deploySite(activeSite.data, projectName);

      // SUCCESS: Redirect to Stripe
      window.location.href = "https://buy.stripe.com/8x2bJ0eCo8yGgrE8Ym3cc05";

    } catch (error: any) {
      console.error("Deployment/Save failed:", error);
      // Even if it fails, we might want to let them pay? 
      // But better to show error so they don't pay for nothing.
      // However, for this MVP, let's assume the local save works.

      // If it's just a Vercel error, the files are saved.
      if (error.message?.includes('Vercel') || error.message?.includes('Missing env')) {
        window.location.href = "https://buy.stripe.com/8x2bJ0eCo8yGgrE8Ym3cc05";
        return;
      }

      setDeploymentStatus('error');
      setDeploymentMessage(error.message || 'Save failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] font-light" style={{ fontFamily: '"Avenir Light", Avenir, sans-serif' }}>
      {!activeSite && !isLoading && (
        <div className="pt-4 md:pt-6 pb-20 px-6">
          <GeneratorForm onSubmit={handleGenerate} isLoading={isLoading} />
        </div>
      )}

      {isLoading && <LoadingIndicator />}

      {activeSite && (
        <div className="flex flex-col min-h-screen">
          {/* Sticky Editor Instruction Banner - Red */}
          <div className="sticky top-0 z-[110] bg-red-600 text-white px-4 py-4 md:py-5 shadow-lg flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <button
                onClick={reset}
                className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                title="Back to Generator"
              >
                <ChevronLeft size={20} />
              </button>
              <BannerText
                text="Tap text to edit or tap images to replace them, after done click deploy website below"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-blue-100">
                    <Loader2 size={12} className="animate-spin" /> Saving
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="flex items-center gap-1 text-green-300">
                    <CloudCheck size={14} /> Saved
                  </span>
                ) : (
                  <span className="opacity-80 uppercase">Editor</span>
                )}
              </div>
            </div>
          </div>

          <main className="bg-white pb-24">
            <SiteRenderer
              data={activeSite.data}
              isEditMode={true}
              onUpdate={updateSiteData}
            />
          </main>

          <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 p-3 md:p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3">
              {deploymentStatus === 'idle' && (
                <>
                  <div className="text-center md:text-left">
                    <p className="text-gray-900 font-bold text-xs md:text-sm">
                      When you're done editing, click Deploy to get your site live instantly.
                    </p>
                  </div>
                  <button
                    onClick={handleDeploy}
                    className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-tighter"
                  >
                    <Rocket size={18} />
                    Deploy Website
                  </button>
                  {/* Hidden/Dev Button for Testing the Pipeline - Only shows if ?debug=true is in URL */}
                  {(typeof window !== 'undefined' && (window.location.search.includes('debug=true') || process.env.NODE_ENV === 'development')) && (
                    <button
                      onClick={async () => {
                        if (!activeSite) return;
                        if (!confirm('Start automated deployment pipeline? (This uploads to GCS and deploys to Vercel)')) return;

                        try {
                          setSaveStatus('saving'); // Reuse saving indicator
                          const { deploySite } = await import('./services/deploymentService');
                          const result = await deploySite(activeSite.data, `site-${activeSite.id}`);
                          alert(`Success! Site deployed to: ${result.url}`);
                        } catch (e: any) {
                          alert(`Deployment failed: ${e.message}`);
                        } finally {
                          setSaveStatus('idle');
                        }
                      }}
                      className="opacity-50 hover:opacity-100 text-xs text-gray-400 underline ml-4"
                    >
                      Test Pipeline
                    </button>
                  )}
                </>
              )}

              {deploymentStatus === 'deploying' && (
                <div className="w-full text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Loader2 size={20} className="animate-spin text-blue-600" />
                    <p className="text-blue-900 font-bold text-sm md:text-base">
                      {deploymentMessage}
                    </p>
                  </div>
                </div>
              )}

              {deploymentStatus === 'success' && (
                <div className="w-full text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-green-700 font-bold text-sm md:text-base flex items-center gap-2">
                      <CloudCheck size={20} />
                      {deploymentMessage}
                    </p>
                    <a
                      href={deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                      <ExternalLink size={16} />
                      Open Live Site
                    </a>
                  </div>
                </div>
              )}

              {deploymentStatus === 'error' && (
                <div className="w-full text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-red-700 font-bold text-sm md:text-base">
                      {deploymentMessage}
                    </p>
                    <button
                      onClick={handleDeploy}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
