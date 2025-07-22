import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { imageKey: string } }
) {
  const { imageKey } = params;
  const store = getStore('images');

  try {
    const blob = await store.get(imageKey, { type: 'blob' });
    if (!blob) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type,
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
