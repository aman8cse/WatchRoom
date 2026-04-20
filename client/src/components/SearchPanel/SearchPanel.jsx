import { useState, useRef } from 'react'
import usePlayer from '../../hooks/usePlayer'
import { extractVideoId, isYouTubeUrl, debounce } from '../../utils/helper.js';
import './SearchPanel.css'

const SearchPanel = ({ roomActions, onClose }) => {
  const [query, setQuery] = useState('')
  const { searchResults, searching, searchVideos, clearSearch } = usePlayer()

  const debouncedSearch = useRef(
    debounce((q) => {
      if (q.trim() && !isYouTubeUrl(q)) searchVideos(q)
    }, 2000)
  ).current

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) {
      clearSearch()
      return
    }
    debouncedSearch(val)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    const videoId = extractVideoId(query)
    if (videoId) {
      roomActions.changeVideo(videoId)
      onClose()
    }
  }

  const handleSelectResult = (videoId) => {
    roomActions.changeVideo(videoId)
    onClose()
  }

  return (
    <div className="search-panel">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="Search videos or paste YouTube URL..."
          value={query}
          onChange={handleInput}
          autoFocus
        />
        <button type="submit" className="btn btn-primary">Go</button>
      </form>

      {searching && (
        <div className="search-loading">Searching...</div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map(item => (
            <div
              key={item.id.videoId}
              className="search-result-item"
              onClick={() => handleSelectResult(item.id.videoId)}
            >
              <img
                src={item.snippet.thumbnails.default.url}
                alt={item.snippet.title}
                className="result-thumbnail"
              />
              <div className="result-info">
                <p className="result-title">{item.snippet.title}</p>
                <p className="result-channel text-secondary">
                  {item.snippet.channelTitle}
                </p>
              </div>
              <button className="btn btn-primary btn-sm">▶</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchPanel