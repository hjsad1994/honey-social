import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.js";

// Define the schema shape without explicitly binding to IUser yet
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            minLength: 6,
            required: true,
        },
        profilePic: {
            type: String,
            default: "",
        },
        followers: {
            type: [String],
            default: [],
        },
        following: {
            type: [String],
            default: [],
        },
        bio: {
            type: String,
            default: "",
        },
        isFrozen: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Then create the model with the interface
const User = mongoose.model<IUser>("User", userSchema);

export default User;
