import { clerkClient, getAuth } from '@clerk/express';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';

import prisma from '@/lib/prisma';
import { CreateUserSchema, UpdateUserSchema } from '@/schemas/users.schema';
import {
  normalizeDate,
  normalizeGender,
  normalizePhone,
  normalizeString,
} from '@/utils';
import { AppError } from '@/utils/AppError';

/*
ROUTES
  /users/ POST = createUser
  /users/me GET = getCurrentUser
  /users/me PATCH = updateCurrentUser
  /users/:id GET = getUserById
*/

/**
 * GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw AppError.BadRequest('User ID is required');

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!user) throw AppError.NotFound('User not found');

  res.json(user);
};

/**
 * GET /api/users
 * List all users (for chat user selection)
 */
export const getUsers = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw AppError.Unauthorized('Unauthorized');

  // Return all users except the current user
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
    orderBy: {
      firstName: 'asc',
    },
  });

  res.json(users);
};

/**
 * POST /api/users
 * Create or sync user from Clerk
 * ! Needs way more validation like checking if license number is legit
 */
export const createUser = async (req: Request, res: Response) => {
  const parsedBody = CreateUserSchema.shape.body.parse(req.body);

  const { email, firstName, lastName, role, phoneNumber, dateOfBirth, gender } =
    parsedBody;
  const { userId } = getAuth(req);

  if (!userId) {
    throw AppError.BadRequest('Unauthenticated');
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Checks if this is an existing user
  if (existingUser) {
    throw AppError.BadRequest(
      'User already exists, login and update the user instead'
    );
  }

  // Check if user exists in Clerk and verify user data
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    if (!clerkUser) {
      throw AppError.Unauthorized('User not found in registration');
    }

    // First name
    if (normalizeString(clerkUser.firstName) !== normalizeString(firstName)) {
      throw AppError.BadRequest('First name does not match with registration');
    }

    // Last name
    if (normalizeString(clerkUser.lastName) !== normalizeString(lastName)) {
      throw AppError.BadRequest('Last name does not match with registration');
    }

    // Phone number verification disabled - signup flow doesn't collect phone numbers
    // const phoneMatches = clerkUser.phoneNumbers?.some(
    //   (p) =>
    //     p.verification?.status === 'verified' &&
    //     normalizePhone(p.phoneNumber) === normalizePhone(phoneNumber)
    // );

    // if (!phoneMatches) {
    //   throw AppError.VerificationFailed(
    //     'Phone number does not match with verified phone numbers. Please verify your phone number.'
    //   );
    // }

    // Email (ANY verified email)
    const emailMatches = clerkUser.emailAddresses?.some(
      (e) =>
        e.verification?.status === 'verified' &&
        normalizeString(e.emailAddress) === normalizeString(email)
    );

    if (!emailMatches) {
      throw AppError.VerificationFailed(
        'Email does not match with verified emails. Please verify your email address.'
      );
    }
  } catch (error) {
    console.error('Error syncing with Clerk:', error);
    if (error instanceof AppError) throw error;
    throw AppError.Internal('Failed to sync user with Auth Service');
  }

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        id: userId,
        email: normalizeString(email),
        firstName,
        lastName,
        phoneNumber: normalizePhone(phoneNumber),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        role: (role as UserRole) || UserRole.PATIENT,
      },
    });

    // if (newUser.role === UserRole.DOCTOR && parsedBody.role === 'DOCTOR') {
    //   await tx.doctor.create({
    //     data: {
    //       userId: newUser.id,
    //       specialty: parsedBody.specialty,
    //       licenseNumber: parsedBody.licenseNumber,
    //       province: parsedBody.province,
    //     },
    //   });
    // }

    // if (newUser.role === UserRole.PATIENT && parsedBody.role === 'PATIENT') {
    //   await tx.patient.create({
    //     data: {
    //       userId: newUser.id,
    //       emergencyContactName: parsedBody.emergencyContactName,
    //       emergencyContactPhone: normalizePhone(parsedBody.emergencyContactPhone),
    //     },
    //   });
    // }

    return res.status(201).json(newUser);
  });
};

/**
 * GET /api/users/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw AppError.Unauthorized('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!user) throw AppError.NotFound('User not found');

  res.json(user);
};

/**
 * PATCH /api/users/me
 */
export const updateCurrentUser = async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw AppError.Unauthorized('Unauthorized');
  const parsedBody = UpdateUserSchema.shape.body.parse(req.body);

  const { email, phoneNumber, gender, notificationsEnabled } = parsedBody;

  // Validate that User Input is Actually a Doctor
  // if (parsedBody.role === 'DOCTOR') {
  //   const doctor = await prisma.doctor.findUnique({
  //     where: { userId },
  //   });

  //   if (!doctor) throw AppError.Unauthorized('User is not a doctor');
  // }

  // Make sure that new email or phone number is verified
  const verifyEmailAndPhone = async () => {
    const clerkUser = await clerkClient.users.getUser(userId);

    // Email verification check
    if (email) {
      const emailVerified = clerkUser.emailAddresses?.some(
        (e) =>
          e.verification?.status === 'verified' &&
          normalizeString(e.emailAddress) === normalizeString(email)
      );

      if (!emailVerified) {
        throw AppError.BadRequest(
          'Email must be verified in Clerk before updating'
        );
      }
    }

    // Phone verification check
    if (phoneNumber) {
      const phoneVerified = clerkUser.phoneNumbers?.some(
        (p) =>
          p.verification?.status === 'verified' &&
          normalizePhone(p.phoneNumber) === normalizePhone(phoneNumber)
      );

      if (!phoneVerified) {
        throw AppError.BadRequest(
          'Phone number must be verified in Clerk before updating'
        );
      }
    }
  };
  await verifyEmailAndPhone();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email !== undefined && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(gender !== undefined && { gender }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      },
    });

    // if (parsedBody.role === 'DOCTOR' && parsedBody.province) {
    //   await prisma.doctor.update({
    //     where: { userId: updatedUser.id },
    //     data: {
    //       province: parsedBody.province,
    //     },
    //   });
    // }

    res.json(updatedUser);
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error.code === 'P2002') {
      throw AppError.BadRequest('Email or phone number already in use');
    }
    throw AppError.Internal('Failed to update user');
  }
};
