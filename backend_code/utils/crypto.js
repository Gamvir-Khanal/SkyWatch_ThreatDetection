const crypto = require('crypto');
const DEFAULT_KEY = '536b7957617463682d546163746963616c2d4145532d3235362d47434d2d4b65';
const keyBuffer = Buffer.from(process.env.COMM_SECRET_KEY || DEFAULT_KEY, 'hex');
if (keyBuffer.length !== 32) {
  throw new Error('[CRYPTO] COMM_SECRET_KEY must be exactly 32 bytes (64 hex characters) for AES-256-GCM.');
}
function encryptPayload(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  const plaintext = JSON.stringify(data);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    _enc: true,
    iv: iv.toString('hex'),
    ciphertext,
    authTag,
    timestamp: Date.now()
  };
}
module.exports = { encryptPayload };
