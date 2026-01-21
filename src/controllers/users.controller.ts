import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { UserRole } from '@prisma/client';

interface AuthRequest extends Request {
  clerkId?: string;
}

/**
 * GET /api/users
 * List all users (filtered by role)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    const where: any = {};

    // Filter by role if provided
    if (role && typeof role === 'string') {
      where.role = role.toUpperCase() as UserRole;
    }

    // Search by name or email if provided
    if (search && typeof search === 'string') {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        profileImage: true,
        phoneNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * GET /api/users/:id
 * Get specific user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        profileImage: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        npi: true,
        licenseNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * POST /api/users
 * Create or sync user from Clerk (called during sign-up or webhook)
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      clerkId,
      email,
      firstName,
      lastName,
      role,
      phoneNumber,
      dateOfBirth,
      gender,
      specialty,
      npi,
      licenseNumber,
      profileImage,
    } = req.body;

    // Validate required fields
    if (!clerkId || !email || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields: clerkId, email, firstName, lastName',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          firstName,
          lastName,
          phoneNumber,
          profileImage,
          ...(role && { role: role as UserRole }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender && { gender }),
          ...(specialty && { specialty }),
          ...(npi && { npi }),
          ...(licenseNumber && { licenseNumber }),
        },
      });

      return res.json(updatedUser);
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        role: (role as UserRole) || UserRole.PATIENT,
        phoneNumber,
        profileImage,
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(specialty && { specialty }),
        ...(npi && { npi }),
        ...(licenseNumber && { licenseNumber }),
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
};

/**
 * GET /api/users/me
 * Get current authenticated user
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        profileImage: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        npi: true,
        licenseNumber: true,
        notificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * PATCH /api/users/me
 * Update current authenticated user
 */
export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const clerkId = req.clerkId;

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      specialty,
      npi,
      licenseNumber,
      notificationsEnabled,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(specialty && { specialty }),
        ...(npi && { npi }),
        ...(licenseNumber && { licenseNumber }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
