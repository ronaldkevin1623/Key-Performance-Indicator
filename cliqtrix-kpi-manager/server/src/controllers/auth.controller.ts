
import { Request, Response } from 'express';
import { User, Company } from '../models';
import { generateTokenPair } from '../config/jwt.config';
import logger from '../utils/logger';

/**
 * Company Signup (Creates company + first admin user)
 * POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      // Company details
      companyName,
      companyEmail,
      // Admin user details
      firstName,
      lastName,
      email,
      password,
      phone,
    } = req.body;

    // Validate required fields
    if (!companyName || !companyEmail || !firstName || !lastName || !email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields.',
      });
      return;
    }

    // Check if company email already exists
    const existingCompany = await Company.findOne({ email: companyEmail });
    if (existingCompany) {
      res.status(400).json({
        status: 'error',
        message: 'Company email already registered.',
      });
      return;
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'User email already registered.',
      });
      return;
    }

    // Create company
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      subscription: {
        plan: 'free',
        status: 'trial',
        startDate: new Date(),
        maxEmployees: 10,
        maxProjects: 5,
      },
    });

    // Create admin user
    const user = await User.create({
      email,
      password, // Will be hashed automatically by pre-save hook
      firstName,
      lastName,
      role: 'admin',
      company: company._id,
      phone,
      isActive: true,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: company._id.toString(),
    });

    logger.info(`New company registered: ${companyName} (${companyEmail})`);
    logger.info(`Admin user created: ${email}`);

    res.status(201).json({
      status: 'success',
      message: 'Company and admin account created successfully!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        company: {
          id: company._id,
          name: company.name,
          email: company.email,
          subscription: company.subscription,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error: any) {
    logger.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error during signup. Please try again.',
    });
  }
};

/**
 * User Login (Admin or Employee)
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Please provide email and password.',
      });
      return;
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password').populate('company', 'name email');

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact your administrator.',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.company.toString(),
    });

    logger.info(`User logged in: ${email} (${user.role})`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          position: user.position,
          company: user.company,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login. Please try again.',
    });
  }
};

/**
 * Get Current User
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated.',
      });
      return;
    }

    // Get user with company details
    const user = await User.findById(req.user.userId)
      .populate('company', 'name email subscription')
      .select('-password');

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          department: user.department,
          position: user.position,
          company: user.company,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user data.',
    });
  }
};

/**
 * Logout (Client-side token removal, optional server tracking)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a production app, you might want to:
    // 1. Blacklist the token
    // 2. Clear refresh token from database
    // 3. Track logout in audit log

    logger.info(`User logged out: ${req.user?.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully!',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout.',
    });
  }
};

export default {
  signup,
  login,
  getCurrentUser,
  logout,
};