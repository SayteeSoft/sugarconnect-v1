
'use server';

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import bcrypt from 'bcrypt';
import { mockUsers } from '@/lib/mock-data';

const getBlobStore = (): Store => {
  return getStore({
    name: 'users',
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
    token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
  });
};

async function ensureAdminUser(store: Store, adminEmail: string): Promise<UserProfile> {
  let adminData: UserProfile | null = null;
  const lowerCaseAdminEmail = adminEmail.toLowerCase();
  
  try {
    adminData = await store.get(lowerCaseAdminEmail, { type: 'json' });
  } catch(e) {
    // Admin does not exist, will be created.
  }

  if (adminData) {
    // If admin exists but password is not hashed, hash it.
    if (!adminData.password || !adminData.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminData.password = hashedPassword;
        await store.setJSON(lowerCaseAdminEmail, adminData);
    }
    return adminData;
  }

  // Find the first user with 'Admin' role to use as a template.
  const adminTemplate = mockUsers.find(u => u.email.toLowerCase() === lowerCaseAdminEmail);
  if (!adminTemplate) {
    throw new Error(`Admin template not found in mock data for email ${lowerCaseAdminEmail}.`);
  }
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser: UserProfile = {
    ...adminTemplate,
    email: lowerCaseAdminEmail,
    password: hashedPassword,
  };

  await store.setJSON(lowerCaseAdminEmail, adminUser);
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
    const lowerCaseEmail = email.toLowerCase();
    
    const isAdminLoginAttempt = lowerCaseEmail === 'saytee.software@gmail.com';

    if (process.env.NODE_ENV !== 'production' && isAdminLoginAttempt) {
      user = await ensureAdminUser(store, lowerCaseEmail);
    } else {
      try {
        user = (await store.get(lowerCaseEmail, { type: 'json' })) as UserProfile;
      } catch (error) {
        // If user not found in blob store, deny access
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
