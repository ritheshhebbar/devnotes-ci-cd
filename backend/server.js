const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

const NoteSchema = new mongoose.Schema({
    text: String
});

const Note = mongoose.model("Note", NoteSchema);

// GET NOTES
app.get("/notes", async (req, res) => {

    const notes = await Note.find();

    res.json(notes);
});

// ADD NOTE
app.post("/notes", async (req, res) => {

    const note = new Note({
        text: req.body.text
    });

    await note.save();

    res.json(note);
});

// DELETE NOTE
app.delete("/notes/:id", async (req, res) => {

    await Note.findByIdAndDelete(req.params.id);

    res.json({
        message: "Note deleted"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});