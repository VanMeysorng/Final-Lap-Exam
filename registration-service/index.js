const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/studentdb';
mongoose.connect(MONGO_URL)
  .then(() => console.log('Registration: MongoDB connected'))
  .catch(err => console.error('DB error:', err.message));

const studentSchema = new mongoose.Schema({
  student_id:       { type: Number, required: true, unique: true },
  student_name:     { type: String, required: true },
  student_mobile:   { type: String, required: true },
  student_email:    { type: String, required: true, unique: true },
  student_password: { type: String, required: true }
}, { collection: 'students', versionKey: false });
const Student = mongoose.model('Student', studentSchema);

const hidePassword = s => { const o = s.toObject(); delete o.student_password; return o; };

app.get('/health', (req, res) =>
  res.json({ service: 'registration', status: 'ok', db: mongoose.connection.readyState === 1 }));

// Register (store) a student
app.post('/register', async (req, res) => {
  try {
    const { student_id, student_name, student_mobile, student_email, student_password } = req.body;
    if (!student_id || !student_name || !student_mobile || !student_email || !student_password)
      return res.status(400).json({ error: 'All fields are required' });
    const hashed = await bcrypt.hash(student_password, 10);
    const s = await Student.create({ student_id, student_name, student_mobile, student_email, student_password: hashed });
    res.status(201).json({ message: 'Student registered successfully', student: hidePassword(s) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Student ID or email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Retrieve all students
app.get('/students', async (req, res) => {
  res.json(await Student.find({}, { student_password: 0, _id: 0 }));
});

// Update a student by student_id
app.put('/students/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.student_id;
    if (update.student_password) update.student_password = await bcrypt.hash(update.student_password, 10);
    const s = await Student.findOneAndUpdate({ student_id: Number(req.params.id) }, update, { new: true });
    if (!s) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated successfully', student: hidePassword(s) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Registration Service running on port 3001'));
