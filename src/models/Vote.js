const mongoose = require('mongoose')

const VoteSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  names: { type: [String], default: [] }
}, { timestamps: true })

module.exports = mongoose.model('Vote', VoteSchema)
