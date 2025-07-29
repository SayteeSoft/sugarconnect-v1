
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
        siteID: process.env.NETLIFY_PROJECT_ID || 'fallback-site-id', // Add a fallback if env var is missing
        token: process.env.NETLIFY_BLOBS_TOKEN || 'fallback-token', // Add a fallback
    });
};

async function ensureAdminUser(store: Store): Promise<void> {
    const adminEmail = 'saytee.software@gmail.com';
    try {
        await store.get(adminEmail, {type: 'json'});
    } catch (error) {
        // Admin user does not exist, create it.
        const adminTemplate = mockUsers.find(u => u.role === 'Admin');
        if (adminTemplate) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const adminUser: UserProfile = {
                ...adminTemplate,
                email: adminEmail,
                password: hashedPassword,
            };
            await store.setJSON(adminEmail, adminUser);
        }
    }
}


export async function POST(request: NextRequest) {
    try {
        const userStore = getBlobStore('users');
        await ensureAdminUser(userStore);

        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        try {
            const existingUser = await userStore.get(email, {type: 'json'});
            if (existingUser) {
                return NextResponse.json({ message: 'User already exists' }, { status: 409 });
            }
        } catch (error) {
            // User does not exist, which is what we want.
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: UserProfile = {
            id: uuidv4(),
            email,
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

        await userStore.setJSON(email, newUser);

        // Send welcome email
        await sendEmail({
            to: email,
            recipientName: name,
            subject: 'Welcome to Sugar Connect!',
            body: `
                <p>We are thrilled to have you join our community!</p>
                <p>Get started by completing your profile to find your perfect match.</p>
            `,
            callToAction: {
                text: 'Complete Your Profile',
                url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/dashboard/profile/${newUser.id}?edit=true`
            }
        });
        
        const { password: _, ...userToReturn } = newUser;

        return NextResponse.json({ message: 'User registered successfully', user: userToReturn }, { status: 201 });
    } catch(error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
