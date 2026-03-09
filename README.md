# MoveUp - Frontend

MoveUp is a fitness training platform that lets users browse workout sessions, plan their schedule, manage favorites, and track their progress through a personal dashboard.

This repository contains the **frontend** client only. The backend API is maintained in a separate repository.

- Live demo: [https://move-up-front-client.vercel.app](https://move-up-front-client.vercel.app)
- Original monorepo: [ChickenCodeSchool/Js-Crew809-TeamRocket-P2-G2-moveup](https://github.com/ChickenCodeSchool/Js-Crew809-TeamRocket-P2-G2-moveup)
- Backend repository: [Harmajabb/move-up-BACK](https://github.com/Harmajabb/move-up-BACK)

---

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** (dev server and build tool)
- **React Router 7** (client-side routing)
- **FullCalendar** (training schedule / planning)
- **Google OAuth** (user authentication)
- **Biome** (linting and formatting)

---

## Project Structure

```
client/
├── src/
│   ├── assets/          # Images, videos, favicon
│   ├── components/      # Reusable UI components
│   ├── context/         # React context (auth, user state)
│   ├── pages/           # Page-level components
│   │   ├── Accueil.tsx
│   │   ├── Entrainements.tsx
│   │   ├── EntrainementDetail.tsx
│   │   ├── Planning.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Favoris.tsx
│   │   ├── Coach.tsx
│   │   ├── Profil.tsx
│   │   ├── Connexion.tsx
│   │   ├── Inscription.tsx
│   │   ├── Tarifs.tsx
│   │   ├── Contact.tsx
│   │   ├── About.tsx
│   │   └── ...
│   ├── services/        # API call functions
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx
│   └── main.tsx
├── .env
└── .env.sample
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- The backend API running locally or accessible via a remote URL

### Installation

1. Clone this repository:
   ```bash
   git clone git@github.com:Harmajabb/move-up-FRONT.git
   cd move-up-FRONT/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the sample:
   ```bash
   cp .env.sample .env
   ```

4. Set the API URL in `.env`:
   ```
   VITE_API_URL=https://move-up-back.onrender.com
   ```
   Replace with `http://localhost:3310` if running the backend locally.

5. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command          | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Start the Vite development server        |
| `npm run build`  | Build the app for production             |
| `npm run check`  | Run Biome linting and formatting checks  |

---

## Environment Variables

| Variable       | Description                         | Example                                  |
|----------------|-------------------------------------|------------------------------------------|
| `VITE_API_URL` | Base URL of the backend API         | `https://move-up-back.onrender.com`      |

---

## Contributing

1. Fork the repository.
2. Clone your fork locally.
3. Create a new branch: `git switch -c feature/your-feature-name`
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to your branch: `git push origin feature/your-feature-name`
6. Open a Pull Request against the `dev` branch.

Before pushing, run `npm run check` to ensure your code passes all linting rules.
