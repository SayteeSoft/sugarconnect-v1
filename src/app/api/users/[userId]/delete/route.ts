
import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const userStore = getStore( process.env.NETLIFY ? 'users' : { name: 'users', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});

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
        const imageStore = getStore( process.env.NETLIFY ? 'images' : { name: 'images', consistency: 'strong', siteID: 'studio-mock-site-id', token: 'studio-mock-token'});
        try {
            // The image key is the user ID.
            const imageKey = userId;
            await imageStore.delete(imageKey);
        } catch (imgErr) {
            // It's possible the image doesn't exist or another error occurred.
            // We'll log it but proceed with deleting the user data.
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
