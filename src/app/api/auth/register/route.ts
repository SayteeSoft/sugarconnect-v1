
'use server';

import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';

const getBlobStore = (): Store => {
    if (process.env.NETLIFY) {
        return getStore('users');
    }
    // Use a mock store for local development
    return getStore({
        name: 'users',
        consistency: 'strong',
        siteID: 'studio-mock-site-id',
        token: 'studio-mock-token',
    });
};

// This function ensures the admin user exists, creating it if necessary.
async function ensureAdminUser(store: Store) {
    const adminEmail = 'saytee.software@gmail.com';
    try {
        await store.get(adminEmail);
        // Admin already exists
    } catch (error) {
        // Admin does not exist, create it
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
    const store = getBlobStore();
    
    // On the first run, ensure the admin user is created.
    await ensureAdminUser(store);

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        const existingUser = await store.get(email);
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
        // Add default values for other fields
        age: 0,
        location: '',
        sex: 'Other',
        bio: '',
        interests: [],
        image: '',
    };

    await store.setJSON(email, newUser);
    
    // Omit password from the returned object
    const { password: _, ...userToReturn } = newUser;

    return NextResponse.json({ message: 'User registered successfully', user: userToReturn }, { status: 201 });
}
