import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET!;

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function validateAuthorizationCode(contractId: number, code: string) {
  // Implement logic to validate code against contract
  return true; // Simplified for example
}