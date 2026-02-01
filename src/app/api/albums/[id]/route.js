import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

    return NextResponse.json({
      success: true,
      album: {
        id: album.id,
        title: album.title,
        artistName: album.artist.displayName,
        priceInSats: album.priceSats,
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