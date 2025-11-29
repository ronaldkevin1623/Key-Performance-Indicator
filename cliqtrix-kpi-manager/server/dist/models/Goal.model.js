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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const goalSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, "Goal title is required"],
        trim: true,
        maxlength: [300, "Goal title cannot exceed 300 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator(value) {
                return !value || value >= this.startDate;
            },
            message: "End date must be after start date",
        },
    },
    targetPoints: {
        type: Number,
        min: 0,
    },
    priority: {
        type: Number,
        default: 3,
        min: 1,
        max: 5,
        index: true,
    },
    status: {
        type: String,
        enum: ["open", "done"],
        default: "open",
        index: true,
    },
}, {
    timestamps: true,
});
goalSchema.index({ user: 1, status: 1, startDate: 1, endDate: 1 });
const Goal = mongoose_1.default.model("Goal", goalSchema);
exports.default = Goal;
//# sourceMappingURL=Goal.model.js.map