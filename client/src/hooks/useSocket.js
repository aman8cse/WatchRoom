import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../socket/socket.js'
import { useRoomContext } from '../context/RoomContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const useSocket = (roomCode, playerRef) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    setRoom,
    updateParticipants,
    updateVideoState,
    addMessage,
    addReaction,
    setMyRole
  } = useRoomContext()

  useEffect(() => {
    if (!roomCode || !user) return

    socket.auth = { token: localStorage.getItem('token') }
    socket.connect()

    socket.emit('join_room', { roomCode })

    socket.on('sync_state', ({ videoState, participants, messages }) => {
      console.log(videoState)
      updateVideoState(videoState)
      updateParticipants(participants)

      const me = participants.find(p => p.username === user.username)
      if (me) setMyRole(me.role)
    })

    socket.on('user_joined', ({ participants }) => {
      updateParticipants(participants)
    })

    socket.on('user_left', ({ participants }) => {
      updateParticipants(participants)
    })

    socket.on('play', () => {
      updateVideoState({ isPlaying: true })
      playerRef.current?.playVideo()
    })

    socket.on('pause', () => {
      updateVideoState({ isPlaying: false })
      playerRef.current?.pauseVideo()
    })

    socket.on('seek', ({ time }) => {
      updateVideoState({ currentTime: time })
      playerRef.current?.seekTo(time, true)
    })

    socket.on('change_video', ({ videoId }) => {
      updateVideoState({ videoId, isPlaying: false, currentTime: 0 })
    })

    socket.on('role_assigned', ({ participants }) => {
      updateParticipants(participants)
      const me = participants.find(p => p.username === user.username)
      if (me) setMyRole(me.role)
    })

    socket.on('host_transferred', ({ participants }) => {
      updateParticipants(participants)
      const me = participants.find(p => p.username === user.username)
      if (me) setMyRole(me.role)
    })

    socket.on('participant_removed', ({ participants }) => {
      updateParticipants(participants)
    })

    socket.on('new_message', (message) => {
      addMessage(message)
    })

    socket.on('new_reaction', (reaction) => {
      addReaction(reaction)
    })

    socket.on('removed_from_room', () => {
      navigate('/dashboard')
    })

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message)
    })

    return () => {
      socket.emit('leave_room', { roomCode })
      socket.disconnect()
      socket.removeAllListeners()
    }
  }, [roomCode])
}

export default useSocket