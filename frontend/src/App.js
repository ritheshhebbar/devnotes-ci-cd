import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  // Auth state
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [isLogin, setIsLogin] = useState(true);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Notes state
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://devnotes-ci-cd.onrender.com";

  // Axios instance with auth header
  const api = axios.create({
    baseURL: API,
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      // If unauthorized, log out
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addNote = async () => {

    if (!text.trim()) return;

    await api.post("/notes", { text });

    setText("");

    fetchNotes();
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  // Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await axios.post(`${API}${endpoint}`, {
        username: authUsername,
        password: authPassword
      });

      const { token: newToken, username: newUsername } = res.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("username", newUsername);
      setToken(newToken);
      setUsername(newUsername);
      setAuthUsername("");
      setAuthPassword("");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setAuthError(err.response.data.error);
      } else {
        setAuthError("Something went wrong. Please try again.");
      }
    }

    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken("");
    setUsername("");
    setNotes([]);
    setLoading(true);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError("");
    setAuthUsername("");
    setAuthPassword("");
  };

  // ---------- Auth page ----------
  if (!token) {
    return (
      <>
        <div className="app-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-icon">📝</div>
              <h1>DevNotes</h1>
              <p>Capture ideas, snippets &amp; quick thoughts</p>
            </div>

            <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>

            {authError && (
              <div className="error-toast">
                <span className="error-icon">⚠️</span>
                <p>{authError}</p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleAuth}>
              <div className="input-group">
                <label htmlFor="auth-username">Username</label>
                <input
                  id="auth-username"
                  type="text"
                  placeholder="Enter your username"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  placeholder="Enter your password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={4}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={authLoading || !authUsername.trim() || !authPassword}
              >
                {authLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="auth-toggle">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleAuthMode}>
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---------- Notes page (authenticated) ----------
  return (
    <>
      {/* Animated background orbs */}
      <div className="app-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="app-container">
        {/* Top bar with user info */}
        <div className="top-bar">
          <div className="user-info">
            <div className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{username}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            ↗ Sign out
          </button>
        </div>

        {/* Header */}
        <header className="app-header">
          <div className="logo">
            <div className="logo-icon">📝</div>
            <h1>DevNotes</h1>
          </div>
          <p className="subtitle">Capture ideas, snippets &amp; quick thoughts</p>
        </header>

        {/* Composer */}
        <div className="composer-card">
          <textarea
            placeholder="What's on your mind? Write a note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="composer-actions">
            <span className="char-count">{text.length} characters</span>
            <button
              className="btn-primary"
              onClick={addNote}
              disabled={!text.trim()}
            >
              <span>✦</span> Add Note
            </button>
          </div>
        </div>

        {/* Notes list */}
        <div className="notes-section">
          <div className="notes-section-header">
            <h2>Your Notes</h2>
            <span className="notes-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No notes yet</h3>
              <p>Start by writing your first note above</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="note-card">
                <div className="note-card-body">
                  <p>{note.text}</p>
                </div>
                <div className="note-card-footer">
                  <span className="note-timestamp"></span>
                  <button
                    className="btn-delete"
                    onClick={() => deleteNote(note._id)}
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default App;