'use server';

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import bcrypt from 'bcrypt';
import { mockUsers } from '@/lib/mock-data';

const getBlobStore = (): Store => {
  if (process.env.NETLIFY) {
    return getStore('users');
  }
  return getStore({
    name: 'users',
    consistency: 'strong',
    siteID: process.env.NETLIFY_PROJECT_ID || 'fallback-site-id', // Add a fallback if env var is missing
    token: process.env.NETLIFY_BLOBS_TOKEN || 'fallback-token', // Add a fallback
  });
};

async function ensureAdminUser(store: Store): Promise<UserProfile> {
  const adminEmail = 'saytee.software@gmail.com';
  let adminData: UserProfile | null = null;
  
  try {
    adminData = await store.get(adminEmail, { type: 'json' });
  } catch(e) {
    // Admin does not exist, will be created.
  }

  if (adminData) {
    // If admin exists but doesn't have a hashed password (e.g., old data), re-hash it.
    if (!adminData.password || !adminData.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminData.password = hashedPassword;
        await store.setJSON(adminEmail, adminData);
    }
    return adminData;
  }

  // Create admin user if they don't exist at all
  const adminTemplate = mockUsers.find(u => u.role === 'Admin');
  if (!adminTemplate) {
    throw new Error('Admin template not found in mock data.');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser: UserProfile = {
    ...adminTemplate,
    email: adminEmail,
    password: hashedPassword,
  };

  await store.setJSON(adminEmail, adminUser);
  return adminUser;
}

export async function POST(request: NextRequest) {
  try {
    const store = getBlobStore();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    let user: UserProfile | null = null;

    if (email.toLowerCase() === 'saytee.software@gmail.com') {
      user = await ensureAdminUser(store);
    } else {
      try {
        user = (await store.get(email, { type: 'json' })) as UserProfile;
      } catch (error) {
        // User not found in blob store
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
    }

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userToReturn } = user;
    return NextResponse.json({ message: 'Login successful', user: userToReturn });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
