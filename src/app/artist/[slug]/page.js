'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Music, Globe, Twitter, Instagram, Key, Zap, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';

export default function ArtistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchArtistProfile();
    }
  }, [params.slug]);

  const fetchArtistProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/artist/profile/${params.slug}`);
      const data = await response.json();

      if (data.success) {
        setArtist(data.artist);
        setAlbums(data.albums);
      }
    } catch (error) {
      console.error('Error fetching artist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <Music className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p>Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Artist not found</h2>
          <button
            onClick={() => router.push('/discover')}
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to discover
          </button>
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
            <button
              onClick={() => router.push('/discover')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Discover
            </button>
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <Music className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold ml-2">muzap</span>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden">
        {artist.bannerUrl ? (
          <img
            src={artist.bannerUrl}
            alt={`${artist.displayName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600/50 to-blue-600/50" />
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 rounded-full border-4 border-black bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt={artist.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-16 h-16 text-white/70" />
                </div>
              )}
            </div>
          </div>

          {/* Artist Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{artist.displayName}</h1>
            <p className="text-gray-400 mb-4">{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
            
            {artist.bio && (
              <p className="text-gray-300 mb-6 max-w-2xl">{artist.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {artist.websiteUrl && (
                
                  href={artist.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              {artist.twitterUrl && (
                
                  href={artist.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
              {artist.instagramUrl && (
                
                  href={artist.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
              {artist.nostrPubkey && (
                <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 px-4 py-2 rounded-lg">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Nostr Verified</span>
                </div>
              )}
              {artist.lightningAddress && (
                <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300">{artist.lightningAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Albums Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-6">Albums</h2>
          
          {albums.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No albums yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map(album => (
                <div
                  key={album.id}
                  onClick={() => router.push(`/album/${album.id}`)}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold mb-1 truncate group-hover:text-purple-400 transition">
                      {album.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(album.releaseDate).getFullYear()}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Zap className="w-4 h-4 fill-yellow-400" />
                        {album.priceInSats}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}