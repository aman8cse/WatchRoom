import { v4 as uuidv4 } from "uuid";
import RoomModel from "../models/Room.model.js";

export const generateRoomCode = () => {
    return uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
}

export const createRoom = async ({ name, hostId, username }) => {
    let roomCode;
    let exists = true;

    while(exists) {
        roomCode = generateRoomCode();
        exists = await RoomModel.findOne({roomCode});
    }

    const room = await RoomModel.create({
        roomCode,
        name,
        hostId,
        participants: [{
            userId: hostId,
            username,
            role: "host"
        }]
    })

    return room;
}

export const getRoomByCode = async (roomCode) => {
    const room = await RoomModel.findOne({
        roomCode: roomCode.toUpperCase(),
        isActive: true
    });
    if(!room) throw new Error('Room not found or inactive');

    return room;
}

export const checkRoomExists = async (roomCode) => {
    const room = await RoomModel.findOne({
        roomCode: roomCode.toUpperCase(),
        isActive: true
    });
    
    return !!room;
}