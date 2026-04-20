import { useRoomContext } from '../../context/RoomContext'
import './Reactions.css'

const Reactions = () => {
  const { reactions } = useRoomContext()

  return (
    <div className="reactions-overlay">
      {reactions.map(reaction => (
        <div
          key={reaction.id}
          className="reaction-float"
          style={{ left: `${Math.random() * 80 + 10}%` }}
        >
          <span className="reaction-emoji">{reaction.emoji}</span>
          <span className="reaction-user">{reaction.username}</span>
        </div>
      ))}
    </div>
  )
}

export default Reactions