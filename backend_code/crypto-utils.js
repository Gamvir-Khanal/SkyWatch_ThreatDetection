'use strict';
const crypto = require('node:crypto');
const PSK = process.env.SKYWATCH_PSK || 'SkyWatch-Tactical-PSK-v1-CHANGE-IN-PROD';
const SALT = Buffer.from('SkyWatch-PBKDF2-Salt-2026', 'utf8');
const { encKey, authKey } = (() => {
  const master = crypto.pbkdf2Sync(PSK, SALT, 310_000, 64, 'sha256');
  return {
    encKey:  master.subarray(0, 32),
    authKey: master.subarray(32, 64),
  };
})();
function encrypt(plainObj) {
  const iv          = crypto.randomBytes(16);
  const plaintext   = Buffer.from(JSON.stringify(plainObj), 'utf8');
  const cipher      = crypto.createCipheriv('aes-256-cbc', encKey, iv);
  const ciphertextBuf = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const mac = crypto.createHmac('sha256', authKey)
    .update(iv)
    .update(ciphertextBuf)
    .digest();
  return {
    _enc      : true,
    iv        : iv.toString('hex'),
    ciphertext: ciphertextBuf.toString('hex'),
    hmac      : mac.toString('hex'),
  };
}
function decrypt(envelope) {
  if (!envelope || envelope._enc !== true) {
    throw new Error('[CRYPTO] Envelope missing _enc sentinel — cannot decrypt.');
  }
  const iv            = Buffer.from(envelope.iv,         'hex');
  const ciphertextBuf = Buffer.from(envelope.ciphertext, 'hex');
  const receivedMac   = Buffer.from(envelope.hmac,       'hex');
  const expectedMac = crypto.createHmac('sha256', authKey)
    .update(iv)
    .update(ciphertextBuf)
    .digest();
  if (!crypto.timingSafeEqual(expectedMac, receivedMac)) {
    throw new Error('[CRYPTO] HMAC verification failed — message may be tampered.');
  }
  const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
  const plainBuf = Buffer.concat([decipher.update(ciphertextBuf), decipher.final()]);
  return JSON.parse(plainBuf.toString('utf8'));
}
function computeRequestHmac(data) {
  return crypto.createHmac('sha256', authKey)
    .update(typeof data === 'string' ? Buffer.from(data, 'utf8') : data)
    .digest('hex');
}
module.exports = { encrypt, decrypt, computeRequestHmac };
