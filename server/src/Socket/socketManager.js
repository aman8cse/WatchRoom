import jwt from "jsonwebtoken";
import User from '../models/User.model.js';
import MessageHandler from "../classes/MessageHandler.js";

export const initializeSocket = (io) => {
    const handler = new MessageHandler(io);

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.headers.token;
            if (!token) return next(new Error('No token provided'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password')
            if (!user) return next(new Error('User not found'))

            socket.user = {
                id: user._id.toString(),
                username: user.username
            }

            next();

        } catch(error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
    console.log(`${socket.user.username} connected [${socket.id}]`)

    socket.on('join_room',            (data) => handler.handleJoinRoom(socket, data))
    socket.on('leave_room',           (data) => handler.handleLeaveRoom(socket, data))
    socket.on('play',                 (data) => handler.handlePlay(socket, data))
    socket.on('pause',                (data) => handler.handlePause(socket, data))
    socket.on('seek',                 (data) => handler.handleSeek(socket, data))
    socket.on('change_video',         (data) => handler.handleChangeVideo(socket, data))
    socket.on('assign_role',          (data) => handler.handleAssignRole(socket, data))
    socket.on('remove_participant',   (data) => handler.handleRemoveParticipant(socket, data))
    socket.on('transfer_host',        (data) => handler.handleTransferHost(socket, data))
    socket.on('send_message',         (data) => handler.handleSendMessage(socket, data))
    socket.on('send_reaction',        (data) => handler.handleSendReaction(socket, data))
    socket.on('disconnect',           ()     => handler.handleDisconnect(socket))
  })
}