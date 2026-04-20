import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    role: {
        type: String,
        enum: ['host', 'moderator', 'participant'],
        default: 'participant'
    },
    joinedAt: { type: Date, default: Date.now }
})

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [participantSchema],
    videoState: {
        videoId: { type: String, default: '' },
        isPlaying: { type: Boolean, default: false },
        currentTime: { type: Number, default: 0 },
        lastUpdatedAt: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 50 }
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)