import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { imageKey: string } }
) {
  const { imageKey } = params;

  if (!imageKey) {
    return NextResponse.json({ message: 'Image key is required' }, { status: 400 });
  }

  const store = getStore({ 
      name: 'images', 
      consistency: 'strong', 
      siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id', 
      token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token'
  });

  try {
    const blob = await store.get(imageKey, { type: 'blob' });
    if (!blob) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
