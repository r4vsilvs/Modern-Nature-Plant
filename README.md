# Modern Nature Plant

MERN display website for a plant business. It is not an e-commerce app: visitors can browse plants and contact the business, while only the admin can login and manage the product catalog.

## Stack

- MongoDB
- Express
- React with `react-scripts` (no Vite)
- Node.js

## Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Create backend environment file:

   ```bash
   copy backend\.env.example backend\.env
   ```

4. Make sure MongoDB is running, then seed admin and sample products:

   ```bash
   cd backend
   npm run seed
   ```

5. Start backend:

   ```bash
   cd backend
   npm run dev
   ```

6. Start frontend in another terminal:

   ```bash
   cd frontend
   npm start
   ```

## Admin Login

Default seed credentials:

- Email: `modernnatureplant@gmail.com`
- Password: `Nehansa@2026git`

Open `/admin` in the frontend to manage products.
