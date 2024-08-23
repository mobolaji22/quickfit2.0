import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/Journaling.css";

const Journaling = () => {
  const { user } = useContext(UserContext);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: "", content: "" });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (user) {
      const storedEntries =
        JSON.parse(localStorage.getItem(`${user.username}-journalEntries`)) ||
        [];
      setEntries(storedEntries);
    }
  }, [user]);

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.content) {
      const newEntryObj = {
        id: Date.now(), 
        title: newEntry.title,
        content: newEntry.content,
        date: new Date().toLocaleString(),
        notes: [],
      };
      const updatedEntries = [newEntryObj, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem(
        `${user.username}-journalEntries`,
        JSON.stringify(updatedEntries)
      );
      setNewEntry({ title: "", content: "" });
      setFeedback("Journal entry added successfully!");
    } else {
      setFeedback("Please fill in the title and content.");
    }
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleEntryClick = (id) => {
    const entry = entries.find((e) => e.id === id);
    setSelectedEntry(entry);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
  };

  const handleDeleteEntry = () => {
    const updatedEntries = entries.filter(
      (entry) => entry.id !== selectedEntry.id
    );
    setEntries(updatedEntries);
    setSelectedEntry(null);
    localStorage.setItem(
      `${user.username}-journalEntries`,
      JSON.stringify(updatedEntries)
    );
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedEntries = [...entries];
      const entryIndex = updatedEntries.findIndex(
        (e) => e.id === selectedEntry.id
      );
      updatedEntries[entryIndex].notes.push({ text: newNote, updated: true });
      setEntries(updatedEntries);
      localStorage.setItem(
        `${user.username}-journalEntries`,
        JSON.stringify(updatedEntries)
      );
      setNewNote("");
    }
  };

  return (
    <div className="journaling-page">
      <h2>Journaling</h2>

      <div className="navigation-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/food-water">Food & Water Tracking</Link>
        {user?.gender !== "male" && (
          <Link to="/menstrual">Menstrual Cycle</Link>
        )}
        <Link to="/workout">Workouts</Link>
        <Link to="/activities">Activities</Link>
      </div>

      <div className="journal-form">
        <input
          type="text"
          name="title"
          value={newEntry.title}
          onChange={(e) =>
            setNewEntry((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Journal Title"
        />
        <textarea
          name="content"
          value={newEntry.content}
          onChange={(e) =>
            setNewEntry((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder="Write your journal..."
        />
        <button onClick={handleAddEntry}>Add Journal Entry</button>
        {feedback && <p className="feedback">{feedback}</p>}
      </div>

      {selectedEntry ? (
        <div className="entry-view">
          <button onClick={handleBackToList} className="journal-button">
            Back to List
          </button>
          <div className="journal-entry-details">
            <h3>{selectedEntry.title}</h3>
            <p>{selectedEntry.date}</p>
            <p>{selectedEntry.content}</p>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
            />
            <button onClick={handleAddNote} className="update-button">
              Update Entry
            </button>
            <div className="notes">
              {selectedEntry.notes.map((note, j) => (
                <p
                  key={j}
                  className={note.updated ? "updated-note" : "existing-note"}
                >
                  {note.text}
                </p>
              ))}
            </div>
            <button onClick={handleDeleteEntry}>Delete Entry</button>
          </div>
        </div>
      ) : (
        <div className="past-entries">
          <h3>Past Entries</h3>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="entry-item"
                onClick={() => handleEntryClick(entry.id)}
              >
                <h4>{entry.title}</h4>
                <p>{entry.date}</p>
              </div>
            ))
          ) : (
            <p>No journal entries found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Journaling;
