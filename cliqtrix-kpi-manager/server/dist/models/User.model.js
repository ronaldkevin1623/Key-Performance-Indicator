"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// User Schema
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false, // Don't return password in queries by default
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'employee'],
            message: 'Role must be either admin or employee',
        },
        default: 'employee',
        required: true,
    },
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company reference is required'],
        index: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number'],
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    position: {
        type: String,
        trim: true,
        maxlength: [100, 'Position title cannot exceed 100 characters'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            // Remove password from JSON output
            const { password, ...userWithoutPassword } = ret;
            return userWithoutPassword;
        }
    },
    toObject: { virtuals: true },
});
// Indexes for better query performance
userSchema.index({ company: 1, role: 1 });
userSchema.index({ email: 1, company: 1 });
userSchema.index({ isActive: 1 });
// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified or new
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Instance method: Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        return false;
    }
};
// Instance method: Get full name
userSchema.methods.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
};
// Virtual field for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Static method: Find users by company
userSchema.statics.findByCompany = function (companyId) {
    return this.find({ company: companyId, isActive: true });
};
// Static method: Find admins by company
userSchema.statics.findAdminsByCompany = function (companyId) {
    return this.find({ company: companyId, role: 'admin', isActive: true });
};
// Static method: Find employees by company
userSchema.statics.findEmployeesByCompany = function (companyId) {
    return this.find({ company: companyId, role: 'employee', isActive: true });
};
// Create and export the User model
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.model.js.map