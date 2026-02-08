let cachedRate = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SATS_PER_BTC = 100_000_000;

export async function getBtcUsdRate() {
  const now = Date.now();

  if (cachedRate && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedRate;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data = await response.json();
    cachedRate = data.bitcoin.usd;
    cacheTimestamp = now;
    return cachedRate;
  } catch (error) {
    console.error('Failed to fetch BTC/USD rate:', error);
    if (cachedRate) {
      return cachedRate;
    }
    throw new Error('Unable to fetch exchange rate and no cached rate available');
  }
}

export async function usdToSats(usd) {
  const btcPrice = await getBtcUsdRate();
  const btcAmount = usd / btcPrice;
  return Math.round(btcAmount * SATS_PER_BTC);
}

export async function satsToUsd(sats) {
  const btcPrice = await getBtcUsdRate();
  const btcAmount = sats / SATS_PER_BTC;
  return btcAmount * btcPrice;
}
