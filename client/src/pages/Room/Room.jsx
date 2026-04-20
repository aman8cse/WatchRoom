import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoomContext } from '../../context/RoomContext'
import useSocket from '../../hooks/useSocket'
import useRoom from '../../hooks/useRoom'
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer'
import Controls from '../../components/Controls/Controls'
import ParticipantList from '../../components/ParticipantList/ParticipantList'
import ChatBox from '../../components/ChatBox/ChatBox'
import Reactions from '../../components/Reactions/Reactions'
import { copyToClipboard } from '../../utils/helper.js'
import './Room.css'

const Room = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef(null)
  const { participants, myRole, reactions } = useRoomContext()
  const roomActions = useRoom(code)

  useSocket(code, playerRef)

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href)
    alert('Room link copied!')
  }

  return (
    <div className="room">
      {/* Top bar */}
      <header className="room-header">
        <div className="room-header-left">
          <span className="logo-text">🎬 CoWatch</span>
          <div className="room-code-badge">
            <span>{code}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleCopyLink}>
              📋 Copy Link
            </button>
          </div>
        </div>
        <div className="room-header-right">
          <span className="room-role-badge role-{myRole}">{myRole}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="room-layout">
        {/* Left — Player + Controls */}
        <div className="room-main">
          <div className="room-player-area">
            <VideoPlayer playerRef={playerRef} />
            <Reactions reactions={reactions} />
          </div>
          <div className="room-controls">
            <Controls roomActions={roomActions} />
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="room-sidebar">
          <ParticipantList roomActions={roomActions} />
          <ChatBox roomActions={roomActions} />
        </div>
      </div>
    </div>
  )
}

export default Room