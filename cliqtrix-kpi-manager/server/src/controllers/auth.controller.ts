import { Request, Response } from 'express';
import { User, Company } from '../models';
import { generateTokenPair } from '../config/jwt.config';
import logger from '../utils/logger';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      companyName,
      companyEmail,
      company, // Company ID, for employee signup
      firstName,
      lastName,
      email,
      password,
      phone,
      role, // 'admin' or 'employee'
    } = req.body;

    // ADMIN SIGNUP FLOW (creates company and company admin user)
    if (role === "admin") {
      if (!companyName || !companyEmail || !firstName || !lastName || !email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Please provide all required fields.',
        });
        return;
      }

      const existingCompany = await Company.findOne({ email: companyEmail });
      if (existingCompany) {
        res.status(400).json({
          status: 'error',
          message: 'Company email already registered.',
        });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'User email already registered.',
        });
        return;
      }

      // Create company
      const newCompany = await Company.create({
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
      const adminUser = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'admin',
        company: newCompany._id,
        phone,
        isActive: true,
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        userId: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        companyId: newCompany._id.toString(),
      });

      logger.info(`New company registered: ${companyName} (${companyEmail})`);
      logger.info(`Admin user created: ${email}`);
      res.status(201).json({
        status: 'success',
        message: 'Company and admin account created successfully!',
        data: {
          user: {
            id: adminUser._id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role,
          },
          company: {
            id: newCompany._id,
            name: newCompany.name,
            email: newCompany.email,
            subscription: newCompany.subscription,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
      return;
    }

    // EMPLOYEE SIGNUP FLOW (joins existing company by ID)
    if (role === "employee") {
      if (!company || !firstName || !lastName || !email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Please provide all required fields.',
        });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'User email already registered.',
        });
        return;
      }

      const foundCompany = await Company.findById(company);
      if (!foundCompany) {
        res.status(404).json({
          status: 'error',
          message: 'Company not found. Ask your admin for the correct Company ID.',
        });
        return;
      }

      const employeeUser = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'employee',
        company: foundCompany._id,
        phone,
        isActive: true,
      });

      res.status(201).json({
        status: 'success',
        message: 'Employee account created successfully!',
        data: {
          user: {
            id: employeeUser._id,
            email: employeeUser.email,
            firstName: employeeUser.firstName,
            lastName: employeeUser.lastName,
            role: employeeUser.role,
          },
          company: {
            id: foundCompany._id,
            name: foundCompany.name,
          },
        },
      });
      return;
    }

    // Invalid request
    res.status(400).json({
      status: 'error',
      message: 'Invalid signup request: missing or invalid role.',
    });
  } catch (error: any) {
    logger.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error during signup. Please try again.',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Please provide email and password.',
      });
      return;
    }

    const user = await User.findOne({ email })
      .select('+password')
      .populate('company', '_id name email');

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact your administrator.',
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    let companyId: string = "";
    if (user.company && typeof user.company === 'object' && '_id' in user.company) {
      companyId = (user.company as { _id: any })._id.toString();
    } else if (typeof user.company === "string") {
      companyId = user.company;
    }

    const { accessToken, refreshToken } = generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId,
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

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.userId)
      .populate('company', 'name email subscription')
      .select('-password');

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
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
    res.status(500).json({ status: 'error', message: 'Error fetching user data.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info(`User logged out: ${req.user?.email}`);
    res.status(200).json({ status: 'success', message: 'Logged out successfully!' });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({ status: 'error', message: 'Error during logout.' });
  }
};
