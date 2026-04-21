import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [roomName, setRoomName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) return
    setCreateLoading(true)
    setCreateError('')

    try {
      const res = await api.post('/api/rooms', { name: roomName })
      navigate(`/room/${res.data.room.roomCode}`)
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create room')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (!roomCode.trim()) return
    setJoinLoading(true)
    setJoinError('')

    try {
      const res = await api.get(`/api/rooms/${roomCode.trim()}/exists`)
      if (res.data.exists) {
        navigate(`/room/${roomCode.trim().toUpperCase()}`)
      } else {
        setJoinError('Room not found or no longer active')
      }
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join room')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="landing-logo">
          <span></span>
          <span className="logo-text">CoWatch</span>
        </div>
        <div className="dashboard-nav-right">
          <span className="dashboard-username">
            👤 {user?.username}
          </span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome back, <span className="accent">{user?.username}</span></h1>
          <p className="text-secondary">Create a new room or join an existing one</p>
        </div>

        <div className="dashboard-panels">
          {/* Create Room */}
          <div className="card dashboard-panel">
            <div className="panel-header">
              <span className="panel-icon"></span>
              <div>
                <h2>Create a Room</h2>
                <p className="text-secondary">You'll be the host</p>
              </div>
            </div>

            {createError && (
              <div className="auth-error">{createError}</div>
            )}

            <form className="panel-form" onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  className="input"
                  placeholder="e.g. Movie Night"
                  value={roomName}
                  onChange={e => {
                    setRoomName(e.target.value)
                    setCreateError('')
                  }}
                  required
                  maxLength={30}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="card dashboard-panel">
            <div className="panel-header">
              <span className="panel-icon"></span>
              <div>
                <h2>Join a Room</h2>
                <p className="text-secondary">Enter a room code</p>
              </div>
            </div>

            {joinError && (
              <div className="auth-error">{joinError}</div>
            )}

            <form className="panel-form" onSubmit={handleJoinRoom}>
              <div className="form-group">
                <label htmlFor="roomCode">Room Code</label>
                <input
                  id="roomCode"
                  type="text"
                  className="input input-code"
                  placeholder="e.g. ABC123"
                  value={roomCode}
                  onChange={e => {
                    setRoomCode(e.target.value.toUpperCase())
                    setJoinError('')
                  }}
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-secondary w-full"
                disabled={joinLoading}
              >
                {joinLoading ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard