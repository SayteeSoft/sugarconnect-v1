import { getStore } from '@netlify/blobs';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';

export async function GET() {
  const store = getStore( process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
  try {
    const { blobs } = await store.list();
    const users: UserProfile[] = [];
    for (const blob of blobs) {
      const user = await store.get(blob.key, { type: 'json' });
      users.push(user);
    }
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ message: 'Failed to list users' }, { status: 500 });
  }
}
