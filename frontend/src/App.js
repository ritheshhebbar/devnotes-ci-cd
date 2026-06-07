import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://devnotes-ci-cd.onrender.com/notes";

  const fetchNotes = async () => {
    const res = await axios.get(API);
    setNotes(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {

    if (!text.trim()) return;

    await axios.post(API, { text });

    setText("");

    fetchNotes();
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchNotes();
  };

  return (
    <>
      {/* Animated background orbs */}
      <div className="app-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="app-container">
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