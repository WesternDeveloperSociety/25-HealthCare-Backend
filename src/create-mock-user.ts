import 'dotenv/config';
import prisma from './lib/prisma';
import { UserRole, Gender } from '@prisma/client';

async function main() {
    console.log('Creating mock user...');
    try {
        const user = await prisma.user.upsert({
            where: { id: 'user_2mock_id' },
            update: {},
            create: {
                id: 'user_2mock_id',
                email: 'mock@example.com',
                firstName: 'Mock',
                lastName: 'User',
                role: UserRole.PATIENT,
                gender: Gender.PREFER_NOT_TO_SAY,
                dateOfBirth: new Date('1990-01-01'),
            },
        });
        console.log('Mock user created:', user);
    } catch (e) {
        console.error('Error creating mock user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
