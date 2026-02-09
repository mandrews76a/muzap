import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { usdToSats } from '@/lib/exchangeRate';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request, context) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const albumId = parseInt(params.id);

    if (!albumId || isNaN(albumId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid album ID' },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        artist: { select: { displayName: true } },
        _count: { select: { purchases: true } }
      }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    if (album.artistId !== decoded.artistId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to access this album' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      album: {
        id: album.id,
        title: album.title,
        genre: album.genre,
        priceUsd: album.priceUsd,
        priceInSats: await usdToSats(album.priceUsd),
        coverUrl: album.coverImageUrl,
        description: album.description,
        releaseDate: album.releaseDate,
        sales: album._count.purchases
      }
    });

  } catch (error) {
    console.error('Get album error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const albumId = parseInt(params.id);

    if (!albumId || isNaN(albumId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid album ID' },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    if (album.artistId !== decoded.artistId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to edit this album' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const genre = formData.get('genre');
    const priceUsd = parseFloat(formData.get('priceUsd'));
    const description = formData.get('description');
    const releaseDate = formData.get('releaseDate');

    if (!title || isNaN(priceUsd)) {
      return NextResponse.json(
        { success: false, error: 'Title and price are required' },
        { status: 400 }
      );
    }

    const updatedAlbum = await prisma.album.update({
      where: { id: albumId },
      data: {
        title,
        genre: genre || null,
        priceUsd,
        description: description || null,
        releaseDate: releaseDate ? new Date(releaseDate) : album.releaseDate,
      }
    });

    return NextResponse.json({
      success: true,
      album: {
        id: updatedAlbum.id,
        title: updatedAlbum.title,
        genre: updatedAlbum.genre,
        priceUsd: updatedAlbum.priceUsd,
      }
    });

  } catch (error) {
    console.error('Update album error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update album' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const albumId = parseInt(params.id);

    if (!albumId || isNaN(albumId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid album ID' },
        { status: 400 }
      );
    }

    const album = await prisma.album.findUnique({
      where: { id: albumId }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    if (album.artistId !== decoded.artistId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this album' },
        { status: 403 }
      );
    }

    await prisma.album.delete({
      where: { id: albumId }
    });

    return NextResponse.json({
      success: true,
      message: 'Album deleted successfully'
    });

  } catch (error) {
    console.error('Delete album error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete album' },
      { status: 500 }
    );
  }
}
