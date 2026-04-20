import * as authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await authService.register({ username, email, password });

        res.status(201).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await authService.getProfile(req.user._id);

        res.status(200).json({ user });

    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}