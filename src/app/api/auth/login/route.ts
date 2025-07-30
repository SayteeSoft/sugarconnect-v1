
'use server';

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import bcrypt from 'bcrypt';
import { mockUsers } from '@/lib/mock-data';
import { sendEmail } from '@/lib/email';
import { Message } from '@/lib/messages';
import { v4 as uuidv4 } from 'uuid';

const getBlobStore = (name: 'users' | 'messages'): Store => {
  return getStore({
    name,
    consistency: 'strong',
    siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
    token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
  });
};

async function ensureAdminUser(store: Store): Promise<UserProfile> {
  const adminEmail = 'saytee.software@gmail.com';
  let adminData: UserProfile | null = null;
  
  try {
    const existingAdmin = await store.get(adminEmail.toLowerCase(), { type: 'json' });
    adminData = existingAdmin as UserProfile;
  } catch(e) {
    // Admin does not exist, will be created.
  }

  if (adminData) {
    if (adminData.password && !adminData.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        adminData.password = hashedPassword;
        await store.setJSON(adminEmail.toLowerCase(), adminData);
    }
    return adminData;
  }

  const adminTemplate = mockUsers.find(u => u.role === 'Admin');
  if (!adminTemplate) {
    throw new Error(`Admin template not found in mock data.`);
  }
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser: UserProfile = {
    ...adminTemplate,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    image: adminTemplate.image || '',
    interests: adminTemplate.interests || [],
  };

  await store.setJSON(adminEmail.toLowerCase(), adminUser);
  return adminUser;
}

async function sendAnnouncementIfNeeded(user: UserProfile) {
    const messagesStore = getBlobStore('messages');
    const userStore = getBlobStore('users');
    const adminUser = await ensureAdminUser(userStore);

    const announcementConversationId = `announcement-01--${user.id}`;
    
    try {
        await messagesStore.get(announcementConversationId);
        // If get succeeds, announcement already sent.
        return;
    } catch (e) {
        // Not found, send it.
    }

    const announcementMessage: Message = {
        id: uuidv4(),
        conversationId: announcementConversationId,
        senderId: adminUser.id,
        text: "Exciting news! Our new direct messaging feature is now live. You can now connect and chat directly with other users. Click on the message icon on a user's profile to start a conversation!",
        timestamp: new Date().toISOString()
    };
    
    const conversationData = { messages: [announcementMessage] };
    await messagesStore.setJSON(announcementConversationId, conversationData);

    // This creates the conversation but we also need to add it to the main conversation thread for the user to see it.
    const mainConversationId = [adminUser.id, user.id].sort().join('--');
    let mainConversation: { messages: Message[] };
    try {
        mainConversation = await messagesStore.get(mainConversationId, { type: 'json' });
    } catch (error) {
        mainConversation = { messages: [] };
    }
    
    mainConversation.messages.push(announcementMessage);
    mainConversation.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    await messagesStore.setJSON(mainConversationId, mainConversation);


    await sendEmail({
        to: user.email,
        recipientName: user.name,
        subject: "New Feature Announcement: Direct Messaging is Here!",
        body: `Hi ${user.name},\n\nWe're excited to announce that direct messaging is now available on Sugar Connect! You can now start conversations and connect directly with other users on the platform.\n\nCheck it out by visiting a profile and clicking the message icon.`,
        callToAction: {
            text: 'Explore Profiles',
            url: `${process.env.NEXT_PUBLIC_URL || 'https://sugarconnect-v1.netlify.app'}/search`
        }
    });
}


export async function POST(request: NextRequest) {
  try {
    const store = getBlobStore('users');
    const { email, password } = await request.json();
    const lowerCaseEmail = email.toLowerCase();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    let user: UserProfile | null = null;
    
    if (lowerCaseEmail === 'saytee.software@gmail.com') {
      user = await ensureAdminUser(store);
    } else {
      try {
        const userData = await store.get(lowerCaseEmail, { type: 'json' });
        user = userData as UserProfile;
      } catch (error) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }
    }

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    // Send announcement if it's a regular user
    if(user.role !== 'Admin') {
        await sendAnnouncementIfNeeded(user);
    }


    const { password: _, ...userToReturn } = user;
    return NextResponse.json({ message: 'Login successful', user: userToReturn });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
