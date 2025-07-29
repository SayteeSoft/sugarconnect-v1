
import { getStore, Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';

const getUserBlobStore = (): Store => getStore({
    name: 'users',
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
    token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'
});

const getImageBlobStore = (): Store => getStore({
    name: 'images',
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
    token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'
});

async function findUserById(userStore: Store, userId: string): Promise<{ key: string; user: UserProfile } | null> {
    const { blobs } = await userStore.list();
    for (const blob of blobs) {
        try {
            const userData: UserProfile = await userStore.get(blob.key, { type: 'json' });
            if (userData.id === userId) {
                return { key: blob.key, user: userData };
            }
        } catch (e) {
            console.warn(`Could not parse or match blob ${blob.key} while searching for user ${userId}.`, e);
        }
    }
    return null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const userStore = getUserBlobStore();

  try {
    const userToDelete = await findUserById(userStore, userId);

    if (!userToDelete) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Prevent admin deletion
    if (userToDelete.user.role === 'Admin') {
        return NextResponse.json({ message: 'Cannot delete admin user' }, { status: 403 });
    }

    // Delete image from blob store if it exists
    if (userToDelete.user.image && userToDelete.user.image.startsWith('/api/images/')) {
        const imageStore = getImageBlobStore();
        try {
            // The image key is the user ID for profile images
            const imageKey = userToDelete.user.id;
            await imageStore.delete(imageKey);
        } catch (imgErr) {
            console.error(`Could not delete image for user ${userId}:`, imgErr);
        }
    }

    // Use the user's email (which is the key) to delete the user blob
    await userStore.delete(userToDelete.key);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
