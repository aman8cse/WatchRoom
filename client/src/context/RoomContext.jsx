import { createContext, useContext, useState } from 'react'

const RoomContext = createContext(null)

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState(null)
  const [participants, setParticipants] = useState([])
  const [videoState, setVideoState] = useState({
    videoId: '',
    isPlaying: false,
    currentTime: 0
  })
  const [messages, setMessages] = useState([])
  const [reactions, setReactions] = useState([])
  const [myRole, setMyRole] = useState('participant')

  const updateParticipants = (newParticipants) => {
    setParticipants(newParticipants)
  }

  const updateVideoState = (updates) => {
    setVideoState(prev => ({ ...prev, ...updates }))
  }

  const addMessage = (message) => {
    setMessages(prev => [...prev, message])
  }

  const addReaction = (reaction) => {
    const id = Date.now()
    setReactions(prev => [...prev, { ...reaction, id }])
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id))
    }, 3000)
  }

  return (
    <RoomContext.Provider value={{
      room, setRoom,
      participants, updateParticipants,
      videoState, updateVideoState,
      messages, addMessage,
      reactions, addReaction,
      myRole, setMyRole
    }}>
      {children}
    </RoomContext.Provider>
  )
}

export const useRoomContext = () => useContext(RoomContext)