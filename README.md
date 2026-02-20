# PantryPal

PantryPal is a food inventory and recipe-matching web app that helps users answer:
"What can I cook right now without going to the store?"

## Team

- Ricky Lee
- Tarun Badarvada

## Class Link

- Add class link here

## Project Objective

PantryPal helps users track pantry ingredients and match those ingredients against recipes.
The app is designed to reduce food waste, improve meal planning, and make it easier to decide what to cook.

## Core Features

- Pantry tracking (ingredients, quantities, expiration dates)
- Recipe browsing and search
- Recipe-to-pantry matching status:
- Ready to make
- Missing 1-2 ingredients
- Missing several ingredients
- Add, edit, and delete recipes
- Pantry Health concept (planned): indicates how many recipes can be cooked in the next 7 days

## User Personas

1. College Student (budget-conscious, avoids extra grocery trips)
2. Busy Professional (needs quick ideas with what is already at home)
3. Health-Conscious Individual (tracks ingredients carefully)
4. Small Family Parent (manages household groceries)
5. Beginner Cook (needs clear guidance on possible meals)

## User Stories

### Ricky's User Stories

- As a user, I want to add pantry items with quantities and expiration dates so that I can track what food I currently have.
- As a user, I want to update or delete pantry items so that my inventory stays accurate.
- As a user, I want to view recipes that I can cook immediately so that I can quickly decide what to make.
- As a user, I want to see which recipes are missing only one or two ingredients so that I can decide if a quick grocery trip is worth it.
- As a user, I want to see a Pantry Health score so that I understand how well-stocked my kitchen is for the upcoming week.

### Tarun's User Stories

- As a user, I want to browse and search recipes stored in the application so that I can explore meal options.
- As a user, I want to add new recipes to the database so that I can personalize the system with my own meals.
- As a user, I want to edit or delete recipes so that outdated or incorrect recipes can be removed.
- As a user, I want the app to compare my pantry against recipes automatically so that I do not have to manually check ingredients.
- As a user, I want a clear visual indicator (such as categories or labels) showing Can Cook Now or Missing Ingredients so that I can quickly make decisions.

## Tech Stack

- Node.js
- Express
- MongoDB
- Vanilla JavaScript
- HTML/CSS

## Project Structure

- `backend.js` - Express server entry point
- `routes/` - API routes (`recipes`, `pantry`)
- `frontend/` - static frontend pages and JavaScript
- `db/` - MongoDB connection logic
- `config/` - environment/config loading

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker Desktop (for local MongoDB), or MongoDB Atlas (for deployment)

### Installation

```bash
git clone https://github.com/notrickhere/PantryPal.git
cd PantryPal
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure one of these options.

Option A: Atlas / hosted MongoDB (recommended for deployment)

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/pantryPal?retryWrites=true&w=majority
MONGODB_DB_NAME=pantryPal
```

Option B: Local MongoDB (Docker)

```env
PORT=3000
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=your_mongo_username
MONGODB_PASSWORD=your_mongo_password
MONGODB_AUTH_SOURCE=admin
MONGODB_DB_NAME=pantryPal
```

### Running Locally (Docker MongoDB)

```bash
npm run mongo:up
npm run seed:db
npm run dev
```

`npm run seed:db` loads data from `seeding_data/recipe.json` (recipes) and `seeding_data/ingredient.json` (pantry items).

### Running Locally (Atlas)

```bash
npm run seed:db
npm run dev
```

`npm run seed:db` loads data from `seeding_data/recipe.json` (recipes) and `seeding_data/ingredient.json` (pantry items).

### Production Start

```bash
npm start
```

Open in browser:

- `http://localhost:3000/`
- `http://localhost:3000/recipes.html`
- `http://localhost:3000/pantry.html`

## How You Run Now

Local Docker dev:

```bash
npm run mongo:up
npm run seed:db
npm run dev
```

Atlas dev/deploy style:

1. Put Atlas URI in `.env` (`MONGODB_URI=...`)
2. `npm run seed:db` (optional if DB is empty)
3. `npm run dev` (or `npm start` in production)

## Design Mockups / Figma

- [Figma Mockups](https://www.figma.com/design/fQcS5LSeXn5y0WDAYr943l/PantryPal?node-id=0-1&t=mJRrqOvgDaDxhZ7Z-1)

## Screenshot

## License

MIT
