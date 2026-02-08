import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { usdToSats } from '@/lib/exchangeRate';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { albumId } = body;

    if (!albumId) {
      return NextResponse.json(
        { success: false, error: 'Album ID is required' },
        { status: 400 }
      );
    }

    // Verify album exists
    const album = await prisma.album.findUnique({
      where: { id: parseInt(albumId) }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Album not found' },
        { status: 404 }
      );
    }

    // Calculate sats from the album's USD price at time of purchase
    const amountInSats = await usdToSats(album.priceUsd);

    // TODO: Implement actual Alby Lightning invoice creation
    // For now, create a mock invoice and simulate payment

    const invoice = {
      paymentRequest: 'lnbc' + Math.random().toString(36).substring(2, 15),
      paymentHash: Math.random().toString(36).substring(2, 15),
      amount: amountInSats,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };

    // For mock payment, we'll skip storing in database for now
    // In production with real Lightning, you'd store the pending payment
    // and verify it before marking as purchased

    return NextResponse.json({
      success: true,
      invoice: {
        paymentRequest: invoice.paymentRequest,
        paymentHash: invoice.paymentHash,
        amount: amountInSats
      }
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}