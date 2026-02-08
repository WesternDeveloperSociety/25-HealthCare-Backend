import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registry } from '@/lib/openapi';

extendZodWithOpenApi(z);

/**
 * Enums
 */
const UserRoleEnum = z.enum(['PATIENT', 'DOCTOR', 'ADMIN']);
const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']);
const ProvinceEnum = z.enum([
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
]);

const MedicalSpecialtyEnum = z.enum([
  'FAMILY_MEDICINE',
  'INTERNAL_MEDICINE',
  'PEDIATRICS',
  'CARDIOLOGY',
  'DERMATOLOGY',
  'ENDOCRINOLOGY',
  'GASTROENTEROLOGY',
  'NEUROLOGY',
  'OBSTETRICS_GYNECOLOGY',
  'ONCOLOGY',
  'OPHTHALMOLOGY',
  'ORTHOPEDICS',
  'PSYCHIATRY',
  'RADIOLOGY',
  'SURGERY',
  'UROLOGY',
  'OTHER',
]);

/**
 * Schemas - defined inline to avoid duplication
 */

export const CreateUserBodySchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('PATIENT'),
    email: z.email().toLowerCase(),
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    phoneNumber: z.string().min(10).max(15),
    dateOfBirth: z.iso.datetime(),
    gender: GenderEnum,
    emergencyContactName: z.string().min(1).max(50).trim(),
    emergencyContactPhone: z.string().min(10).max(15),
  }),
  z.object({
    role: z.literal('DOCTOR'),
    email: z.email().toLowerCase(),
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    phoneNumber: z.string().min(10).max(15),
    dateOfBirth: z.iso.datetime(),
    gender: GenderEnum,
    specialty: MedicalSpecialtyEnum,
    licenseNumber: z.string().min(1).max(50),
    province: ProvinceEnum,
  }),
]);

export const CreateUserSchema = z.object({
  body: CreateUserBodySchema,
});

export const UpdateUserBodySchema = z.object({
  role: z.literal('PATIENT'),
  email: z.email().toLowerCase().optional(),
  phoneNumber: z.string().min(10).max(15).optional(),
  gender: GenderEnum.optional(),
  notificationsEnabled: z.boolean().optional(),
  emergencyContactName: z.string().min(1).max(50).trim().optional(),
  emergencyContactPhone: z.string().min(10).max(15).optional(),
});

export const UpdateUserSchema = z.object({
  body: UpdateUserBodySchema,
});

export const GetUserByIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

/**
 * Register OpenAPI paths - using inline schema definitions
 */

registry.registerPath({
  method: 'post',
  path: '/users',
  description: 'Create a new user',
  summary: 'Create user',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserBodySchema.openapi('CreateUserBody'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
    },
    400: {
      description: 'Bad Request',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/me',
  description: 'Get current authenticated user',
  summary: 'Get current user',
  tags: ['Users'],
  responses: {
    200: {
      description: 'User details',
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/users/me',
  description: 'Update current authenticated user',
  summary: 'Update current user',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateUserBodySchema.openapi('UpdateUserBody'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  description: 'Get user by ID',
  summary: 'Get user',
  tags: ['Users'],
  request: {
    params: z.object({
      id: z.uuid(),
    }),
  },
  responses: {
    200: {
      description: 'User details',
    },
    404: {
      description: 'User not found',
    },
  },
});
