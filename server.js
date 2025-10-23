const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/todoapp');
    console.log('MongoDB connected');
  } catch (error) {
    console.log('Database connection error:', error);
    process.exit(1);
  }
};

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.render('index', { todos });
  } catch (error) {
    res.status(500).send('Error fetching todos');
  }
});

app.post('/add', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).send('Todo text is required');
    }
    const newTodo = new Todo({ text: text.trim() });
    await newTodo.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error adding todo');
  }
});

app.post('/toggle/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo) {
      todo.completed = !todo.completed;
      await todo.save();
    }
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error updating todo');
  }
});

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// No authentication - anyone can access stats
app.get('/admin', async (req, res) => {
  try {
    const stats = {
      totalTodos: await Todo.countDocuments({}),
      completedTodos: await Todo.countDocuments({ completed: true }),
      pendingTodos: await Todo.countDocuments({ completed: false })
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telegram notification function
const sendTelegramNotification = async () => {
  try {
    const incompleteTodos = await Todo.find({ completed: false });

    if (incompleteTodos.length === 0) {
      return;
    }

    const todoList = incompleteTodos.map(todo => `• ${todo.text}`).join('\n');

    const message = `🔔 *Tâches non terminées*\n\nVous avez ${incompleteTodos.length} tâche(s) en attente:\n\n${todoList}\n\n📅 ${new Date().toLocaleDateString('fr-FR')}`;

    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Error sending Telegram notification:', error.message);
  }
};

// Cron job - runs every day at 9 AM
cron.schedule(process.env.CRON_SCHEDULE || '0 9 * * *', () => {
  console.log('Running daily todo reminder...');
  sendTelegramNotification();
});

// Manual trigger endpoint (no authentication required)
app.post('/notify', async (req, res) => {
  await sendTelegramNotification();
  res.json({ message: 'Telegram notification sent' });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});