
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';

const saltRounds = 10;

// This function finds the mock admin user, hashes their password, and saves them to the store.
async function createAdminUser(store: Store): Promise<UserProfile> {
    const adminEmail = 'saytee.software@gmail.com';
    const mockAdmin = mockUsers.find(u => u.email === adminEmail);
    if (!mockAdmin) {
        throw new Error("Mock admin user not found in mock-data.ts");
    }
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    const adminUser: UserProfile = { ...mockAdmin, password: hashedPassword };
    await store.setJSON(adminEmail, adminUser);
    return adminUser;
}

export async function POST(request: NextRequest) {
  const store = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token' });
  
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    let user: UserProfile | null = await store.get(email, { type: 'json' }).catch(() => null);

    // Special handling for the admin user to ensure they exist with a valid password.
    if (email.toLowerCase() === 'saytee.software@gmail.com' && (!user || !user.password)) {
        user = await createAdminUser(store);
    }
    
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userToReturn } = user;

    const response = NextResponse.json({ user: userToReturn });

    // Set a cookie for the user session
    response.cookies.set('user-session', JSON.stringify(userToReturn), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
