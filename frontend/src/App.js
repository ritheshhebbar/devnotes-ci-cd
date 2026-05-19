import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);

  const API = "http://localhost:5000/notes";

  const fetchNotes = async () => {
    const res = await axios.get(API);
    setNotes(res.data);
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
    <div style={{ padding: "30px" }}>
      <h1>DevNotes</h1>

      <textarea
        rows="4"
        cols="50"
        placeholder="Write not"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={addNote}>
        Add Note
      </button>

      <hr />

      {notes.map((note) => (
        <div key={note._id} style={{
          border: "1px solid gray",
          padding: "10px",
          marginBottom: "10px"
        }}>
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