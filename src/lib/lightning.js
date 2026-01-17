export async function createInvoice(amountSats, description, artistLightningAddress) {
  // This is a simplified example
  // In production, you'd use Alby SDK or LNBits API
  
  try {
    const response = await fetch('https://api.getalby.com/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ALBY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountSats,
        description: description,
        recipient: artistLightningAddress
      })
    });

    const data = await response.json();
    
    return {
      invoice: data.payment_request,
      paymentHash: data.payment_hash,
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('Invoice creation failed:', error);
    throw error;
  }
}

export async function verifyPayment(paymentHash) {
  try {
    const response = await fetch(`https://api.getalby.com/invoices/${paymentHash}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ALBY_API_KEY}`
      }
    });

    const data = await response.json();
    return data.settled === true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}