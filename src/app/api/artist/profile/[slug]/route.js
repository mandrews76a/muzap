import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, context) {
  try {
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Convert slug back to potential display name (e.g., "test-artist" -> "Test Artist")
    const potentialDisplayName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Find artist by slug or displayName (case insensitive)
    const artist = await prisma.artist.findFirst({
      where: {
        OR: [
          { slug: slug },
          { displayName: { equals: potentialDisplayName, mode: 'insensitive' } },
          { displayName: { equals: slug, mode: 'insensitive' } }
        ]
      }
    });

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Get artist's albums
    const albums = await prisma.album.findMany({
      where: { artistId: artist.id },
      orderBy: { releaseDate: 'desc' },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
        priceSats: true,
        releaseDate: true
      }
    });

    // Format response
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
      },
      albums: albums.map(album => ({
        id: album.id,
        title: album.title,
        coverUrl: album.coverImageUrl,
        priceInSats: album.priceSats,
        releaseDate: album.releaseDate
      }))
    });

  } catch (error) {
    console.error('Artist profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch artist profile' },
      { status: 500 }
    );
  }
}