
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
  // Use a mock store for local development
  return getStore({
    name: 'users',
    consistency: 'strong',
    siteID: 'studio-mock-site-id',
    token: 'studio-mock-token',
  });
};

// This function ensures the admin user exists, creating it if necessary.
async function ensureAdminUser(store: Store): Promise<UserProfile> {
  const adminEmail = 'saytee.software@gmail.com';
  try {
    const adminData = await store.get(adminEmail, { type: 'json' });
    if (adminData && adminData.password) {
      return adminData as UserProfile;
    }
  } catch (error) {
    // Admin does not exist, so we will create it.
  }

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
  const store = getBlobStore();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  let user: UserProfile | null = null;

  try {
    if (email.toLowerCase() === 'saytee.software@gmail.com') {
      user = await ensureAdminUser(store);
    } else {
      const userData = await store.get(email, { type: 'json' });
      user = userData as UserProfile;
    }
  } catch (error) {
     // User not found, which we handle below
  }

  if (!user || !user.password) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  // Omit password from the response
  const { password: _, ...userToReturn } = user;

  // In a real app, you would set a session cookie here.
  // For this demo, we return user info to be stored in localStorage.
  return NextResponse.json({ message: 'Login successful', user: userToReturn });
}
