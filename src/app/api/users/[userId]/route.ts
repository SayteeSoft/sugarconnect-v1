

'use server';

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

async function findUserByKey(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    const { blobs } = await store.list();
    for (const blob of blobs) {
      try {
        const user = await store.get(blob.key, { type: 'json' });
        if (user.id === userId) {
          return { key: blob.key, user };
        }
      } catch (e) {
        console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
      }
    }
    return null;
}

const getBlobStore = (name: 'users' | 'images'): Store => {
    if (process.env.NETLIFY) {
        return getStore(name);
    }
    return getStore({
        name,
        consistency: 'strong',
        siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id',
        token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
    });
};


export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  const store = getBlobStore('users');

  try {
    const result = await findUserByKey(store, userId);
    if (result) {
        const { password, ...userToReturn } = result.user;
        return NextResponse.json(userToReturn);
    }
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const formData = await request.formData();
    const userStore = getBlobStore('users');
    const imageStore = getBlobStore('images');

    try {
        const userEmail = formData.get('email') as string;
        if (!userEmail) return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
        
        const existingUser: UserProfile = await userStore.get(userEmail, { type: 'json' });
        if (existingUser.id !== userId) return NextResponse.json({ message: 'User ID mismatch.' }, { status: 400 });

        const updatedData: Partial<UserProfile> = {};
        for (const [key, value] of formData.entries()) {
            if (!['image', 'galleryImages', 'gallery', 'privateGalleryImages', 'privateGallery', 'password'].includes(key) && value !== null) {
                 if ((key === 'interests' || key === 'wants') && typeof value === 'string') updatedData[key as 'interests' | 'wants'] = value.split(',').filter(Boolean);
                 else if (key === 'age' && typeof value === 'string') updatedData.age = Number(value);
                 else if (typeof value === 'string' && key !== 'email') updatedData[key as keyof Omit<UserProfile, 'age' | 'interests' | 'wants'>] = value as any;
            }
        }
        
        if (formData.has('password')) {
            const newPassword = formData.get('password') as string;
            if (newPassword) updatedData.password = await bcrypt.hash(newPassword, 10);
        }

        if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE) {
            // Local development: Save Base64 strings directly
            if (formData.has('image')) updatedData.image = formData.get('image') as string;
            if (formData.has('gallery')) updatedData.gallery = JSON.parse(formData.get('gallery') as string);
            if (formData.has('privateGallery')) updatedData.privateGallery = JSON.parse(formData.get('privateGallery') as string);
        } else {
            // Production: Save to Netlify Blobs
            const imageFile = formData.get('image') as File | null;
            if (imageFile && typeof imageFile !== 'string') {
                const imageBuffer = await imageFile.arrayBuffer();
                await imageStore.set(userId, imageBuffer, { metadata: { contentType: imageFile.type } });
                updatedData.image = `/api/images/${userId}?t=${new Date().getTime()}`;
            } else if (formData.has('image')) {
                updatedData.image = formData.get('image') as string;
            }
            
            const galleryImageFiles = formData.getAll('galleryImages') as File[];
            let galleryUrls: string[] = JSON.parse(formData.get('gallery') as string || '[]');
            for (const file of galleryImageFiles) {
                if (file.size > 0) {
                    const imageBuffer = await file.arrayBuffer();
                    const imageKey = `${userId}-gallery-${uuidv4()}`;
                    await imageStore.set(imageKey, imageBuffer, { metadata: { contentType: file.type } });
                    galleryUrls.push(`/api/images/${imageKey}?t=${new Date().getTime()}`);
                }
            }
            updatedData.gallery = galleryUrls;
            
            const privateGalleryImageFiles = formData.getAll('privateGalleryImages') as File[];
            let privateGalleryUrls: string[] = JSON.parse(formData.get('privateGallery') as string || '[]');
            for (const file of privateGalleryImageFiles) {
                if (file.size > 0) {
                    const imageBuffer = await file.arrayBuffer();
                    const imageKey = `${userId}-private-gallery-${uuidv4()}`;
                    await imageStore.set(imageKey, imageBuffer, { metadata: { contentType: file.type } });
                    privateGalleryUrls.push(`/api/images/${imageKey}?t=${new Date().getTime()}`);
                }
            }
            updatedData.privateGallery = privateGalleryUrls;
        }

        const updatedUser = { ...existingUser, ...updatedData };
        await userStore.setJSON(userEmail, updatedUser);
        
        const { password, ...userToReturn } = updatedUser;
        return NextResponse.json(userToReturn);
    } catch (error) {
        console.error('Error updating user:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}
