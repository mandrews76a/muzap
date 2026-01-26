import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, nostrPubkey, signedEvent } = body;

    // Handle Nostr login
    if (nostrPubkey && signedEvent) {
      const artist = await prisma.artist.findUnique({
        where: { nostrPubkey }
      });

      if (!artist) {
        return NextResponse.json(
          { success: false, error: 'Artist not found with this Nostr pubkey' },
          { status: 404 }
        );
      }

      // TODO: Verify signedEvent signature (optional but recommended)

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
          artistName: artist.artistName,
          email: artist.email,
          nostrPubkey: artist.nostrPubkey
        }
      });
    }

    // Handle email/password login
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.findUnique({
      where: { email }
    });

    if (!artist) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, artist.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
        artistName: artist.artistName,
        email: artist.email,
        nostrPubkey: artist.nostrPubkey
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}