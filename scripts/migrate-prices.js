// One-time script to backfill priceUsd from existing priceSats data
// Run with: node scripts/migrate-prices.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SATS_PER_BTC = 100_000_000;

async function main() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
  );
  const data = await response.json();
  const btcUsd = data.bitcoin.usd;
  console.log(`Current BTC/USD rate: $${btcUsd}`);

  const albums = await prisma.album.findMany();
  for (const album of albums) {
    if (album.priceSats && !album.priceUsd) {
      const usd = parseFloat(((album.priceSats / SATS_PER_BTC) * btcUsd).toFixed(2));
      await prisma.album.update({
        where: { id: album.id },
        data: { priceUsd: usd }
      });
      console.log(`Album ${album.id} "${album.title}": ${album.priceSats} sats -> $${usd}`);
    }
  }

  const tracks = await prisma.track.findMany({ where: { priceSats: { not: null } } });
  for (const track of tracks) {
    if (track.priceSats && !track.priceUsd) {
      const usd = parseFloat(((track.priceSats / SATS_PER_BTC) * btcUsd).toFixed(2));
      await prisma.track.update({
        where: { id: track.id },
        data: { priceUsd: usd }
      });
      console.log(`Track ${track.id} "${track.title}": ${track.priceSats} sats -> $${usd}`);
    }
  }

  console.log('Migration complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
