'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Zap, Plus, Upload, Edit, Trash2, Eye, TrendingUp, DollarSign, LogOut } from 'lucide-react';

export default function ArtistDashboard() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    totalStreams: 0
  });
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    genre: '',
    priceInSats: '',
    description: '',
    releaseDate: '',
    coverImage: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const artistData = localStorage.getItem('artist');
        if (artistData) {
          setArtist(JSON.parse(artistData));
        }
        
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/artist/albums', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAlbums(data.albums);
          setStats(data.stats || stats);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('artist');
      router.push('/');
    }
  };

  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setUploadForm({
      ...uploadForm,
      coverImage: e.target.files[0]
    });
  };

  const handleUploadAlbum = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('genre', uploadForm.genre);
      formData.append('priceInSats', uploadForm.priceInSats);
      formData.append('description', uploadForm.description);
      formData.append('releaseDate', uploadForm.releaseDate);
      if (uploadForm.coverImage) {
        formData.append('coverImage', uploadForm.coverImage);
      }

      const response = await fetch('/api/artist/albums', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          genre: '',
          priceInSats: '',
          description: '',
          releaseDate: '',
          coverImage: null
        });
        loadDashboardData();
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!confirm('Are you sure you want to delete this album?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/artist/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <Music className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Music className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold ml-2">muzap</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">Artist Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/discover')}
                className="text-gray-300 hover:text-white transition"
              >
                Browse Music
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {artist?.displayName || 'Artist'}!
          </h1>
          <p className="text-gray-400">Manage your music and track your earnings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold">
                {stats.totalEarnings.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Earnings (sats)</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold">{stats.totalSales}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Sales</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold">
                {stats.totalStreams.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Streams</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Albums</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload New Album
            </button>
          </div>

          {albums.length === 0 ? (
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No albums yet</h3>
              <p className="text-gray-500 mb-6">Start by uploading your first album</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Upload Album
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map(album => (
                <div
                  key={album.id}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group"
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
                    <h3 className="font-bold text-lg mb-1 truncate">{album.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{album.genre}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-gray-500">
                        {album.sales || 0} sales
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                        <Zap className="w-4 h-4 fill-yellow-400" />
                        {album.priceInSats}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/album/${album.id}`)}
                        className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 py-2 px-3 rounded-lg transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-bold mb-6">Upload New Album</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Album Title</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadFormChange}
                  placeholder="Enter album title"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  name="genre"
                  value={uploadForm.genre}
                  onChange={handleUploadFormChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select genre</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Electronic</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="classical">Classical</option>
                  <option value="indie">Indie</option>
                  <option value="pop">Pop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (in sats)</label>
                <div className="relative">
                  <Zap className="w-5 h-5 text-yellow-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="priceInSats"
                    value={uploadForm.priceInSats}
                    onChange={handleUploadFormChange}
                    placeholder="21000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                  placeholder="Tell listeners about your album..."
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Release Date</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={uploadForm.releaseDate}
                  onChange={handleUploadFormChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-purple-500/50 transition">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-2">
                    {uploadForm.coverImage ? uploadForm.coverImage.name : 'Click to upload or drag and drop'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="coverImage"
                  />
                  <label
                    htmlFor="coverImage"
                    className="text-purple-400 hover:text-purple-300 cursor-pointer text-sm"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAlbum}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Upload Album
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}