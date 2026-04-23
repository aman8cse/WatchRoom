import UserModel from '../models/User.model.js';
import jwt from "jsonwebtoken";
import validateName from '../utils/validation.js';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const register = async ({ username, email, password }) => {
    if(!validateName(username)) {
        throw new Error("Username should only albhabets and within in range 2 to 20")
    }
    const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existing) {
        throw new Error(existing.email === email ? 'Email already in use' : 'Username already taken')
    }

    const user = await UserModel.create({ username, email, password });
    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            username: username,
            email: email
        }
    }
}

export const login = async ({ email, password }) => {
    const user = await UserModel.findOne({ email }).select('+password');
    if(!user) throw new Error("Invalid credentials");

    const isMatched = await user.comparePassword(password);
    if(!isMatched) throw new Error("Invalid credentials");

    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    }
}

export const getProfile = async (userId) => {
    const user = await UserModel.findById(userId);
    if(!user) throw new Error("User not found");

    return user;
}