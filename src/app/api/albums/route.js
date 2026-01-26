import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');

    const where = {};

    if (genre && genre !== 'all') {
      where.genre = genre;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { artistName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const albums = await prisma.album.findMany({
      where,
      include: {
        artist: {
          select: {
            artistName: true
          }
        },
        _count: {
          select: { purchases: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAlbums = albums.map(album => ({
      id: album.id,
      title: album.title,
      artistName: album.artist.artistName,
      genre: album.genre,
      priceInSats: album.priceInSats,
      coverUrl: album.coverUrl,
      description: album.description,
      releaseDate: album.releaseDate,
      plays: album.plays || 0,
      sales: album._count.purchases,
      trackCount: album.trackCount || 10, // Default if not set
      duration: album.duration || 2400 // Default if not set
    }));

    return NextResponse.json({
      success: true,
      albums: formattedAlbums
    });

  } catch (error) {
    console.error('Browse albums error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}