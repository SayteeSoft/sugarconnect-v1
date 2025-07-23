import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UserProfile } from '@/lib/users';

export async function POST(request: NextRequest) {
  let store: Store;
  if (process.env.NETLIFY) {
    store = getStore('users');
  } else {
    store = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token' });
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const user: UserProfile = await store.get(email, { type: 'json' });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Don't send the password hash back to the client
    const { password: _, ...userToReturn } = user;

    return NextResponse.json({ user: userToReturn });

  } catch (error) {
    // This handles the case where the user doesn't exist, as get() throws an error.
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
}
