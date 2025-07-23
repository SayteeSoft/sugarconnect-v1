import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/lib/users';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  let userStore: Store;
  if (process.env.NETLIFY) {
    userStore = getStore('users');
  } else {
    userStore = getStore({ name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
  }

  const { email, password, name, role } = await request.json();

  if (!email || !password || !name || !role) {
    return NextResponse.json({ message: 'Email, password, name, and role are required' }, { status: 400 });
  }

  try {
    const existingUser = await userStore.get(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }
  } catch (error) {
    // Netlify blobs get throws an error if blob not found, which is expected here.
  }
  
  const saltRounds = 10;
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
  const { password: _, ...userToReturn } = newUser;

  return NextResponse.json(userToReturn, { status: 201 });
}
