
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/lib/users';
import bcrypt from 'bcrypt';
import { mockUsers } from '@/lib/mock-data';

const saltRounds = 10;

// This function ensures the admin user exists and has a securely hashed password.
async function ensureAdminUser(store: Store) {
    const adminEmail = 'saytee.software@gmail.com';
    try {
        const adminExists = await store.get(adminEmail, { type: 'json' }).catch(() => null);
        if (adminExists && adminExists.password) {
            // Admin user already exists with a password, do nothing.
            return;
        }
        
        // Admin does not exist or is missing a password, create it from mock data definition
        const mockAdmin = mockUsers.find(u => u.email === adminEmail);
        if (mockAdmin) {
            const hashedPassword = await bcrypt.hash('password123', saltRounds);
            const adminUser: UserProfile = {
                ...mockAdmin,
                password: hashedPassword,
            };
            await store.setJSON(adminEmail, adminUser);
            console.log('Admin user created/updated successfully.');
        }
    } catch (error: any) {
       // Catch any other errors during admin creation
       console.error("Failed to ensure admin user exists:", error);
    }
}


export async function POST(request: NextRequest) {
  let userStore: Store;
  if (process.env.NETLIFY) {
    userStore = getStore('users');
  } else {
    // Ensure mock credentials are used for local development
    userStore = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
  }

  // Ensure the admin user exists with a hashed password. This seeds the admin account.
  await ensureAdminUser(userStore);

  const { email, password, name, role } = await request.json();

  if (!email || !password || !name || !role) {
    return NextResponse.json({ message: 'Email, password, name, and role are required' }, { status: 400 });
  }

  // Prevent re-registering the admin email
  if (email.toLowerCase() === 'saytee.software@gmail.com') {
      return NextResponse.json({ message: 'This email is reserved.' }, { status: 409 });
  }

  try {
    const existingUser = await userStore.get(email, { type: 'json' }).catch(() => null);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }
  } catch (error) {
    // Other errors with the store, can be ignored for this check.
  }
  
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser: UserProfile = {
    id: uuidv4(),
    email,
    password: hashedPassword,
    name,
    age: 0, // Default value, can be updated later
    location: '', // Default value
    role,
    sex: 'Other', // Default value
    bio: '', // Default value
    interests: [], // Default value
    image: `https://placehold.co/400x400.png?text=${name.charAt(0)}`,
  };

  await userStore.setJSON(email, newUser);
  
  // Return user object without the password hash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userToReturn } = newUser;

  return NextResponse.json(userToReturn, { status: 201 });
}
