"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = exports.deactivateEmployee = exports.updateEmployee = exports.getEmployee = exports.getEmployeeDropdown = exports.getAllEmployees = exports.createEmployee = void 0;
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Create Employee (Admin only)
 * POST /api/users
 */
const createEmployee = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, department, position, } = req.body;
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({
                status: "error",
                message: "Please provide email, password, firstName, and lastName.",
            });
            return;
        }
        const existingUser = await models_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                status: "error",
                message: "Email already registered.",
            });
            return;
        }
        const adminCompanyId = req.user.companyId;
        const company = await models_1.Company.findById(adminCompanyId);
        if (!company) {
            res.status(404).json({
                status: "error",
                message: "Company not found.",
            });
            return;
        }
        const currentEmployeeCount = await models_1.User.countDocuments({
            company: adminCompanyId,
            isActive: true,
        });
        if (currentEmployeeCount >= company.subscription.maxEmployees) {
            res.status(403).json({
                status: "error",
                message: `Employee limit reached. Your plan allows ${company.subscription.maxEmployees} employees.`,
            });
            return;
        }
        const employee = await models_1.User.create({
            email,
            password,
            firstName,
            lastName,
            role: "employee",
            company: adminCompanyId,
            phone,
            department,
            position,
            isActive: true,
        });
        logger_1.default.info(`Employee created: ${email} by admin ${req.user.email}`);
        res.status(201).json({
            status: "success",
            message: "Employee created successfully!",
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
    }
    catch (error) {
        logger_1.default.error("Create employee error:", error);
        res.status(500).json({
            status: "error",
            message: "Error creating employee.",
        });
    }
};
exports.createEmployee = createEmployee;
/**
 * Get All Employees (Admin only)
 * GET /api/users
 */
const getAllEmployees = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { role, department, isActive } = req.query;
        const query = { company: companyId };
        if (role)
            query.role = role;
        if (department)
            query.department = department;
        if (isActive !== undefined)
            query.isActive = isActive === "true";
        const employees = await models_1.User.find(query)
            .select("-password")
            .sort({ createdAt: -1 });
        res.status(200).json({
            status: "success",
            results: employees.length,
            data: {
                employees,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Get employees error:", error);
        res.status(500).json({
            status: "error",
            message: "Error fetching employees.",
        });
    }
};
exports.getAllEmployees = getAllEmployees;
/**
 * Get Employee Dropdown (Employee selector for assignment)
 * GET /api/users/employee-dropdown
 */
const getEmployeeDropdown = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const employees = await models_1.User.find({ company: companyId, role: "employee", isActive: true }, "firstName lastName email _id").sort({ firstName: 1, lastName: 1 });
        res.status(200).json(employees);
    }
    catch (error) {
        logger_1.default.error("Fetch employee dropdown error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch employees for assignment.",
        });
    }
};
exports.getEmployeeDropdown = getEmployeeDropdown;
/**
 * Get Single Employee (Admin only)
 * GET /api/users/:id
 */
const getEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const employee = await models_1.User.findOne({
            _id: id,
            company: companyId,
        }).select("-password");
        if (!employee) {
            res.status(404).json({
                status: "error",
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            status: "success",
            data: {
                employee,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Get employee error:", error);
        res.status(500).json({
            status: "error",
            message: "Error fetching employee.",
        });
    }
};
exports.getEmployee = getEmployee;
/**
 * Update Employee (Admin only)
 * PATCH /api/users/:id
 */
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const { firstName, lastName, phone, department, position, isActive, } = req.body;
        const employee = await models_1.User.findOne({
            _id: id,
            company: companyId,
        });
        if (!employee) {
            res.status(404).json({
                status: "error",
                message: "Employee not found.",
            });
            return;
        }
        if (req.body.role || req.body.company) {
            res.status(400).json({
                status: "error",
                message: "Cannot change role or company.",
            });
            return;
        }
        if (firstName)
            employee.firstName = firstName;
        if (lastName)
            employee.lastName = lastName;
        if (phone !== undefined)
            employee.phone = phone;
        if (department !== undefined)
            employee.department = department;
        if (position !== undefined)
            employee.position = position;
        if (isActive !== undefined)
            employee.isActive = isActive;
        await employee.save();
        logger_1.default.info(`Employee updated: ${employee.email} by admin ${req.user.email}`);
        res.status(200).json({
            status: "success",
            message: "Employee updated successfully!",
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
    }
    catch (error) {
        logger_1.default.error("Update employee error:", error);
        res.status(500).json({
            status: "error",
            message: "Error updating employee.",
        });
    }
};
exports.updateEmployee = updateEmployee;
/**
 * Deactivate Employee (Admin only)
 * DELETE /api/users/:id
 */
const deactivateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;
        const employee = await models_1.User.findOne({
            _id: id,
            company: companyId,
        });
        if (!employee) {
            res.status(404).json({
                status: "error",
                message: "Employee not found.",
            });
            return;
        }
        if (employee.role === "admin") {
            res.status(400).json({
                status: "error",
                message: "Cannot deactivate admin accounts.",
            });
            return;
        }
        employee.isActive = false;
        await employee.save();
        logger_1.default.info(`Employee deactivated: ${employee.email} by admin ${req.user.email}`);
        res.status(200).json({
            status: "success",
            message: "Employee deactivated successfully!",
        });
    }
    catch (error) {
        logger_1.default.error("Deactivate employee error:", error);
        res.status(500).json({
            status: "error",
            message: "Error deactivating employee.",
        });
    }
};
exports.deactivateEmployee = deactivateEmployee;
/**
 * Get logged-in user's profile + company info
 * GET /api/users/me/profile
 */
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await models_1.User.findById(userId)
            .select("-password")
            .populate("company") // uses Company model from ../models
            .lean();
        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found.",
            });
            return;
        }
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        logger_1.default.error("Get my profile error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to load profile.",
        });
    }
};
exports.getMyProfile = getMyProfile;
exports.default = {
    createEmployee: exports.createEmployee,
    getAllEmployees: exports.getAllEmployees,
    getEmployeeDropdown: exports.getEmployeeDropdown,
    getEmployee: exports.getEmployee,
    updateEmployee: exports.updateEmployee,
    deactivateEmployee: exports.deactivateEmployee,
    getMyProfile: exports.getMyProfile,
};
//# sourceMappingURL=user.controller.js.map