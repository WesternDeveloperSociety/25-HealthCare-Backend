import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { UserRole } from '@prisma/client';
import { getAuth } from '@clerk/express';


/**
 * GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'User ID is required' });

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * POST /api/users
 * Create or sync user from Clerk
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      firstName,
      lastName,
      role,
      phoneNumber,
      dateOfBirth,
      gender,
      specialty,
      licenseNumber,
      province,
      profileImage,
    } = req.body;

    const { userId } = getAuth(req);

    if (!userId || !email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields or unauthenticated' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          email,
          firstName,
          lastName,
          phoneNumber,
          profileImage,
          ...(role && { role: role as UserRole }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender && { gender }),
        },
      });

      if (updatedUser.role === UserRole.DOCTOR) {
        await prisma.doctor.upsert({
          where: { userId: updatedUser.id },
          update: { specialty, licenseNumber, province },
          create: {
            userId: updatedUser.id,
            specialty,
            licenseNumber,
            province,
          },
        });
      }

      return res.json(updatedUser);
    }

    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        firstName,
        lastName,
        role: (role as UserRole) || UserRole.PATIENT,
        phoneNumber,
        profileImage,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
      },
    });

    if (newUser.role === UserRole.DOCTOR) {
      await prisma.doctor.create({
        data: {
          userId: newUser.id,
          specialty,
          licenseNumber,
          province,
        },
      });
    }

    if (newUser.role === UserRole.PATIENT) {
      await prisma.patient.create({
        data: {
          userId: newUser.id,
        },
      });
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
};

/**
 * GET /api/users/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * PATCH /api/users/me
 */
export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      specialty,
      licenseNumber,
      province,
      notificationsEnabled,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      },
    });

    if (specialty || licenseNumber || province) {
      await prisma.doctor.update({
        where: { userId: updatedUser.id },
        data: {
          ...(specialty && { specialty }),
          ...(licenseNumber && { licenseNumber }),
          ...(province && { province }),
        },
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
