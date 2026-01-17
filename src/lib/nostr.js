import { nip19, verifyEvent } from 'nostr-tools';

export function isValidNostrPubkey(npub) {
  try {
    const decoded = nip19.decode(npub);
    return decoded.type === 'npub';
  } catch {
    return false;
  }
}

export function verifyNostrSignature(event) {
  try {
    return verifyEvent(event);
  } catch {
    return false;
  }
}

export async function publishToNostr(event, relays) {
  const { SimplePool } = require('nostr-tools');
  const pool = new SimplePool();
  
  try {
    await Promise.all(pool.publish(relays, event));
    pool.close(relays);
    return true;
  } catch (error) {
    console.error('Nostr publish failed:', error);
    return false;
  }
}