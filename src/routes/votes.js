const express = require('express')
const router = express.Router()
const Vote = require('../models/Vote')

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

  try {
    // remove name from all docs
    await Vote.updateMany({}, { $pull: { names: name } })

    // add to each date with $addToSet
    for (const date of dates) {
      await Vote.updateOne({ date }, { $addToSet: { names: name } }, { upsert: true })
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to update votes' })
  }
})

// DELETE /votes?name=Alice - removes the named user from all dates
router.delete('/', async (req, res) => {
  const name = req.query.name
  if (!name) return res.status(400).json({ error: 'name query required' })
  try {
    await Vote.updateMany({}, { $pull: { names: name } })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to remove votes' })
  }
})

// POST /votes/remove - body { name, dates: ["YYYY-MM-DD"] } - removes the named user from the specified dates only
router.post('/remove', async (req, res) => {
  const { name, dates } = req.body || {}
  if (!name || !Array.isArray(dates)) return res.status(400).json({ error: 'name and dates[] required' })
  try {
    for (const date of dates) {
      await Vote.updateOne({ date }, { $pull: { names: name } })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'failed to remove from dates' })
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
