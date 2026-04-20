import socket from '../socket/socket'

const useRoom = (roomCode) => {
  const play = () => socket.emit('play', { roomCode })

  const pause = () => socket.emit('pause', { roomCode })

  const seek = (time) => socket.emit('seek', { roomCode, time })

  const changeVideo = (videoId) => socket.emit('change_video', { roomCode, videoId })

  const assignRole = (userId, role) => socket.emit('assign_role', { roomCode, userId, role })

  const removeParticipant = (userId) => socket.emit('remove_participant', { roomCode, userId })

  const transferHost = (userId) => socket.emit('transfer_host', { roomCode, userId })

  const sendMessage = (message) => socket.emit('send_message', { roomCode, message })

  const sendReaction = (emoji) => socket.emit('send_reaction', { roomCode, emoji })

  return {
    play, pause, seek,
    changeVideo, assignRole,
    removeParticipant, transferHost,
    sendMessage, sendReaction
  }
}

export default useRoom