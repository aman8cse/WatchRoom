import * as roomService from '../services/roomService.js';

export const createRoom = async (req, res) => {
    try {
        const { name } = req.body;
        const room = await roomService.createRoom({ name, hostId: req.user._id, username: req.user.username });

        res.status(201).json({room});

    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

export const getRoom = async (req, res) => {
    try {
        const room = await roomService.getRoomByCode(req.params.code);

        res.status(200).json({room});

    } catch(error) {
        res.status(404).json({message: error.message});
    }
}

export const checkRoom = async (req, res) => {
    try {
        const existing = await roomService.checkRoomExists(req.params.code);

        res.status(200).json({existing});

    } catch(error) {
        res.status(404).json({message: error.message});
    }
}