
'use server';

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';
import { sendEmail } from '@/lib/email';
import { initiateConversation } from '@/ai/flows/initiate-conversation';
import { Message } from '@/lib/messages';

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
        adminData = await store.get(adminEmail, {type: 'json'});
    } catch (e) {
        // Admin user does not exist, will create.
    }

    if (adminData) return adminData;

    const adminTemplate = mockUsers.find(u => u.role === 'Admin');
    if (!adminTemplate) throw new Error("Admin template not found in mock data.");

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser: UserProfile = {
        ...adminTemplate,
        email: adminEmail,
        password: hashedPassword,
    };
    await store.setJSON(adminEmail, adminUser);
    return adminUser;
}

export async function POST(request: NextRequest) {
    try {
        const userStore = getBlobStore('users');
        
        const adminUser = await ensureAdminUser(userStore);

        const { name, email, password, role } = await request.json();
        const lowerCaseEmail = email.toLowerCase();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        try {
            const existingUser = await userStore.get(lowerCaseEmail);
            if (existingUser) {
                return NextResponse.json({ message: 'User already exists' }, { status: 409 });
            }
        } catch(e) {
            // This is expected if the user does not exist
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://sugarconnect-v1.netlify.app';

        const newUser: UserProfile = {
            id: uuidv4(),
            email: lowerCaseEmail,
            name,
            password: hashedPassword,
            role,
            age: 0,
            location: '',
            sex: 'Male',
            bio: '',
            interests: [],
            image: '',
            credits: role === 'Sugar Daddy' ? 10 : undefined,
        };

        await userStore.setJSON(lowerCaseEmail, newUser);

        // Send welcome email
        await sendEmail({
            to: email,
            recipientName: name,
            subject: 'Welcome to Sugar Connect!',
            body: `We are thrilled to have you join our community! Get started by completing your profile to find your perfect match.`,
            callToAction: {
                text: 'Complete Your Profile',
                url: `${siteUrl}/dashboard/profile/${newUser.id}?edit=true`
            }
        });

        // Generate and send AI welcome message from Admin
        const aiMessageResponse = await initiateConversation({
            senderProfile: JSON.stringify(adminUser),
            recipientProfile: JSON.stringify(newUser),
            senderRole: 'Admin'
        });

        if (aiMessageResponse && aiMessageResponse.message) {
            const messagesStore = getBlobStore('messages');
            const conversationId = [adminUser.id, newUser.id].sort().join('--');
            const welcomeMessage: Message = {
                id: uuidv4(),
                conversationId,
                senderId: adminUser.id,
                text: aiMessageResponse.message,
                timestamp: new Date().toISOString()
            };
            await messagesStore.setJSON(conversationId, { messages: [welcomeMessage] });

            // Notify user of new message
            await sendEmail({
                to: newUser.email,
                recipientName: newUser.name,
                subject: `You have a new message from ${adminUser.name}`,
                body: `You have received a new message from ${adminUser.name} on Sugar Connect.\n\nMessage: "${welcomeMessage.text}"`,
                imageUrl: `${siteUrl}${adminUser.image}`,
                callToAction: {
                    text: 'Click here to reply',
                    url: `${siteUrl}/messages?userId=${adminUser.id}`
                }
            });
        }
        
        const { password: _, ...userToReturn } = newUser;

        return NextResponse.json({ message: 'User registered successfully', user: userToReturn }, { status: 201 });
    } catch(error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
