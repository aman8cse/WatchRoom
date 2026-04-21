import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Landing.css'

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGetStarted = () => {
    navigate(user ? '/dashboard' : '/register')
  }

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-icon"></span>
          <span className="logo-text">CoWatch</span>
        </div>
        <div className="landing-nav-links">
          {user ? (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                className="btn btn-ghost"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">
            Watch Together,<br />
            <span className="landing-title-accent">Feel Together</span>
          </h1>
          <p className="landing-subtitle">
            Create a room, invite friends, and enjoy YouTube videos
            in perfect sync — no matter where you are.
          </p>
          <div className="landing-cta">
            <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
              Start Watching Free
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/login')}
            >
              I have an account
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="landing-features">
          <div className="feature-card">
            <span className="feature-icon"></span>
            <h3>Real-time Sync</h3>
            <p>Play, pause, and seek in perfect sync with everyone in the room</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon"></span>
            <h3>Role System</h3>
            <p>Host controls who can manage playback with moderator roles</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon"></span>
            <h3>Live Chat</h3>
            <p>React and chat with friends while watching together</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Landing