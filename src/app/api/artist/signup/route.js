import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { artistName, email, password, confirmPassword, nostrPubkey, signedEvent } = body;

    // Use artistName as displayName
    const displayName = artistName;

    // Validate display name
    if (!displayName) {
      return NextResponse.json(
        { success: false, error: 'Artist name is required' },
        { status: 400 }
      );
    }

    // Handle Nostr signup
    if (nostrPubkey && signedEvent) {
      // Check if artist with this Nostr pubkey already exists
      const existingArtist = await prisma.artist.findUnique({
        where: { nostrPubkey }
      });

      if (existingArtist) {
        return NextResponse.json(
          { success: false, error: 'Artist already exists with this Nostr pubkey' },
          { status: 409 }
        );
      }

      // TODO: Verify signedEvent signature (optional but recommended)

      // Create artist with Nostr
      const artist = await prisma.artist.create({
        data: {
          displayName,
          nostrPubkey,
          email: `${nostrPubkey.slice(0, 16)}@nostr.local` // Dummy email for Nostr users
        }
      });

      const token = jwt.sign(
        { artistId: artist.id, email: artist.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        token,
        artist: {
          id: artist.id,
          displayName: artist.displayName,
          nostrPubkey: artist.nostrPubkey
        }
      });
    }

    // Handle email/password signup
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if artist with this email already exists
    const existingArtist = await prisma.artist.findUnique({
      where: { email }
    });

    if (existingArtist) {
      return NextResponse.json(
        { success: false, error: 'Artist already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create artist
    const artist = await prisma.artist.create({
      data: {
        displayName,
        email,
        password: passwordHash
      }
    });

    const token = jwt.sign(
      { artistId: artist.id, email: artist.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      artist: {
        id: artist.id,
        displayName: artist.displayName,
        email: artist.email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Signup failed' },
      { status: 500 }
    );
  }
}