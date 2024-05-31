import { NextResponse } from 'next/server';

export default function middleware(request) {
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/signIn';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!signIn|signUp|_next/static|_next/image|favicon.ico|public).*)',
  ],
};