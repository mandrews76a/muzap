import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { usdToSats } from '@/lib/exchangeRate';

const prisma = new PrismaClient();

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // Convert id to integer
    const albumId = parseInt(id);

    if (!albumId || isNaN(albumId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid album ID' },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        artist: {
          select: {
            displayName: true
          }
        },
        tracks: {
          orderBy: { trackNumber: 'asc' }
        }
      }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    const priceInSats = await usdToSats(album.priceUsd);

    return NextResponse.json({
      success: true,
      album: {
        id: album.id,
        title: album.title,
        artistName: album.artist.displayName,
        genre: album.genre,
        priceUsd: album.priceUsd,
        priceInSats,
        coverUrl: album.coverImageUrl,
        description: album.description,
        releaseDate: album.releaseDate,
        trackCount: album.tracks.length,
        duration: album.tracks.reduce((sum, track) => sum + (track.durationSeconds || 0), 0),
        tracks: album.tracks.map(track => ({
          id: track.id,
          title: track.title,
          duration: track.durationSeconds,
          trackNumber: track.trackNumber
        }))
      }
    });

  } catch (error) {
    console.error('Album detail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
}