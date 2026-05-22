# 💸 ExpenseIQ

Hey there! 👋 Welcome to **ExpenseIQ** — your smart, personal finance manager designed to give you clarity and control over your money. 

Keeping track of where your hard-earned cash goes shouldn't be a chore. That's why ExpenseIQ combines a beautiful, snappy interface with the power of AI to help you effortlessly log transactions, visualize your spending habits, and get actionable insights. Let's make managing money feel less like accounting and more like a superpower. 🦸‍♂️🦸‍♀️

## ✨ What's inside? (Features)

*   **📊 Interactive Dashboard:** Get a bird's-eye view of your finances with beautiful, real-time charts (shoutout to Recharts!).
*   **💰 Income & Expense Tracking:** Log your daily transactions in seconds. Whether it's your monthly salary or that extra cup of coffee, we've got you covered.
*   **🤖 AI-Powered Insights:** Not sure where all your money went? Our AI (powered by Google GenAI) analyzes your spending patterns and gives you personalized, actionable advice.
*   **🔐 Secure Authentication:** Your data is yours. We use JWT-based authentication to ensure your financial details stay safe and private.
*   **🎨 Butter-Smooth UI:** Built with Tailwind CSS and Framer Motion for a sleek, modern, and highly responsive user experience.

## 🛠️ The Tech Stack

We've built ExpenseIQ using the reliable and powerful MERN stack, sprinkled with some modern tooling:

**Frontend:**
*   React 19 (powered by Vite ⚡)
*   Tailwind CSS (for that pixel-perfect styling)
*   Framer Motion (for buttery smooth animations)
*   Recharts (for beautiful data visualization)
*   React Router DOM (for seamless navigation)

**Backend:**
*   Node.js & Express.js
*   MongoDB & Mongoose (Database)
*   Google GenAI (for the AI Insights magic)
*   JWT & bcryptjs (for secure auth)

## 🚀 Getting Started

Want to run ExpenseIQ locally? Awesome! Here's how to get it up and running on your machine:

### 1. Clone the repository
(Assuming you have the code ready, just open the project folder in your terminal).

### 2. Set up the Backend
Open a new terminal window and navigate to the backend folder:
```bash
cd Backend
npm install
```

**Environment Variables (.env)**
Create a `.env` file inside the `Backend` directory and add the following keys:
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_genai_api_key
```

Start the backend server:
```bash
npm run start
```
*The server should now be running on http://localhost:4000*

### 3. Set up the Frontend
Open another terminal window and navigate to the frontend folder:
```bash
cd Frontend
npm install
```

**Environment Variables (.env)**
Create a `.env` file inside the `Frontend` directory and add the following:
```env
VITE_API_URL=http://localhost:4000
```

Start the frontend development server:
```bash
npm run dev
```
*The frontend should now be running on http://localhost:5173*

## 🤝 Contributing

Got ideas to make ExpenseIQ even better? I'm all ears! Feel free to fork the project, create a feature branch, and submit a Pull Request. Let's build something awesome together.

---

*Built with ❤️ and a lot of coffee.*
