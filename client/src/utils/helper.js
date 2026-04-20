export const extractVideoId = (input) => {
  if (!input) return ''
  const urlMatch = input.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  )
  return urlMatch ? urlMatch[1] : input.trim()
}

export const isYouTubeUrl = (input) => {
  return input.includes('youtube.com') || input.includes('youtu.be')
}

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const getInitials = (username) => {
  if (!username) return '?'
  return username.slice(0, 2).toUpperCase()
}

export const getRoleIcon = (role) => {
  const icons = {
    host: '👑',
    moderator: '🎭',
    participant: '👤'
  }
  return icons[role] || '👤'
}

export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}