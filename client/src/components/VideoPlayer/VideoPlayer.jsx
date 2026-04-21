import { useEffect, useRef } from 'react'
import { useRoomContext } from '../../context/RoomContext'
import './VideoPlayer.css'

const VideoPlayer = ({ playerRef }) => {
  const { videoState, updateVideoState } = useRoomContext()
  const ytPlayerRef = useRef(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent double init
    if (initializedRef.current) return
    initializedRef.current = true

    const createPlayer = () => {
      ytPlayerRef.current = new window.YT.Player('yt-player', {
        width: '100%',
        height: '100%',
        videoId: '',
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target
          },
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              const duration = event.target.getDuration()
              updateVideoState({ duration })
            }
          },
          onError: (e) => {
            console.error('YouTube player error:', e.data)
          }
        }
      })
    }

    // If API already loaded, create player immediately
    if (window.YT && window.YT.Player) {
      createPlayer()
      return
    }

    // Otherwise inject script and wait for callback
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(script)

    window.onYouTubeIframeAPIReady = () => {
      createPlayer()
    }

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy()
        playerRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  // Load new video when videoId changes
  useEffect(() => {
    if (playerRef.current && videoState.videoId) {
      playerRef.current.cueVideoById(videoState.videoId)
    }
  }, [videoState.videoId])

  useEffect(() => {
    if (!playerRef.current) return

    const interval = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === 'function' &&
        videoState.isPlaying
      ) {
        const currentTime = playerRef.current.getCurrentTime()
        updateVideoState({currentTime})
        // Only update local display, don't emit socket event
        // currentTime in context updates via seek events only
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [videoState.isPlaying])

  return (
    <div className="video-player">
      {!videoState.videoId && (
        <div className="video-placeholder">
          <span>🎬</span>
          <p>No video selected</p>
          <p className="text-secondary">
            Host or moderator can search and select a video
          </p>
        </div>
      )}
      <div id="yt-player" style={{ width: '100%', height: '100%' }} />
      <div className="player-overlay" />
    </div>
  )
}

export default VideoPlayer