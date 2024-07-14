import { NextResponse } from 'next/server';
import { extendSession } from './app/actions/extendSession.js';

export default async function middleware(request) {
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/signIn';
    return NextResponse.redirect(url);
  }

  // await extendSession();

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!signIn|signUp|_next/static|_next/image|favicon.ico|public).*)',
  ],
};