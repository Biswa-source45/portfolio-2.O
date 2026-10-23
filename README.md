# Biswabhusan Sahoo — Portfolio (MERN)

Minimal, animation-heavy portfolio with an admin panel and an AI assistant that answers visitors' questions about Biswa.

- **Frontend:** React 19 + Vite, Tailwind CSS v4, GSAP + ScrollTrigger, Framer Motion, Lenis smooth scroll, Phosphor icons
- **Backend:** Node.js + Express 5, MongoDB (Mongoose), JWT admin auth, image uploads (multer)
- **AI:** Google Gemini via the `@google/genai` SDK, streamed to the chat widget over server-sent events

Content was migrated from the original static site ([Biswa-source45/portfolio-2.O](https://github.com/Biswa-source45/portfolio-2.O)).

## Run locally

```bash
npm run install:all
cp server/.env.example server/.env   # then edit JWT_SECRET and ADMIN_PASSWORD
npm run dev
```

- Site: http://localhost:5173
- Admin: http://localhost:5173/admin (email/password from `server/.env`)
- API: http://localhost:5000/api

No MongoDB installed? Leave `MONGO_URI` empty: the server starts a local dev MongoDB and stores data in `server/.mongo-data` (the first start downloads the MongoDB binary, which takes a while). The database is seeded with the portfolio content on first run. `npm run seed` resets the content to the defaults in `server/src/seed/data.js`.

## AI assistant

Add a Gemini API key from **Admin → AI assistant** (get a free one at https://aistudio.google.com/apikey). The key is checked against Google before saving, stored encrypted in MongoDB (with a key derived from `JWT_SECRET`), never sent to the browser, and can be replaced or removed there; the model can be switched there from the live list of models the key can use. `GEMINI_API_KEY` in `server/.env` still works as a fallback. The assistant receives everything in the database as its knowledge, plus private notes from **Admin → AI assistant**, and replies in the visitor's language (English, Hindi, Hinglish, Odia). Until a key is set, the "Ask AI" button is hidden on the site.

The first time a key is saved, the newest Gemini Flash model is picked by default. There is a rate limit of 30 questions per 10 minutes per visitor.

## Admin panel

| Page | What it controls |
|---|---|
| Overview | Visits, AI conversations, message count, latest messages |
| Profile | Name, hero headline, about text, photo, links, stats, education, languages, marquee words |
| Projects / Experience / Skills / Achievements | Add, edit, delete, drag to reorder |
| Messages | Contact-form inbox: read/unread, reply by email, delete |
| AI assistant | Gemini API key (add / replace / remove), model, on/off, greeting, suggested questions, extra knowledge |

## Project structure

```
client/                 React app
  src/components/site   Loader, Hero, Marquee, About, Experience, Work, Skills, Recognition, Contact, ChatWidget, Cursor
  src/pages/admin       Admin pages
server/
  src/models            Mongoose schemas
  src/routes            public, auth, admin, chat
  src/seed              Default content + seeding
  uploads/              Uploaded images
```

## Deploy

One service is enough: `npm run build` builds the client into `client/dist`, and `npm start` serves both the API and the built site from Express.

On Render (or Railway): build command `npm run install:all && npm run build`, start command `npm start`, and set the environment variables from `server/.env.example` (use a MongoDB Atlas `MONGO_URI` in production). Uploaded images live on disk, so attach a persistent disk or use image URLs.
