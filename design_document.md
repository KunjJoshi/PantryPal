## 1. Project Description
PantryPal is a web application that helps users manage pantry ingredients and discover recipes they can cook with what they already have.
The app answers the question: "What can I cook right now without going to the store?"

### Core Features
- Account-based login and registration.
- Per-user pantry tracking (add, edit, delete ingredients with quantity and expiration).
- Per-user recipe management (add, browse, search, filter, delete).
- Recipe availability status:
  - Ready To Make
  - Missing 1-2 Ingredients
  - Missing Several Ingredients
- Pantry health bar based on pantry ingredient count (up to 5 hearts).
- Pagination on recipes page (9 recipes per page).

### Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- Backend: Node.js, Express.js
- Database: MongoDB (local via Docker for development, MongoDB Atlas for deployment)
- Deployment: Render

### Database Schema
The project uses MongoDB collections with account-scoped data using `userId`.

#### Collection: `users`
```json
{
  "_id": "ObjectId",
  "username": "string",
  "usernameLower": "string",
  "passwordHash": "string",
  "salt": "string",
  "token": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Collection: `pantry` (ingredients)
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "name": "string",
  "quantity": "number",
  "expiresAt": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### Collection: `recipes`
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "title": "string",
  "cuisine": "string",
  "ingredients": ["string"],
  "description": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 2. User Personas
1. College Student (budget-conscious, avoids extra grocery trips).
2. Busy Professional (needs quick ideas with available ingredients).
3. Health-Conscious Individual (tracks ingredients and freshness).
4. Small Family Parent (manages home food inventory).
5. Beginner Cook (needs clear and simple recipe guidance).

## 3. User Stories
### Ricky's User Stories
- As a user, I want to add pantry items with quantities and expiration dates so I can track what food I currently have.
- As a user, I want to update or delete pantry items so my inventory stays accurate.
- As a user, I want to view recipes I can cook immediately so I can quickly decide what to make.
- As a user, I want to see which recipes are missing only one or two ingredients so I can decide whether a quick grocery trip is worth it.
- As a user, I want to see a Pantry Health score so I understand how well-stocked my kitchen is.

### Tarun's User Stories
- As a user, I want to browse and search recipes stored in the app so I can explore meal options.
- As a user, I want to add new recipes to the database so I can personalize the system.
- As a user, I want to edit or delete recipes so outdated or incorrect recipes can be removed.
- As a user, I want the app to compare my pantry against recipes automatically so I do not have to manually check ingredients.
- As a user, I want a clear visual indicator showing Can Cook Now or Missing Ingredients so I can make decisions quickly.

## 4. Design Mockups
Design mockups were created in Figma and exported screenshots are in `/images`:
- `images/fig_home.png`
- `images/fig_recipe.png`

Figma link:
- https://www.figma.com/design/fQcS5LSeXn5y0WDAYr943l/PantryPal?node-id=0-1&t=mJRrqOvgDaDxhZ7Z-1

## 5. Work Distribution
- Ricky:
  - Database configuration and connectivity (local Docker + Atlas).
  - Database seeding setup and seed data integration.
  - Backend routing and API implementation.
  - Pantry health logic and backend feature integration.
  - Deployment setup and debugging (Render + Atlas).
- Tarun:
  - UI design direction and visual styling decisions.
  - Mockups and design references.
  - Shared backend route development and feature ideation.
  - Pantry health feature concept and UX direction.
