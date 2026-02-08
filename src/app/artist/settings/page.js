'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Save, LogOut, Upload, User, Globe, Twitter, Instagram, Zap, Key } from 'lucide-react';

export default function ArtistSettingsPage() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    bio: '',
    websiteUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    lightningAddress: ''
  });

  useEffect(() => {
    loadArtistData();
  }, []);

  const loadArtistData = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const artistData = localStorage.getItem('artist');
        if (!artistData) {
          router.push('/artist/login');
          return;
        }

        const parsedArtist = JSON.parse(artistData);
        setArtist(parsedArtist);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/artist/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setFormData({
            displayName: data.artist.displayName || '',
            slug: data.artist.slug || '',
            bio: data.artist.bio || '',
            websiteUrl: data.artist.websiteUrl || '',
            twitterUrl: data.artist.twitterUrl || '',
            instagramUrl: data.artist.instagramUrl || '',
            lightningAddress: data.artist.lightningAddress || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/artist/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Update localStorage
        const updatedArtist = { ...artist, displayName: formData.displayName };
        localStorage.setItem('artist', JSON.stringify(updatedArtist));
        setArtist(updatedArtist);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('artist');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <Music className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Music className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold ml-2">muzap</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">Profile Settings</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/artist/dashboard')}
                className="text-gray-300 hover:text-white transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-400">Customize your artist profile</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300'
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 space-y-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Artist Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Your stage name"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Custom Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom URL Slug
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-sm">muzap.space/artist/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="your-artist-name"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Use lowercase letters, numbers, and hyphens only</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell your fans about yourself..."
              rows="4"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Twitter URL */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter / X
            </label>
            <input
              type="url"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleInputChange}
              placeholder="https://twitter.com/yourhandle"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Instagram URL */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleInputChange}
              placeholder="https://instagram.com/yourhandle"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Lightning Address */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Lightning Address
            </label>
            <input
              type="text"
              name="lightningAddress"
              value={formData.lightningAddress}
              onChange={handleInputChange}
              placeholder="you@getalby.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Nostr Info (read-only) */}
          {artist?.nostrPubkey && (
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Nostr Public Key
              </label>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-sm text-purple-300 font-mono break-all">{artist.nostrPubkey}</p>
                <p className="text-xs text-purple-400 mt-2">✓ Verified</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => router.push('/artist/dashboard')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* View Profile Link */}
        {formData.slug && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(`/artist/${formData.slug}`)}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              View Public Profile →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}