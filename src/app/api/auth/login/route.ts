
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';

const saltRounds = 10;

// This function ensures the admin user exists and returns the user profile.
async function ensureAdminUser(store: Store): Promise<UserProfile | null> {
    const adminEmail = 'saytee.software@gmail.com';
    try {
        const adminData: UserProfile = await store.get(adminEmail, { type: 'json' });
        if (adminData && !adminData.password) {
             const hashedPassword = await bcrypt.hash('password123', saltRounds);
             const updatedAdmin = { ...adminData, password: hashedPassword };
             await store.setJSON(adminEmail, updatedAdmin);
             return updatedAdmin;
        }
        return adminData;
    } catch (error: any) {
        if (error.status === 404 || (error.message && error.message.includes('not found'))) {
            const mockAdmin = mockUsers.find(u => u.email === adminEmail);
            if (mockAdmin) {
                const hashedPassword = await bcrypt.hash('password123', saltRounds);
                const adminUser: UserProfile = { ...mockAdmin, password: hashedPassword };
                await store.setJSON(adminEmail, adminUser);
                return adminUser;
            }
        } else {
            console.error("Error ensuring admin user:", error);
        }
    }
    return null;
}

export async function POST(request: NextRequest) {
  let store: Store;
   if (process.env.NETLIFY) {
    store = getStore('users');
  } else {
    store = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token' });
  }
  
  // Ensure the admin user exists before any login attempt
  await ensureAdminUser(store);

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  try {
    const user: UserProfile | null = await store.get(email, { type: 'json' }).catch(() => null);

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userToReturn } = user;

    return NextResponse.json({ user: userToReturn });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
}
