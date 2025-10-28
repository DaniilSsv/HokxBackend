const cron = require('node-cron')
const { DateTime } = require('luxon')
const Vote = require('../models/Vote')

function getBelgiumToday() {
  return DateTime.now().setZone('Europe/Brussels').toISODate()
}

async function cleanupOlderThanToday() {
  const today = getBelgiumToday()
  try {
    const result = await Vote.deleteMany({ date: { $lt: today } })
    console.log(`[cleanup] Belgium date ${today} - removed ${result.deletedCount} old vote(s)`)
  } catch (err) {
    console.error('[cleanup] failed to delete old votes', err)
  }
}

function startCleanupCron() {
  cleanupOlderThanToday()

  // Schedule to run daily at 00:05 Europe/Brussels time
  const task = cron.schedule('5 0 * * *', cleanupOlderThanToday, { timezone: 'Europe/Brussels' })
  console.log('[cleanup] scheduled daily cleanup at 00:05 Europe/Brussels')
  return task
}

module.exports = { startCleanupCron, cleanupOlderThanToday }
