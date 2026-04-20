import { useState } from 'react'
import { useRoomContext } from '../../context/RoomContext'
import SearchPanel from '../SearchPanel/SearchPanel'
import { formatTime } from '../../utils/helper.js'
import './Controls.css'

const Controls = ({ roomActions }) => {
  const { videoState, myRole } = useRoomContext()
  const [showSearch, setShowSearch] = useState(false)

  const canControl = myRole === 'host' || myRole === 'moderator'

  const handlePlay = () => roomActions.play()
  const handlePause = () => roomActions.pause()

  return (
    <div className="controls">
      <div className="controls-main">
        {/* Playback buttons */}
        <div className="controls-left">
          {canControl ? (
            <>
              <button
                className="btn btn-primary control-btn"
                onClick={videoState.isPlaying ? handlePause : handlePlay}
              >
                {videoState.isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <span className="controls-time">
                {formatTime(videoState.currentTime)}
              </span>
            </>
          ) : (
            <span className="controls-readonly">
              👀 Watch only — only host/moderator can control
            </span>
          )}
        </div>

        {/* Search button */}
        <div className="controls-right">
          {canControl && (
            <button
              className="btn btn-secondary control-btn"
              onClick={() => setShowSearch(prev => !prev)}
            >
              🔍 {showSearch ? 'Close Search' : 'Change Video'}
            </button>
          )}

          {/* Reactions */}
          <div className="reaction-buttons">
            {['😂', '❤️', '🔥', '😮', '👏'].map(emoji => (
              <button
                key={emoji}
                className="btn btn-ghost reaction-btn"
                onClick={() => roomActions.sendReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search panel — shown/hidden */}
      {showSearch && canControl && (
        <SearchPanel
          roomActions={roomActions}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}

export default Controls