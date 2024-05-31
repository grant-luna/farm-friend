import { jwtVerify } from 'jose';

const key = process.env.SECRET;

export async function decrypt(session) {
  const { payload } = await jwtVerify(session, key, {
    algorithms: ['HS256'],
  });
  return payload;
}