import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const store = getStore('users');

  try {
    const { blobs } = await store.list();
    for (const blob of blobs) {
      const user = await store.get(blob.key, { type: 'json' });
      if (user.id === userId) {
        return NextResponse.json(user);
      }
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
    const formData = await request.formData();
    const userStore = getStore('users');
    const imageStore = getStore('images');

    try {
        const { blobs } = await userStore.list();
        let userKey: string | null = null;
        let existingUser: UserProfile | null = null;

        for (const blob of blobs) {
            const userData = await userStore.get(blob.key, { type: 'json' });
            if (userData.id === userId) {
                userKey = blob.key;
                existingUser = userData;
                break;
            }
        }

        if (!userKey || !existingUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const updatedData: Partial<UserProfile> = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'image') {
                 if (key === 'interests') {
                    updatedData[key] = (value as string).split(',').map(item => item.trim());
                } else if (key === 'age') {
                    updatedData[key] = Number(value);
                } else {
                    updatedData[key as keyof UserProfile] = value as any;
                }
            }
        }
        
        const imageFile = formData.get('image') as File | null;
        if (imageFile) {
            const imageBuffer = await imageFile.arrayBuffer();
            const imageKey = userId; // Use user ID as the image key
            await imageStore.set(imageKey, imageBuffer);
            
            // Generate a URL to access the image
            const imageUrl = `/api/images/${imageKey}`;
            updatedData.image = imageUrl;
        }

        const updatedUser = { ...existingUser, ...updatedData };
        await userStore.setJSON(userKey, updatedUser);

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
