import Room from './Room.js'
import Participant from './Participant.js'
import RoomModel from '../models/Room.model.js'

class MessageHandler {
  constructor(io) {
    this.io = io
    this.activeRooms = new Map()
  }

  broadcastToRoom(roomCode, event, data) {
    this.io.to(roomCode).emit(event, data)
  }

  emitToSocket(socketId, event, data) {
    this.io.to(socketId).emit(event, data)
  }

  // Load room from MongoDB into RAM if not already active
  async _getOrLoadRoom(roomCode) {
    if (this.activeRooms.has(roomCode)) {
      return this.activeRooms.get(roomCode)
    }

    const dbRoom = await RoomModel.findOne({ roomCode, isActive: true })
    if (!dbRoom) return null

    const room = new Room({
      roomCode: dbRoom.roomCode,
      name: dbRoom.name,
      hostId: dbRoom.hostId
    })

    // Restore last known video state for late joiners
    room.videoState = {
      videoId: dbRoom.videoState.videoId,
      isPlaying: false,           // always start paused on load
      currentTime: dbRoom.videoState.currentTime,
      lastUpdatedAt: Date.now()
    }

    this.activeRooms.set(roomCode, room)
    return room
  }

  async handleJoinRoom(socket, { roomCode }) {
    try {
      const room = await this._getOrLoadRoom(roomCode)
      if (!room) {
        return socket.emit('error', { message: 'Room not found' })
      }

      // Determine role — host if userId matches room's hostId
      const isHost = room.hostId === socket.user.id.toString()
      const role = isHost ? 'host' : 'participant'

      const participant = new Participant({
        userId: socket.user.id,
        username: socket.user.username,
        role,
        socketId: socket.id
      })

      room.addParticipant(participant)
      socket.join(roomCode)  // join Socket.IO room — enables room broadcasts

      // Send current state to the new joiner only
      socket.emit('sync_state', {
        videoState: room.videoState,
        participants: room.getAllParticipants(),
        messages: room.messages
      })

      // Notify everyone else in the room
      socket.to(roomCode).emit('user_joined', {
        user: participant.toJSON(),
        participants: room.getAllParticipants()
      })

      console.log(`${socket.user.username} joined room ${roomCode} as ${role}`)

    } catch (error) {
      socket.emit('error', { message: error.message })
    }
  }

  handleLeaveRoom(socket, { roomCode }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    room.removeParticipant(socket.id)
    socket.leave(roomCode)

    this.broadcastToRoom(roomCode, 'user_left', {
      userId: socket.user.id,
      participants: room.getAllParticipants()
    })

    // Clean up RAM if room is empty
    if (room.isEmpty()) {
      this.activeRooms.delete(roomCode)
      console.log(` Room ${roomCode} removed from memory — no participants`)
    }
  }

  handlePlay(socket, { roomCode }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const participant = room.getParticipantBySocketId(socket.id)
    if (!participant?.canControl()) {
      return socket.emit('error', { message: 'Not authorized to control playback' })
    }

    room.updateVideoState({ isPlaying: true })
    this.broadcastToRoom(roomCode, 'play', {
      updatedBy: participant.username
    })
  }

  handlePause(socket, { roomCode }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const participant = room.getParticipantBySocketId(socket.id)
    if (!participant?.canControl()) {
      return socket.emit('error', { message: 'Not authorized to control playback' })
    }

    room.updateVideoState({ isPlaying: false })
    this.broadcastToRoom(roomCode, 'pause', {
      updatedBy: participant.username
    })
  }

  handleSeek(socket, { roomCode, time }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const participant = room.getParticipantBySocketId(socket.id)
    if (!participant?.canControl()) {
      return socket.emit('error', { message: 'Not authorized to seek' })
    }

    room.updateVideoState({ currentTime: time })
    this.broadcastToRoom(roomCode, 'seek', {
      time,
      updatedBy: participant.username
    })
  }

  async handleChangeVideo(socket, { roomCode, videoId }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const participant = room.getParticipantBySocketId(socket.id)
    if (!participant?.canControl()) {
      return socket.emit('error', { message: 'Not authorized to change video' })
    }

    room.updateVideoState({ videoId, isPlaying: false, currentTime: 0 })
    console.log('vidId', videoId)

    // Sync to MongoDB — late joiners need the current videoId
    await RoomModel.findOneAndUpdate(
      { roomCode },
      {
        'videoState.videoId': videoId,
        'videoState.currentTime': 0,
        'videoState.isPlaying': false
      }
    )

    this.broadcastToRoom(roomCode, 'change_video', {
      videoId,
      updatedBy: participant.username
    })
  }

  handleAssignRole(socket, { roomCode, userId, role }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const requester = room.getParticipantBySocketId(socket.id)
    if (!requester?.canManageUsers()) {
      return socket.emit('error', { message: 'Only host can assign roles' })
    }

    // Prevent assigning invalid roles
    const validRoles = ['moderator', 'participant']
    if (!validRoles.includes(role)) {
      return socket.emit('error', { message: 'Invalid role' })
    }

    const target = room.getParticipantByUserId(userId)
    if (!target) {
      return socket.emit('error', { message: 'Participant not found' })
    }

    target.setRole(role)

    this.broadcastToRoom(roomCode, 'role_assigned', {
      userId,
      role,
      participants: room.getAllParticipants()
    })
  }

  handleRemoveParticipant(socket, { roomCode, userId }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const requester = room.getParticipantBySocketId(socket.id)
    if (!requester?.canManageUsers()) {
      return socket.emit('error', { message: 'Only host can remove participants' })
    }

    const target = room.getParticipantByUserId(userId)
    if (!target) {
      return socket.emit('error', { message: 'Participant not found' })
    }

    // Tell that socket they got removed before disconnecting them
    this.emitToSocket(target.socketId, 'removed_from_room', {
      message: 'You were removed from the room by the host'
    })

    room.removeParticipant(target.socketId)

    this.broadcastToRoom(roomCode, 'participant_removed', {
      userId,
      participants: room.getAllParticipants()
    })
  }

  handleTransferHost(socket, { roomCode, userId }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const requester = room.getParticipantBySocketId(socket.id)
    if (!requester?.canManageUsers()) {
      return socket.emit('error', { message: 'Only host can transfer host role' })
    }

    const target = room.getParticipantByUserId(userId)
    if (!target) {
      return socket.emit('error', { message: 'Participant not found' })
    }

    // Swap roles
    requester.setRole('participant')
    target.setRole('host')
    room.hostId = userId.toString()

    this.broadcastToRoom(roomCode, 'host_transferred', {
      newHostId: userId,
      participants: room.getAllParticipants()
    })
  }

  handleSendMessage(socket, { roomCode, message }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const participant = room.getParticipantBySocketId(socket.id)
    if (!participant) return

    // Sanitize — dont allow empty messages
    if (!message || !message.trim()) return

    const msg = {
      userId: participant.userId,
      username: participant.username,
      message: message.trim(),
      timestamp: new Date()
    }

    room.addMessage(msg)
    this.broadcastToRoom(roomCode, 'new_message', msg)
  }

  handleSendReaction(socket, { roomCode, emoji }) {
    const room = this.activeRooms.get(roomCode)
    if (!room) return

    const participant = room.getParticipantBySocketId(socket.id)
    if (!participant) return

    this.broadcastToRoom(roomCode, 'new_reaction', {
      userId: participant.userId,
      username: participant.username,
      emoji
    })
  }

  handleDisconnect(socket) {
    // Check all active rooms — remove this socket if found
    for (let [roomCode, room] of this.activeRooms.entries()) {
      if (room.participants.has(socket.id)) {
        room.removeParticipant(socket.id)

        this.broadcastToRoom(roomCode, 'user_left', {
          userId: socket.user?.id,
          participants: room.getAllParticipants()
        })

        if (room.isEmpty()) {
          this.activeRooms.delete(roomCode)
          console.log(` Room ${roomCode} cleared from memory`)
        }

        break  // socket can only be in one room at a time
      }
    }

    console.log(` ${socket.user?.username} disconnected`)
  }
}

export default MessageHandler