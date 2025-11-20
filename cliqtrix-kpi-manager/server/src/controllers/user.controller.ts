
import { Request, Response } from 'express';
import { User, Company } from '../models';
import logger from '../utils/logger';

/**
 * Create Employee (Admin only)
 * POST /api/users
 */
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      department,
      position,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        status: 'error',
        message: 'Please provide email, password, firstName, and lastName.',
      });
      return;
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'Email already registered.',
      });
      return;
    }

    // Get admin's company
    const adminCompanyId = req.user!.companyId;

    // Check company exists and has employee slots
    const company = await Company.findById(adminCompanyId);
    if (!company) {
      res.status(404).json({
        status: 'error',
        message: 'Company not found.',
      });
      return;
    }

    // Check employee limit
    const currentEmployeeCount = await User.countDocuments({
      company: adminCompanyId,
      isActive: true,
    });

    if (currentEmployeeCount >= company.subscription.maxEmployees) {
      res.status(403).json({
        status: 'error',
        message: `Employee limit reached. Your plan allows ${company.subscription.maxEmployees} employees.`,
      });
      return;
    }

    // Create employee
    const employee = await User.create({
      email,
      password, // Will be hashed automatically
      firstName,
      lastName,
      role: 'employee',
      company: adminCompanyId,
      phone,
      department,
      position,
      isActive: true,
    });

    logger.info(`Employee created: ${email} by admin ${req.user!.email}`);

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully!',
      data: {
        employee: {
          id: employee._id,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          role: employee.role,
          department: employee.department,
          position: employee.position,
          isActive: employee.isActive,
        },
      },
    });
  } catch (error: any) {
    logger.error('Create employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating employee.',
    });
  }
};

/**
 * Get All Employees (Admin only)
 * GET /api/users
 */
export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = req.user!.companyId;

    // Get query parameters for filtering
    const { role, department, isActive } = req.query;

    // Build query
    const query: any = { company: companyId };

    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: employees.length,
      data: {
        employees,
      },
    });
  } catch (error: any) {
    logger.error('Get employees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employees.',
    });
  }
};

/**
 * Get Single Employee (Admin only)
 * GET /api/users/:id
 */
export const getEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const employee = await User.findOne({
      _id: id,
      company: companyId,
    }).select('-password');

    if (!employee) {
      res.status(404).json({
        status: 'error',
        message: 'Employee not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        employee,
      },
    });
  } catch (error: any) {
    logger.error('Get employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching employee.',
    });
  }
};

/**
 * Update Employee (Admin only)
 * PATCH /api/users/:id
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const {
      firstName,
      lastName,
      phone,
      department,
      position,
      isActive,
    } = req.body;

    // Find employee
    const employee = await User.findOne({
      _id: id,
      company: companyId,
    });

    if (!employee) {
      res.status(404).json({
        status: 'error',
        message: 'Employee not found.',
      });
      return;
    }

    // Prevent changing role or company
    if (req.body.role || req.body.company) {
      res.status(400).json({
        status: 'error',
        message: 'Cannot change role or company.',
      });
      return;
    }

    // Update fields
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (isActive !== undefined) employee.isActive = isActive;

    await employee.save();

    logger.info(`Employee updated: ${employee.email} by admin ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully!',
      data: {
        employee: {
          id: employee._id,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          role: employee.role,
          department: employee.department,
          position: employee.position,
          isActive: employee.isActive,
        },
      },
    });
  } catch (error: any) {
    logger.error('Update employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating employee.',
    });
  }
};

/**
 * Deactivate Employee (Admin only)
 * DELETE /api/users/:id
 */
export const deactivateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const employee = await User.findOne({
      _id: id,
      company: companyId,
    });

    if (!employee) {
      res.status(404).json({
        status: 'error',
        message: 'Employee not found.',
      });
      return;
    }

    // Prevent deactivating admin accounts
    if (employee.role === 'admin') {
      res.status(400).json({
        status: 'error',
        message: 'Cannot deactivate admin accounts.',
      });
      return;
    }

    employee.isActive = false;
    await employee.save();

    logger.info(`Employee deactivated: ${employee.email} by admin ${req.user!.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Employee deactivated successfully!',
    });
  } catch (error: any) {
    logger.error('Deactivate employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deactivating employee.',
    });
  }
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deactivateEmployee,
};