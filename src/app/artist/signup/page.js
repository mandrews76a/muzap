'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Zap, Key, Mail, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ArtistSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    artistName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'nostr'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleEmailSignup = async () => {
    setError('');
    setLoading(true);

    // Validation
    if (!formData.artistName || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/artist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: formData.artistName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and artist data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('artist', JSON.stringify(data.artist));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/artist/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNostrSignup = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.nostr) {
        throw new Error('Nostr extension not found. Please install a Nostr browser extension like nos2x or Alby.');
      }

      // Get public key from extension
      const pubkey = await window.nostr.getPublicKey();

      // Sign a message to prove ownership
      const event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: `Signing up to muzap.space at ${new Date().toISOString()}`
      };

      const signedEvent = await window.nostr.signEvent(event);

      const response = await fetch('/api/artist/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: formData.artistName,
          nostrPubkey: pubkey,
          signedEvent: signedEvent
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Nostr signup failed');
      }

      // Store token and artist data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('artist', JSON.stringify(data.artist));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/artist/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to muzap!</h2>
          <p className="text-gray-300">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-12 h-12 text-purple-400" />
            <span className="text-3xl font-bold text-white ml-2">muzap</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join as an Artist</h1>
          <p className="text-gray-300">Start earning sats from your music</p>
        </div>

        {/* Signup Method Toggle */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 mb-6 flex border border-white/10">
          <button
            onClick={() => setSignupMethod('email')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              signupMethod === 'email'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </button>
          <button
            onClick={() => setSignupMethod('nostr')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              signupMethod === 'nostr'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Nostr
          </button>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {signupMethod === 'email' ? (
            <div>
              {/* Artist Name */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Artist Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    placeholder="Your stage name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="artist@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleEmailSignup}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          ) : (
            <div>
              {/* Artist Name for Nostr */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Artist Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    placeholder="Your stage name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-purple-200 text-sm font-medium mb-1">
                      Nostr Signup
                    </p>
                    <p className="text-purple-300 text-xs">
                      Use your Nostr identity to sign up. Make sure you have a Nostr browser extension installed (nos2x, Alby, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNostrSignup}
                disabled={loading || !formData.artistName}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Sign Up with Nostr'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <a href="/artist/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}