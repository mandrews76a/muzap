import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { verifyPayment } from '@/lib/lightning';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentHash, albumId } = await request.json();

    // Verify Lightning payment
    const paid = await verifyPayment(paymentHash);

    if (!paid) {
      return Response.json(
        { error: 'Payment not confirmed' },
        { status: 400 }
      );
    }

    // Get album
    const album = await prisma.album.findUnique({
      where: { id: parseInt(albumId) }
    });

    // Record purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: decoded.userId,
        albumId: parseInt(albumId),
        paymentHash: paymentHash,
        amountSats: album.priceSats
      }
    });

    return Response.json({
      success: true,
      purchase,
      message: 'Payment confirmed! You now have access to this album.'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}