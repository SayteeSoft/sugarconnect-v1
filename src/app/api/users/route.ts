import { getStore, type Store } from '@netlify/blobs';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';

export async function GET() {
  let store: Store;
  if (process.env.NETLIFY) {
    store = getStore('users');
  } else {
    store = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
  }
  
  try {
    const { blobs } = await store.list();
    const users: UserProfile[] = [];
    for (const blob of blobs) {
      const user = await store.get(blob.key, { type: 'json' });
      // Omit password from the returned user list
      const { password, ...userToReturn } = user;
      users.push(userToReturn);
    }
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ message: 'Failed to list users' }, { status: 500 });
  }
}
