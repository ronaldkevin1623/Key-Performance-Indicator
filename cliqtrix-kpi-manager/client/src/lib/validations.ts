import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password must be less than 100 characters' }),
});

export const signupSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z.string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  company: z.string()
    .trim()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(100, { message: 'Company name must be less than 100 characters' }),
  role: z.enum(['admin', 'employee'], {
    message: 'Role must be either admin or employee',
  }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password must be less than 100 characters' }),
});

// Project validation schemas
export const projectSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: 'Project name must be at least 3 characters' })
    .max(100, { message: 'Project name must be less than 100 characters' }),
  description: z.string()
    .trim()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(500, { message: 'Description must be less than 500 characters' }),
  startDate: z.string()
    .min(1, { message: 'Start date is required' }),
  endDate: z.string()
    .min(1, { message: 'End date is required' }),
});

// Task validation schemas
export const taskSchema = z.object({
  title: z.string()
    .trim()
    .min(3, { message: 'Task title must be at least 3 characters' })
    .max(200, { message: 'Task title must be less than 200 characters' }),
  description: z.string()
    .trim()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(1000, { message: 'Description must be less than 1000 characters' }),
  projectId: z.string()
    .min(1, { message: 'Project is required' }),
  priority: z.enum(['low', 'medium', 'high'], {
    message: 'Priority must be low, medium, or high',
  }),
  points: z.string()
    .min(1, { message: 'Points are required' })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Points must be a positive number',
    }),
  dueDate: z.string()
    .min(1, { message: 'Due date is required' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
