import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { isValidNostrPubkey, verifyNostrSignature } from '@/lib/nostr';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.userType !== 'artist') {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { npub, signature } = await request.json();

    // Validate Nostr pubkey
    if (!isValidNostrPubkey(npub)) {
      return Response.json(
        { error: 'Invalid Nostr public key' },
        { status: 400 }
      );
    }

    // Verify signature (proves ownership)
    const message = `Connecting Nostr identity to artist ID: ${decoded.userId}`;
    const valid = verifyNostrSignature(npub, signature, message);

    if (!valid) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Update artist with Nostr pubkey
    const artist = await prisma.artist.update({
      where: { id: decoded.userId },
      data: { nostrPubkey: npub }
    });

    return Response.json({
      success: true,
      message: 'Nostr identity connected successfully',
      artist: {
        id: artist.id,
        displayName: artist.displayName,
        nostrPubkey: artist.nostrPubkey
      }
    });
  } catch (error) {
    console.error('Nostr connection error:', error);
    return Response.json(
      { error: 'Failed to connect Nostr identity' },
      { status: 500 }
    );
  }
} 