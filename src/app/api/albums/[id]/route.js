import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            artistName: true
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
        artistName: album.artist.artistName,
        genre: album.genre,
        priceInSats: album.priceInSats,
        coverUrl: album.coverUrl,
        description: album.description,
        releaseDate: album.releaseDate,
        trackCount: album.tracks.length || 10,
        duration: album.tracks.reduce((sum, track) => sum + (track.duration || 0), 0) || 2400,
        tracks: album.tracks.map(track => ({
          id: track.id,
          title: track.title,
          duration: track.duration || 240,
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