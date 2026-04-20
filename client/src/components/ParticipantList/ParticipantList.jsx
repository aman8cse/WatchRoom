import { useState } from 'react'
import { useRoomContext } from '../../context/RoomContext'
import { useAuth } from '../../context/AuthContext'
import { getRoleIcon } from '../../utils/helper.js'
import './ParticipantList.css'

const ParticipantList = ({ roomActions }) => {
  const { participants, myRole } = useRoomContext()
  const { user } = useAuth()
  const [openMenu, setOpenMenu] = useState(null)

  const isHost = myRole === 'host'

  const handleAssignRole = (userId, role) => {
    roomActions.assignRole(userId, role)
    setOpenMenu(null)
  }

  const handleRemove = (userId) => {
    roomActions.removeParticipant(userId)
    setOpenMenu(null)
  }

  const handleTransferHost = (userId) => {
    roomActions.transferHost(userId)
    setOpenMenu(null)
  }

  return (
    <div className="participant-list">
      <div className="participant-list-header">
        <h3>Participants</h3>
        <span className="participant-count">{participants.length}</span>
      </div>

      <div className="participants">
        {participants.map(p => (
          <div key={p.userId} className="participant-item">
            <div className="participant-avatar">
              {p.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="participant-info">
              <span className="participant-name">
                {p.username}
                {p.userId === user?.id && (
                  <span className="you-badge"> (you)</span>
                )}
              </span>
              <span className="participant-role">
                {getRoleIcon(p.role)} {p.role}
              </span>
            </div>

            {/* Host management menu — only for other users */}
            {isHost && p.userId !== user?.id && (
              <div className="participant-menu-wrapper">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setOpenMenu(
                    openMenu === p.userId ? null : p.userId
                  )}
                >
                  ⋯
                </button>

                {openMenu === p.userId && (
                  <div className="participant-dropdown">
                    {p.role !== 'moderator' && (
                      <button onClick={() => handleAssignRole(p.userId, 'moderator')}>
                        🎭 Make Moderator
                      </button>
                    )}
                    {p.role !== 'participant' && (
                      <button onClick={() => handleAssignRole(p.userId, 'participant')}>
                        👤 Make Participant
                      </button>
                    )}
                    <button onClick={() => handleTransferHost(p.userId)}>
                      👑 Transfer Host
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleRemove(p.userId)}
                    >
                      🚫 Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ParticipantList