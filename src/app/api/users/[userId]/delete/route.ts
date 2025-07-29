
import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const userStore = getStore({ 
      name: 'users', 
      consistency: 'strong', 
      siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id', 
      token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'
  });

  try {
    const { blobs } = await userStore.list();
    let userKey: string | null = null;
    let userBlob: any = null;

    for (const blob of blobs) {
      const userData = await userStore.get(blob.key, { type: 'json' });
      if (userData.id === userId) {
        userKey = blob.key;
        userBlob = userData;
        break;
      }
    }

    if (!userKey) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Prevent admin deletion
    if (userBlob?.role === 'Admin') {
        return NextResponse.json({ message: 'Cannot delete admin user' }, { status: 403 });
    }

    // Delete image from blob store if it exists
    if (userBlob?.image && userBlob.image.startsWith('/api/images/')) {
        const imageStore = getStore({
            name: 'images',
            consistency: 'strong',
            siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
            token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'
        });
        try {
            const imageKey = userId;
            await imageStore.delete(imageKey);
        } catch (imgErr) {
            console.error(`Could not delete image for user ${userId}:`, imgErr);
        }
    }

    await userStore.delete(userKey);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
