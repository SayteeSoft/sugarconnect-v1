

import { getStore, type StoreOptions } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '@/lib/users';

export async function POST(request: NextRequest) {
  const getStoreOptions = (name: string): StoreOptions | string => {
    if (process.env.NETLIFY) {
      return name;
    }
    return {
      name,
      consistency: 'strong',
      siteId: 'studio-mock-site-id',
      token: 'studio-mock-token',
    };
  }

  const userStore = getStore(getStoreOptions('users'));
  const imageStore = getStore(getStoreOptions('images'));

  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const existingUser = await userStore.get(email);
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 409 });
  }
  
  const newUser: UserProfile = {
    id: uuidv4(),
    email: email,
    name: formData.get('name') as string,
    age: Number(formData.get('age')),
    location: formData.get('location') as string,
    role: formData.get('role') as UserProfile['role'],
    sex: formData.get('sex') as UserProfile['sex'],
    bio: formData.get('bio') as string,
    interests: (formData.get('interests') as string).split(',').map(s => s.trim()),
    image: '',
  };
  
  const imageFile = formData.get('image') as File | null;
  if (imageFile) {
      const imageBuffer = await imageFile.arrayBuffer();
      const imageKey = newUser.id; // Use new user's ID as the key
      await imageStore.set(imageKey, imageBuffer, {
          metadata: { name: imageFile.name, type: imageFile.type }
      });
      newUser.image = `/api/images/${imageKey}`;
  }


  await userStore.setJSON(email, newUser);
  return NextResponse.json(newUser, { status: 201 });
}
