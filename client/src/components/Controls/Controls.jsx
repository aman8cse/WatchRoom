import { useState, useRef } from 'react'
import { useRoomContext } from '../../context/RoomContext'
import SearchPanel from '../SearchPanel/SearchPanel'
import { formatTime } from '../../utils/helper.js'
import './Controls.css'

const Controls = ({ roomActions }) => {
  const { videoState, myRole } = useRoomContext()
  const [showSearch, setShowSearch] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  const canControl = myRole === 'host' || myRole === 'moderator'

  // While dragging, show local value — on release emit seek
  const handleSeekChange = (e) => {
    setSeekValue(Number(e.target.value))
  }

  const handleSeekRelease = (e) => {
    const time = Number(e.target.value)
    roomActions.seek(time)
    setSeeking(false)
  }

  const handleSeekStart = () => setSeeking(true)

  // Use local seekValue while dragging, else use synced currentTime
  const displayTime = seeking ? seekValue : videoState.currentTime

  return (
    <div className="controls">
      <div className="controls-main">
        <div className="controls-left">
          {canControl ? (
            <>
              <button
                className="btn btn-primary control-btn"
                onClick={videoState.isPlaying
                  ? () => roomActions.pause()
                  : () => roomActions.play()
                }
              >
                {videoState.isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <span className="controls-time">
                {formatTime(displayTime)}
              </span>
            </>
          ) : (
            <span className="controls-readonly">
              Watch only — only host/moderator can control
            </span>
          )}
        </div>

        <div className="controls-right">
          {canControl && (
            <button
              className="btn btn-secondary control-btn"
              onClick={() => setShowSearch(prev => !prev)}
            >
              🔍 {showSearch ? 'Close' : 'Change Video'}
            </button>
          )}
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

      {/* Seek bar — only for host/moderator */}
      {canControl && (
        <div className="seek-bar-wrapper">
          <input
            type="range"
            className="seek-bar"
            min={0}
            max={videoState.duration || 100}
            value={displayTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseUp={handleSeekRelease}
            onTouchEnd={handleSeekRelease}
          />
          <span className="controls-time">
            {formatTime(videoState.duration || 0)}
          </span>
        </div>
      )}

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