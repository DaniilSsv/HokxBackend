require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const votesRouter = require('./routes/votes')

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Please create a .env file based on .env.example')
  process.exit(1)
}

mongoose.connect(MONGODB_URI, { dbName: process.env.DB_NAME || undefined })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error', err)
    process.exit(1)
  })

app.use('/votes', votesRouter)

app.get('/', (req, res) => res.json({ ok: true, message: 'BeHokx votes API' }))

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))
