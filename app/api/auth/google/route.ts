import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      token: 'mock-jwt-token-123',
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
  }
}
