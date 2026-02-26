import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Rocket, Loader2 } from 'lucide-react';

interface PrePaymentBannerProps {
  onDeploy: () => void;
  isDeploying: boolean;
}

const STEPS = [
  {
    number: '01',
    emoji: '🎨',
    title: 'Fully Custom Site Built For You',
    description:
      'A complete, professional website tailored specifically to your business, ready to go live. No need to pay hundreds of dollars upfront or shell out big monthly fees to a developer or agency.',
  },
  {
    number: '02',
    emoji: '🔧',
    title: 'Account Access',
    description:
      'After our monthly hosting fee to keep your site live, you will have an opportunity to make an account with us, so you can swap images, change text, update your page anytime. Your site, your account, total control. A professional, modern way to manage your online presence.',
  },
  {
    number: '03',
    emoji: '💰',
    title: 'Save Time & Money',
    description:
      'No need to hire a developer, pay for expensive website builders, or learn to code. Just pay a small monthly hosting fee to keep the site live — everything else is handled. No hundreds of dollars a month, no big upfront costs.',
  },
];

const PrePaymentBanner: React.FC<PrePaymentBannerProps> = ({ onDeploy, isDeploying }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Delayed banner appearance
  useEffect(() => {
    if (isBannerDismissed) return;
    const timer = setTimeout(() => setIsBannerVisible(true), 500);
    return () => clearTimeout(timer);
  }, [isBannerDismissed]);

  // Scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleDismiss = () => {
    setIsBannerVisible(false);
    setTimeout(() => setIsBannerDismissed(true), 600);
  };

  const handleModalDeploy = () => {
    setIsModalOpen(false);
    onDeploy();
  };

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* ── Sticky Bottom Banner ── */}
      {!isBannerDismissed && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            transform: isBannerVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-6 relative">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 md:top-3 md:right-3 p-1 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Close banner"
            >
              <X size={16} />
            </button>

            {/* Left: Pulsing dot + message */}
            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0 pr-6 md:pr-0">
              <span className="relative flex h-3 w-3 shrink-0 mt-1 md:mt-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-sm text-[#e2e8f0] leading-relaxed" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                You're viewing a <span className="font-semibold text-white">sample preview</span> — your real site will be{' '}
                <span className="font-semibold text-white">fully custom</span>. Edit any text, swap any images, and make changes
                anytime.{' '}
                <span className="font-semibold text-green-400" style={{ fontFamily: '"Instrument Serif", serif' }}>
                  $10/mo
                </span>{' '}
                hosting.
              </p>
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="border border-white/20 text-[#e2e8f0] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 hover:border-white/30 transition-all whitespace-nowrap flex-1 md:flex-none"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                How It Works
              </button>

              <button
                onClick={onDeploy}
                disabled={isDeploying}
                className="text-white px-5 md:px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 whitespace-nowrap flex-1 md:flex-none"
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                }}
              >
                {isDeploying ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Deploy My Site — $10/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── How It Works Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="border border-white/10 rounded-3xl max-w-lg w-full shadow-2xl p-5 md:p-8 relative overflow-y-auto max-h-[90vh]"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
              animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Site Preview badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span
                className="text-xs font-semibold text-green-400 uppercase tracking-widest"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                Site Preview
              </span>
            </div>

            {/* Headline */}
            <h2
              className="text-2xl md:text-3xl font-bold text-white text-center mb-3 leading-tight"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              Your Fully Custom Website —{' '}
              <span style={{ fontFamily: '"Instrument Serif", serif' }} className="text-green-400">
                Just $10/mo
              </span>
            </h2>

            {/* Subtitle */}
            <p
              className="text-[#94a3b8] text-sm text-center mb-8 max-w-md mx-auto leading-relaxed"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              What you're seeing is a sample proof of concept. When you deploy, your real site gets built with full account
              access — edit text, swap images, and update anything at any time.
            </p>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredStep(i)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-default hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{step.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-green-500 text-xs font-bold tracking-wider"
                          style={{ fontFamily: '"DM Sans", sans-serif' }}
                        >
                          {step.number}
                        </span>
                        <h3
                          className="text-white font-bold text-sm"
                          style={{ fontFamily: '"DM Sans", sans-serif' }}
                        >
                          {step.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Expandable description */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{
                      maxHeight: hoveredStep === i || isMobile ? '200px' : '0px',
                      opacity: hoveredStep === i || isMobile ? 1 : 0,
                      marginTop: hoveredStep === i || isMobile ? '12px' : '0px',
                    }}
                  >
                    <p
                      className="text-[#94a3b8] text-sm pl-11 leading-relaxed"
                      style={{ fontFamily: '"DM Sans", sans-serif' }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price box */}
            <div className="text-center my-6 py-4 border-t border-b border-white/10">
              <p className="text-xl font-bold text-white" style={{ fontFamily: '"Instrument Serif", serif' }}>
                $10<span className="text-base">/month</span>{' '}
                <span className="text-[#94a3b8] font-normal" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  — hosting only
                </span>
              </p>
              <p
                className="text-[#94a3b8] text-xs mt-2 leading-relaxed"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                No setup fees &bull; No hidden charges &bull; No contracts &bull; No paying hundreds a month
              </p>
              <p
                className="text-[#94a3b8] text-xs mt-1"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                Just a small hosting fee to keep your site live — site building &amp; deployment included.
              </p>
            </div>

            {/* Deploy CTA */}
            <button
              onClick={handleModalDeploy}
              disabled={isDeploying}
              className="w-full text-white py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-green-500/25"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              }}
            >
              {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
              Deploy My Site — $10/mo
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PrePaymentBanner;
