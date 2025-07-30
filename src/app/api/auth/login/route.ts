
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

async function ensureAdminUser(store: Store): Promise<UserProfile> {
  const adminEmail = 'saytee.software@gmail.com';
  let adminData: UserProfile | null = null;
  
  try {
    adminData = await store.get(adminEmail, { type: 'json' });
  } catch(e) {
    // Admin does not exist, will be created.
  }

  if (adminData) {
    // If password exists but isn't hashed, hash it.
    if (adminData.password && !adminData.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        adminData.password = hashedPassword;
        await store.setJSON(adminEmail, adminData);
    }
    return adminData;
  }

  const adminTemplate = mockUsers.find(u => u.role === 'Admin');
  if (!adminTemplate) {
    throw new Error(`Admin template not found in mock data.`);
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
    const lowerCaseEmail = email.toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    let user: UserProfile | null = null;
    
    if (lowerCaseEmail === 'saytee.software@gmail.com') {
      user = await ensureAdminUser(store);
    } else {
      try {
        const userData = await store.get(lowerCaseEmail, { type: 'json' });
        user = userData as UserProfile;
      } catch (error) {
        // This catch block will trigger if the user blob doesn't exist.
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
