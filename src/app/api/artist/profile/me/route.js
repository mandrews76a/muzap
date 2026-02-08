import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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

export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const artist = await prisma.artist.findUnique({
      where: { id: decoded.artistId }
    });

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      artist: {
        id: artist.id,
        displayName: artist.displayName,
        slug: artist.slug,
        bio: artist.bio,
        avatarUrl: artist.avatarUrl,
        bannerUrl: artist.bannerUrl,
        websiteUrl: artist.websiteUrl,
        twitterUrl: artist.twitterUrl,
        instagramUrl: artist.instagramUrl,
        nostrPubkey: artist.nostrPubkey,
        lightningAddress: artist.lightningAddress
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}