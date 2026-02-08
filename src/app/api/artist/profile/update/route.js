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

export async function PUT(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, slug, bio, websiteUrl, twitterUrl, instagramUrl, lightningAddress } = body;

    // Validate slug format (lowercase, hyphens, numbers only)
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { success: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check if slug is already taken by another artist
    if (slug) {
      const existingArtist = await prisma.artist.findFirst({
        where: {
          slug: slug,
          NOT: { id: decoded.artistId }
        }
      });

      if (existingArtist) {
        return NextResponse.json(
          { success: false, error: 'This slug is already taken' },
          { status: 409 }
        );
      }
    }

    // Update artist profile
    const updatedArtist = await prisma.artist.update({
      where: { id: decoded.artistId },
      data: {
        displayName: displayName || undefined,
        slug: slug || undefined,
        bio: bio || undefined,
        websiteUrl: websiteUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        lightningAddress: lightningAddress || undefined
      }
    });

    return NextResponse.json({
      success: true,
      artist: {
        id: updatedArtist.id,
        displayName: updatedArtist.displayName,
        slug: updatedArtist.slug
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}