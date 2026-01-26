'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Music, Zap, Play, Pause, Clock, Calendar, ArrowLeft, Share2, Heart, ExternalLink, CheckCircle, Loader } from 'lucide-react';

export default function AlbumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id;

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [invoice, setInvoice] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    if (albumId) {
      fetchAlbumDetails();
      checkIfPurchased();
    }
  }, [albumId]);

  const fetchAlbumDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/albums/${albumId}`);
      const data = await response.json();
      
      if (data.success) {
        setAlbum(data.album);
      }
    } catch (error) {
      console.error('Error fetching album:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfPurchased = () => {
    // Check if user has already purchased this album
    if (typeof window !== 'undefined') {
      const purchased = localStorage.getItem(`purchased_${albumId}`);
      setIsPurchased(!!purchased);
    }
  };

  const handlePlayTrack = (track) => {
    if (isPurchased) {
      setCurrentTrack(track);
      setIsPlaying(true);
    } else {
      // Show payment modal for unpurchased content
      setShowPaymentModal(true);
    }
  };

  const handlePauseTrack = () => {
    setIsPlaying(false);
  };

  const handlePurchase = async () => {
    setPaymentStatus('processing');
    
    try {
      // Call your Lightning payment API
      const response = await fetch('/api/payments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId: album.id,
          amountInSats: album.priceInSats
        })
      });

      const data = await response.json();

      if (data.success) {
        setInvoice(data.invoice);
        
        // TODO: Implement real payment polling or WebSocket
        // For now, simulate payment confirmation
        setTimeout(() => {
          setPaymentStatus('success');
          setIsPurchased(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`purchased_${albumId}`, 'true');
          }
          setTimeout(() => {
            setShowPaymentModal(false);
            setPaymentStatus('idle');
          }, 2000);
        }, 3000);
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading album...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Album not found</h2>
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

      {/* Album Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Album Cover */}
          <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl overflow-hidden border border-white/10">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-32 h-32 text-white/30" />
              </div>
            )}
          </div>

          {/* Album Info */}
          <div className="flex flex-col justify-center">
            <div className="inline-block bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded mb-4 w-fit">
              {album.genre}
            </div>
            <h1 className="text-5xl font-bold mb-4">{album.title}</h1>
            <p className="text-2xl text-gray-300 mb-6">{album.artistName}</p>
            
            <p className="text-gray-400 mb-8 leading-relaxed">{album.description}</p>

            {/* Album Stats */}
            <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>{album.trackCount} tracks</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(album.duration / 60)} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(album.releaseDate)}</span>
              </div>
            </div>

            {/* Purchase Section */}
            {isPurchased ? (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="font-semibold text-green-300">Already Purchased</p>
                    <p className="text-sm text-green-400">You own this album. Enjoy!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Album Price</span>
                  <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                    <Zap className="w-6 h-6 fill-yellow-400" />
                    {album.priceInSats.toLocaleString()} sats
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Purchase with Lightning
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                <Heart className="w-5 h-5" />
                Save
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Tracks</h2>
          <div className="space-y-2">
            {album.tracks && album.tracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                  currentTrack?.id === track.id
                    ? 'bg-purple-600/30 border border-purple-500/50'
                    : 'hover:bg-white/5'
                }`}
                onClick={() => handlePlayTrack(track)}
              >
                <div className="w-8 text-center text-gray-400 font-medium">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="w-5 h-5 inline text-purple-400" onClick={(e) => { e.stopPropagation(); handlePauseTrack(); }} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${currentTrack?.id === track.id ? 'text-purple-400' : 'text-white'}`}>
                    {track.title}
                  </p>
                </div>
                <div className="text-gray-400 text-sm">
                  {formatDuration(track.duration)}
                </div>
                {!isPurchased && (
                  <Zap className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 max-w-md w-full border border-white/20">
            {paymentStatus === 'idle' && (
              <>
                <h3 className="text-2xl font-bold mb-4">Purchase Album</h3>
                <p className="text-gray-300 mb-6">
                  Pay with Lightning to unlock all tracks and support the artist directly.
                </p>
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Album</span>
                    <span className="font-medium">{album.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Price</span>
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Zap className="w-4 h-4 fill-yellow-400" />
                      {album.priceInSats.toLocaleString()} sats
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Pay Now
                  </button>
                </div>
              </>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center">
                <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-400" />
                <h3 className="text-2xl font-bold mb-4">Processing Payment</h3>
                <p className="text-gray-300 mb-6">
                  Please complete the Lightning payment in your wallet...
                </p>
                {invoice && (
                  <div className="bg-white/5 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-400 mb-2">Lightning Invoice</p>
                    <p className="text-xs font-mono break-all text-gray-300">
                      {invoice.paymentRequest || 'lnbc...'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-green-400">Payment Successful!</h3>
                <p className="text-gray-300">
                  You now have full access to this album. Enjoy the music!
                </p>
              </div>
            )}

            {paymentStatus === 'error' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-red-400">Payment Failed</h3>
                  <p className="text-gray-300">
                    Something went wrong. Please try again.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}