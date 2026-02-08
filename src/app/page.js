import Link from 'next/link';
import { Music, Zap, Lock, Wallet } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold">muzap</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/discover" className="hover:text-purple-400 transition">
              Browse Music
            </Link>
            <Link href="/artist/login" className="hover:text-purple-400 transition">
              Artist Portal
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-6xl font-bold mb-6">
            Own Your Music.<br />
            Keep Your Earnings.
          </h2>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
            A music platform where artists receive payments instantly via Lightning Network.
            Optional Nostr identity means you truly own your presence.
          </p>
          <p className="text-lg text-purple-300 mb-8 max-w-2xl mx-auto font-medium">
            🎧 Listeners: No account needed. Just browse and pay with Lightning.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/discover" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg shadow-purple-500/50">
              Browse Music
            </Link>
            <Link href="/artist/signup" className="px-8 py-4 bg-white/10 rounded-lg text-lg font-semibold hover:bg-white/20 transition border border-white/20">
              Join as Artist
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Payments</h3>
            <p className="text-gray-400">
              Receive payments instantly with minimal fees. No waiting, no middlemen. Pay directly with your Lightning wallet.
            </p>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Own Your Identity</h3>
            <p className="text-gray-400">
              Optional Nostr integration means your identity is portable and provable. Artists control their presence.
            </p>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fair Revenue</h3>
            <p className="text-gray-400">
              Artists keep 90% of sales. Lower fees than traditional platforms. Get paid instantly in Bitcoin.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-white/5 rounded-2xl border border-white/10 p-10">
          <h3 className="text-3xl font-bold mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Listeners */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-purple-400">For Listeners</h4>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-purple-400">1.</span>
                  <span>Browse albums on muzap - no account required</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-400">2.</span>
                  <span>Click "Purchase with Lightning" on any album</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-400">3.</span>
                  <span>Pay the Lightning invoice with your wallet</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-purple-400">4.</span>
                  <span>Enjoy unlimited streaming instantly!</span>
                </li>
              </ol>
            </div>

            {/* For Artists */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-blue-400">For Artists</h4>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">1.</span>
                  <span>Sign up with email or Nostr identity</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">2.</span>
                  <span>Upload your albums and set your price in USD</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">3.</span>
                  <span>Share your music with the world</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">4.</span>
                  <span>Receive Lightning payments instantly - keep 90%!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p className="mb-2">muzap.space - Powered by Lightning ⚡ & Nostr 🔑</p>
          <p className="text-sm">Support artists directly. Own your music experience.</p>
        </div>
      </footer>
    </div>
  );
}