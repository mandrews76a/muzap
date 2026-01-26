import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper to verify JWT token
function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
}

// GET - Fetch artist's albums
export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const albums = await prisma.album.findMany({
      where: { artistId: decoded.artistId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    });

    // Calculate stats
    const stats = {
      totalEarnings: albums.reduce((sum, album) => {
        return sum + (album.priceInSats * album._count.purchases);
      }, 0),
      totalSales: albums.reduce((sum, album) => sum + album._count.purchases, 0),
      totalStreams: albums.reduce((sum, album) => sum + (album.plays || 0), 0)
    };

    // Format albums for response
    const formattedAlbums = albums.map(album => ({
      id: album.id,
      title: album.title,
      genre: album.genre,
      priceInSats: album.priceInSats,
      coverUrl: album.coverUrl,
      sales: album._count.purchases,
      plays: album.plays || 0,
      createdAt: album.createdAt
    }));

    return NextResponse.json({
      success: true,
      albums: formattedAlbums,
      stats
    });

  } catch (error) {
    console.error('Fetch albums error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

// POST - Create new album
export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const genre = formData.get('genre');
    const priceInSats = parseInt(formData.get('priceInSats'));
    const description = formData.get('description');
    const releaseDate = formData.get('releaseDate');
    const coverImage = formData.get('coverImage');

    // Validate required fields
    if (!title || !genre || !priceInSats) {
      return NextResponse.json(
        { success: false, error: 'Title, genre, and price are required' },
        { status: 400 }
      );
    }

    // TODO: Handle file upload for coverImage
    // For now, we'll store a placeholder
    let coverUrl = null;
    if (coverImage) {
      // Implement file upload logic here (e.g., upload to cloud storage)
      coverUrl = '/placeholder-cover.jpg'; // Placeholder
    }

    // Create album
    const album = await prisma.album.create({
      data: {
        title,
        genre,
        priceInSats,
        description,
        releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
        coverUrl,
        artistId: decoded.artistId
      }
    });

    return NextResponse.json({
      success: true,
      album: {
        id: album.id,
        title: album.title,
        genre: album.genre,
        priceInSats: album.priceInSats
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