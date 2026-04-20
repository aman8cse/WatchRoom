class Participant {
    constructor({ userId, username, role = 'participant', socketId }) {
        this.userId = userId.toString()
        this.username = username
        this.role = role
        this.socketId = socketId
        this.joinedAt = new Date()
    }

    setRole(newRole) {
        this.role = newRole;
    }

    canControl() {
        return this.role === "host" || this.role === "moderator";
    }

    canManageUsers() {
        return this.role === "host"
    }

    toJSON() {
        return {
            userId: this.userId,
            username: this.username,
            role: this.role,
            socketId: this.socketId
        }
    }
}

export default Participant;