import { EncryptJWT, generateKeyPair } from 'jose';

const key = process.env.SECRET;

export default async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5 minutes from now')
    .sign(key);
}