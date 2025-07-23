
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data'; // Import mockUsers to get admin details

const saltRounds = 10;

// This function ensures the admin user exists and has a securely hashed password.
async function ensureAdminUser(store: Store) {
    const adminEmail = 'saytee.software@gmail.com';
    try {
        const adminData: UserProfile = await store.get(adminEmail, { type: 'json' });
        if (adminData && !adminData.password) {
             const hashedPassword = await bcrypt.hash('password123', saltRounds);
             adminData.password = hashedPassword;
             await store.setJSON(adminEmail, adminData);
        }
    } catch (error: any) {
        if (error.status === 404 || (error.message && error.message.includes('not found'))) {
            // Admin does not exist, create it from mock data definition
            const mockAdmin = mockUsers.find(u => u.email === adminEmail);
            if (mockAdmin) {
                const hashedPassword = await bcrypt.hash('password123', saltRounds);
                const adminUser: UserProfile = {
                    ...mockAdmin,
                    password: hashedPassword,
                };
                await store.setJSON(adminEmail, adminUser);
            }
        } else {
            // Log other errors but don't prevent login flow
            console.error("Error ensuring admin user:", error);
        }
    }
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
