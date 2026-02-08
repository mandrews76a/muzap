import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { usdToSats } from '@/lib/exchangeRate';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { displayName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const albums = await prisma.album.findMany({
      where,
      include: {
        artist: {
          select: {
            displayName: true
          }
        },
        _count: {
          select: { purchases: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedAlbums = await Promise.all(albums.map(async (album) => ({
      id: album.id,
      title: album.title,
      artistName: album.artist.displayName,
      priceUsd: album.priceUsd,
      priceInSats: await usdToSats(album.priceUsd),
      coverUrl: album.coverImageUrl,
      description: album.description,
      releaseDate: album.releaseDate,
      sales: album._count.purchases,
      trackCount: 0,
      duration: 0
    })));

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