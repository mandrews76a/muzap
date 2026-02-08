import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { usdToSats } from '@/lib/exchangeRate';
import { verifyToken } from '@/lib/auth';

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

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const priceUsd = parseFloat(formData.get('priceUsd'));
    const description = formData.get('description');
    const releaseDate = formData.get('releaseDate');

    if (!title || isNaN(priceUsd)) {
      return NextResponse.json(
        { success: false, error: 'Title and price are required' },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        artistId: decoded.artistId,
        title,
        priceUsd,
        description: description || null,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      album: {
        id: album.id,
        title: album.title,
        priceUsd: album.priceUsd,
      }
    });

  } catch (error) {
    console.error('Create album error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create album' },
      { status: 500 }
    );
  }
}