const express = require('express')
const router = express.Router()
const Vote = require('../models/Vote')

// helper to safely build case-insensitive regex matching the whole string
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// GET /votes - return all votes as { date: [names] }
router.get('/', async (req, res) => {
  try {
    const docs = await Vote.find({}).lean()
    const out = {}
    docs.forEach(d => out[d.date] = d.names)
    res.json(out)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to fetch votes' })
  }
})

// POST /votes - body { name, dates: ["YYYY-MM-DD"] }
// Replaces user's votes: removes user from all existing dates, then adds to provided dates.
router.post('/', async (req, res) => {
  const { name, dates } = req.body || {}
  if (!name || !Array.isArray(dates)) return res.status(400).json({ error: 'name and dates[] required' })

  const trimmed = String(name).trim()
  if (!trimmed) return res.status(400).json({ error: 'name must not be empty' })

  try {
    // remove any existing entries that match the name case-insensitively across all dates
    const regex = new RegExp(`^${escapeRegex(trimmed)}$`, 'i')
    await Vote.updateMany({}, { $pull: { names: { $regex: regex } } })

    // add the provided-cased name to each requested date (will upsert documents)
    for (const date of dates) {
      await Vote.updateOne({ date }, { $addToSet: { names: trimmed } }, { upsert: true })
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to update votes' })
  }
})

// GET /votes/export - raw export JSON
router.get('/export', async (req, res) => {
  try {
    const docs = await Vote.find({}).lean()
    res.json(docs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to export' })
  }
})

module.exports = router
