import { useState, useCallback } from 'react'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

const usePlayer = () => {
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const loadYouTubeAPI = useCallback(() => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
      window.onYouTubeIframeAPIReady = resolve
    })
  }, [])

  const searchVideos = async (query) => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `q=${encodeURIComponent(query)}` +
        `&key=${YOUTUBE_API_KEY}` +
        `&part=snippet` +
        `&type=video` +
        `&maxResults=6`
      )
      const data = await res.json()
      setSearchResults(data.items || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => setSearchResults([])

  return {
    searchResults,
    searching,
    loadYouTubeAPI,
    searchVideos,
    clearSearch
  }
}

export default usePlayer