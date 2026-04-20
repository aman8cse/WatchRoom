import { useState, useEffect, useRef } from 'react'
import { useRoomContext } from '../../context/RoomContext'
import { useAuth } from '../../context/AuthContext'
import './ChatBox.css'

const ChatBox = ({ roomActions }) => {
  const { messages } = useRoomContext()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    roomActions.sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <h3>Chat</h3>
      </div>

      <div className="chatbox-messages">
        {messages.length === 0 && (
          <div className="chatbox-empty">
            <p>No messages yet</p>
            <p className="text-secondary">Say hello! 👋</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.username === user?.username
          return (
            <div
              key={i}
              className={`chat-message ${isMe ? 'chat-message-me' : ''}`}
            >
              {!isMe && (
                <span className="chat-username">{msg.username}</span>
              )}
              <div className="chat-bubble">
                <span className="chat-text">{msg.message}</span>
                <span className="chat-time">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chatbox-input">
        <input
          type="text"
          className="input"
          placeholder="Send a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatBox