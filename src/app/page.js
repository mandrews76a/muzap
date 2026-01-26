import Link from 'next/link';
import { Music } from 'lucide-react';

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
              Discover
            </Link>
            <Link href="/artist/login" className="hover:text-purple-400 transition">
              Login
            </Link>
            <Link href="/artist/signup" className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
              Sign Up
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
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            A music platform where artists receive payments instantly via Lightning Network.
            Optional Nostr identity means you truly own your presence.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/artist/signup" className="px-8 py-4 bg-purple-600 rounded-lg text-lg font-semibold hover:bg-purple-700 transition">
              I'm an Artist
            </Link>
            <Link href="/discover" className="px-8 py-4 bg-white/10 rounded-lg text-lg font-semibold hover:bg-white/20 transition">
              Browse Music
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Lightning Payments</h3>
            <p className="text-gray-400">
              Receive payments instantly with minimal fees. No waiting, no middlemen.
            </p>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-2">Own Your Identity</h3>
            <p className="text-gray-400">
              Optional Nostr integration means your identity is portable and provable.
            </p>
          </div>
          
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Fair Revenue</h3>
            <p className="text-gray-400">
              Keep 90% of your sales. Lower fees than traditional platforms.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}