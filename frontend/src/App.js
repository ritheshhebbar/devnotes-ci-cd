import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);

  // BACKEND URL
  const API = "https://devnotes-ci-cd.onrender.com/notes";

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const res = await axios.get(API);
      setNotes(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add note
  const addNote = async () => {

    if (!text.trim()) return;

    try {

      await axios.post(API, { text });

      setText("");

      fetchNotes();

    } catch (err) {
      console.error("Add Error:", err);
    }
  };

  // Delete note
  const deleteNote = async (id) => {

    try {

      await axios.delete(`${API}/${id}`);

      fetchNotes();

    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>DevNotes</h1>

      <textarea
        rows="4"
        cols="50"
        placeholder="Write note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={addNote}>
        Add Note
      </button>

      <hr />

      {notes.map((note) => (

        <div
          key={note._id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >

          <p>{note.text}</p>

          <button onClick={() => deleteNote(note._id)}>
            Delete
          </button>

        </div>
      ))}

    </div>
  );
}

export default App;