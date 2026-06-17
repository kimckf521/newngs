import 'server-only';
import crypto from 'node:crypto';
import { wecom } from './config';

/**
 * WeCom message-callback crypto (WXBizMsgCrypt). The EncodingAESKey is a 43-char
 * base64 string; append "=" and decode to a 32-byte AES-256 key whose first 16
 * bytes are the IV. Messages are AES-256-CBC with a custom envelope:
 *   [16 random bytes][4-byte big-endian msg length][msg][receiveid(corpid)]
 */
function aesKey(): Buffer {
  return Buffer.from(wecom.aesKey + '=', 'base64');
}

/** sha1 over the sorted [token, timestamp, nonce, encrypt] — matches msg_signature. */
export function signature(timestamp: string, nonce: string, encrypt: string): string {
  return crypto
    .createHash('sha1')
    .update([wecom.token, timestamp, nonce, encrypt].sort().join(''))
    .digest('hex');
}

export function decrypt(encryptB64: string): { message: string; receiveId: string } {
  const key = aesKey();
  const iv = key.subarray(0, 16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  decipher.setAutoPadding(false);
  let buf = Buffer.concat([decipher.update(Buffer.from(encryptB64, 'base64')), decipher.final()]);
  const pad = buf[buf.length - 1];
  buf = buf.subarray(0, buf.length - pad); // strip PKCS#7 padding
  const msgLen = buf.readUInt32BE(16);
  const message = buf.subarray(20, 20 + msgLen).toString('utf8');
  const receiveId = buf.subarray(20 + msgLen).toString('utf8');
  return { message, receiveId };
}
