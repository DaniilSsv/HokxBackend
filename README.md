# behokx — simple votes API

This folder contains a minimal Node.js + Express API that stores per-date votes (arrays of voter names) in MongoDB.

Quick start

1. setup .env

```text
MONGODB_URI=mongodb+srv://username:password@cluster.iswroay.mongodb.net/yourDatabaseName
PORT=4000
```

2. Install deps and run:

```powershell
npm install
npm run dev
```

API

- GET /votes — returns { date: [names] }
- POST /votes — body { name, dates: ["YYYY-MM-DD"] } — replaces the user's votes (removes them from other dates and adds to provided dates)
- DELETE /votes?name=Alice — removes the given name from all dates
- GET /votes/export — returns raw documents

Notes

- The server expects `MONGODB_URI` in environment. point the frontend to this API URL. Deploy this server to any host (Railway, Render, Fly, Heroku, etc.).
