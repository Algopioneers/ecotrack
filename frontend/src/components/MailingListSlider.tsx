'use client';

import { useState, useEffect, useRef } from 'react';

export default function MailingListSlider() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show slider after 15 seconds
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('ecotrack-newsletter-dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        // Don't auto-close when open
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsLoading(false);
    localStorage.setItem('ecotrack-newsletter-subscribed', 'true');
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('ecotrack-newsletter-dismissed', Date.now().toString());
  };

  // Check if already subscribed
  if (typeof window !== 'undefined' && localStorage.getItem('ecotrack-newsletter-subscribed')) {
    return null;
  }

  return (
    <>
      {/* Tab trigger - Fixed on right side */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group"
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-l-full blur-md group-hover:from-emerald-500/50 group-hover:to-green-500/50 transition-all" />
            
            {/* Tab */}
            <div className="relative bg-gray-900/70 backdrop-blur-xl border border-white/20 rounded-l-2xl shadow-2xl py-6 pr-3 pl-4 transition-all group-hover:bg-gray-800/80">
              <div className="flex items-center gap-1">
                <span className="text-white/90 text-sm font-medium -rotate-90 whitespace-nowrap origin-center">
                  Newsletter
                </span>
              </div>
              <div className="mt-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Slider panel */}
      <div
        ref={sliderRef}
        className={`fixed right-0 bottom-24 w-80 z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative">
          {/* Backdrop for mobile */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={handleDismiss}
            />
          )}

          {/* Panel - Glassmorphism with darker ash */}
          <div className="relative bg-gray-900/70 backdrop-blur-2xl border border-white/10 rounded-l-2xl shadow-2xl overflow-visible">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 via-gray-900/80 to-gray-800/50 pointer-events-none" />
            
            {/* Content */}
            <div className="relative flex flex-col max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">Join Our Newsletter</h3>
                      <p className="text-green-200/60 text-xs">Get exclusive updates</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="relative z-50 w-10 h-10 rounded-full bg-gray-700/50 hover:bg-red-500 active:bg-red-600 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-6">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 animate-bounce">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2">Welcome Aboard! 🎉</h4>
                    <p className="text-green-200/80 text-sm">
                      You&apos;re now subscribed to EcoTrack updates. Check your inbox for a welcome gift!
                    </p>
                    
                    <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-green-200/90 text-xs mb-2">What you&apos;ll get:</p>
                      <ul className="text-white/80 text-xs space-y-1.5 text-left">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Weekly eco-tips & recycling hacks
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Early access to new features
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Exclusive discount codes
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span> Community updates & events
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={handleDismiss}
                      className="mt-6 text-green-300/80 text-sm hover:text-green-200 transition-colors"
                    >
                      Close panel
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Teaser */}
                    <div className="mb-6">
                      <p className="text-green-100/90 text-sm leading-relaxed">
                        🌿 Join <span className="text-white font-semibold">5,000+ eco-warriors</span> receiving weekly tips on waste reduction, recycling hacks, and exclusive offers!
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                        <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-base">🎁</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Welcome Discount</p>
                          <p className="text-green-200/50 text-xs">Get 15% off your first pickup</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-base">📊</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Weekly Insights</p>
                          <p className="text-green-200/50 text-xs">Eco-tips delivered every week</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                        <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-base">🔔</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Early Access</p>
                          <p className="text-green-200/50 text-xs">Be first to know about new features</p>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                      <div>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30 transition-all text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !email || !name}
                        className="w-full relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-emerald-400 to-green-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                          {isLoading ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Joining...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Subscribe & Get 15% Off
                            </>
                          )}
                        </div>
                      </button>
                    </form>

                    {/* Privacy note */}
                    <p className="text-center text-green-200/50 text-xs mt-4">
                      🔒 We respect your privacy. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 text-green-200/40 text-xs">
                  <span>5,000+ subscribers</span>
                  <span>•</span>
                  <span>Weekly emails</span>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </>
  );
}
