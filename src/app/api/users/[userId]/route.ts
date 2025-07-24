
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const store = getStore( process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});

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
            if (key !== 'image' && key !== 'galleryImages' && value !== null) {
                 if ((key === 'interests' || key === 'wants' || key === 'gallery') && typeof value === 'string') {
                    updatedData[key as keyof UserProfile] = value.split(',').filter(Boolean) as any;
                 } else if (key === 'age' && typeof value === 'string') {
                    updatedData[key] = Number(value);
                } else if (typeof value === 'string') {
                    updatedData[key as keyof UserProfile] = value as any;
                }
            }
        }
        
        const imageFile = formData.get('image') as File | null;
        if (imageFile && imageFile.size > 0) {
            const imageBuffer = await imageFile.arrayBuffer();
            const imageKey = userId; 
            await imageStore.set(imageKey, imageBuffer, { metadata: { contentType: imageFile.type } });
            
            const imageUrl = `/api/images/${imageKey}?t=${new Date().getTime()}`;
            updatedData.image = imageUrl;
        }

        const galleryImageFiles = formData.getAll('galleryImages') as File[];
        if (galleryImageFiles && galleryImageFiles.length > 0) {
            const galleryUrls = existingUser.gallery || [];
            for (const file of galleryImageFiles) {
                 if (file.size > 0) {
                    const imageBuffer = await file.arrayBuffer();
                    const imageKey = `${userId}-gallery-${uuidv4()}`;
                    await imageStore.set(imageKey, imageBuffer, { metadata: { contentType: file.type } });
                    galleryUrls.push(`/api/images/${imageKey}?t=${new Date().getTime()}`);
                }
            }
            updatedData.gallery = galleryUrls;
        }


        const updatedUser = { ...existingUser, ...updatedData };
        await userStore.setJSON(userKey, updatedUser);
        
        const { password, ...userToReturn } = updatedUser;
        return NextResponse.json(userToReturn);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
