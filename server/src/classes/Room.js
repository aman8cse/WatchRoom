
class Room {
  constructor({ roomCode, name, hostId }) {
    this.roomCode = roomCode
    this.name = name
    this.hostId = hostId.toString()
    this.participants = new Map()
    this.videoState = {
      videoId: '',
      isPlaying: false,
      currentTime: 0,
      lastUpdatedAt: Date.now()
    }
    this.messages = []
    this.createdAt = new Date()
  }

  addParticipant(participant) {
    this.participants.set(participant.socketId, participant)
  }

  removeParticipant(socketId) {
    this.participants.delete(socketId)
  }

  getParticipantBySocketId(socketId) {
    return this.participants.get(socketId) || null
  }

  getParticipantByUserId(userId) {
    for (let participant of this.participants.values()) {
      if (participant.userId === userId.toString()) return participant
    }
    return null
  }

  getAllParticipants() {
    return Array.from(this.participants.values()).map(p => p.toJSON())
  }

  isEmpty() {
    return this.participants.size === 0
  }

  updateVideoState(updates) {
    this.videoState = {
      ...this.videoState,
      ...updates,
      lastUpdatedAt: Date.now()
    }
  }

  addMessage(message) {
    this.messages.push(message)
    if (this.messages.length > 100) this.messages.shift()
  }
}

export default Room