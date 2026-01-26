'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Zap, Plus, Upload, Edit, Trash2, Eye, TrendingUp, DollarSign, Users, LogOut, Settings } from 'lucide-react';

export default function ArtistDashboard() {
  const router = useRouter();
  
  // ... (rest of the code is the same, but replace all window.location.href with router.push)
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('artist');
      router.push('/');
    }
  };
  
  // In the header, replace:
  // onClick={() => window.location.href = '/'}
  // with:
  // onClick={() => router.push('/')}
  
  // And:
  // onClick={() => window.location.href = '/discover'}
  // with:
  // onClick={() => router.push('/discover')}
  
  // And in the album view button:
  // onClick={() => window.location.href = `/album/${album.id}`}
  // with:
  // onClick={() => router.push(`/album/${album.id}`)}
}