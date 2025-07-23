
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';

async function findUserByKey(store: Store, userId: string): Promise<{key: string, user: UserProfile} | null> {
    const { blobs } = await store.list();
    for (const blob of blobs) {
      const user = await store.get(blob.key, { type: 'json' });
      if (user.id === userId) {
        return { key: blob.key, user };
      }
    }
    return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const store = getStore( process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});

  try {
    const result = await findUserByKey(store, userId);
    if (result) {
        return NextResponse.json(result.user);
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
    
    const userStore = getStore( process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
    const imageStore = getStore( process.env.NETLIFY ? 'images' : { name: 'images', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});

    try {
        const result = await findUserByKey(userStore, userId);
        if (!result) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const { key: userKey, user: existingUser } = result;

        const updatedData: Partial<UserProfile> = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'image') {
                 if (key === 'interests' && typeof value === 'string') {
                    updatedData[key] = value.split(',').map(item => item.trim());
                } else if (key === 'age') {
                    updatedData[key] = Number(value);
                } else {
                    updatedData[key as keyof UserProfile] = value as any;
                }
            }
        }
        
        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0) {
            const imageBuffer = await imageFile.arrayBuffer();
            const imageKey = userId; // Use user ID as the image key
            await imageStore.set(imageKey, imageBuffer, { metadata: { contentType: imageFile.type } });
            
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
