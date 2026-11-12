const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/studentdb';
mongoose.connect(MONGO_URL)
  .then(() => console.log('Search: MongoDB connected'))
  .catch(err => console.error('DB error:', err.message));

const Student = mongoose.model('Student', new mongoose.Schema({
  student_id: Number, student_name: String, student_mobile: String,
  student_email: String, student_password: String
}, { collection: 'students', versionKey: false }));

const HIDE = { student_password: 0, _id: 0 };

app.get('/health', (req, res) =>
  res.json({ service: 'search', status: 'ok', db: mongoose.connection.readyState === 1 }));

// Search by student ID
app.get('/students/id/:id', async (req, res) => {
  const s = await Student.findOne({ student_id: Number(req.params.id) }, HIDE);
  if (!s) return res.status(404).json({ error: 'Student not found' });
  res.json(s);
});

// Search by student name (partial, case-insensitive)
app.get('/students/name/:name', async (req, res) => {
  const safe = req.params.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const list = await Student.find({ student_name: { $regex: safe, $options: 'i' } }, HIDE);
  if (list.length === 0) return res.status(404).json({ error: 'No student found with that name' });
  res.json(list);
});

app.listen(3002, () => console.log('Search Service running on port 3002'));
