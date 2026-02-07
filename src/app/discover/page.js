'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Search, Zap, Play, Clock, TrendingUp, Filter, X } from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  const genres = ['all', 'rock', 'jazz', 'electronic', 'hip-hop', 'classical', 'indie', 'pop'];

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/albums');
      const data = await response.json();

      if (data.success) {
        setAlbums(data.albums);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlbums = albums
    .filter(album => {
      const matchesSearch = album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          album.artistName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filterGenre === 'all' || album.genre === filterGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'popular') return (b.plays || 0) - (a.plays || 0);
      if (sortBy === 'price') return a.priceInSats - b.priceInSats;
      return 0;
    });

  const handleAlbumClick = (albumId) => {
    router.push(`/album/${albumId}`);
  };

  const handleArtistClick = (e, artistName, artistSlug) => {
    e.stopPropagation();
    const slug = artistSlug || artistName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/artist/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <Music className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold ml-2">muzap</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/artist/login')}
                className="text-gray-300 hover:text-white transition"
              >
                Artist Login
              </button>
              <button
                onClick={() => router.push('/artist/signup')}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition"
              >
                Join as Artist
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Music</h1>
          <p className="text-gray-400">Support artists directly with Lightning payments</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search albums or artists..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setFilterGenre(genre)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterGenre === genre
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(searchQuery || filterGenre !== 'all') && (
          <div className="mb-6 flex flex-wrap gap-2">
            {searchQuery && (
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-1 flex items-center gap-2">
                <span className="text-sm">Search: {searchQuery}</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-purple-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {filterGenre !== 'all' && (
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-1 flex items-center gap-2">
                <span className="text-sm">Genre: {filterGenre}</span>
                <button onClick={() => setFilterGenre('all')} className="hover:text-purple-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-4 text-gray-400 text-sm">
          {loading ? 'Loading...' : `${filteredAlbums.length} album${filteredAlbums.length !== 1 ? 's' : ''} found`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No albums found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlbums.map(album => (
              <div
                key={album.id}
                onClick={() => handleAlbumClick(album.id)}
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group hover:scale-105"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden">
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-purple-600 rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-purple-400 transition">
                    {album.title}
                  </h3>
                  <p 
                    className="text-purple-400 hover:text-purple-300 text-sm mb-3 truncate cursor-pointer transition"
                    onClick={(e) => handleArtistClick(e, album.artistName, album.artistSlug)}
                  >
                    {album.artistName}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {album.trackCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {album.trackCount}
                        </span>
                      )}
                      {album.duration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(album.duration / 60)}m
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Zap className="w-4 h-4 fill-yellow-400" />
                      <span>{album.priceInSats || 1000}</span>
                    </div>
                  </div>

                  {album.genre && (
                    <div className="mt-3">
                      <span className="inline-block bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">
                        {album.genre}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 mt-16 py-8 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>muzap.space - Support artists directly with Lightning ⚡</p>
        </div>
      </footer>
    </div>
  );
}