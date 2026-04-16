import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">EcoTrack</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-white/90 hover:text-white transition-colors font-medium">Features</Link>
            <Link href="/#how-it-works" className="text-white/90 hover:text-white transition-colors font-medium">How It Works</Link>
            <Link href="/about" className="text-white/90 hover:text-white transition-colors font-medium">About</Link>
            <Link href="/faq" className="text-white/90 hover:text-white transition-colors font-medium">FAQ</Link>
            <Link href="/auth/login" className="text-white hover:text-white/90 font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-all">Sign In</Link>
            <Link href="/auth/register" className="bg-white text-primary-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg shadow-white/25">
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
