import type { Request, Response } from 'express';

let users: any[] = [
  {
    id: '1',
    clerkID: 'clerk_123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'patient',
  },
];

/**
 * GET /api/users
 * List all users (filtered by role)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  // TODO: Add filtering by role (doctor/patient), search, pagination
  res.json(users);
};

/**
 * GET /api/users/:id
 * Get specific user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  const { id } = req.params;
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
};

/**
 * POST /api/users
 * Create new user
 */
export const createUser = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema

  const newUser = {
    id: Date.now().toString(),
    clerkID: req.body.clerkID,
    role: req.body.role,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    ...req.body,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};
