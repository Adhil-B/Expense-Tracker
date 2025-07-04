# Expense Tracker & Group Expense Splitter

A modern, full-featured expense tracker and group expense splitter built with Next.js, React, Tailwind CSS, NextAuth, and Supabase. Track your personal expenses, split group costs, and visualize your financial activity with a beautiful, responsive UI.

---

## 🚀 Features

- **Personal Expense Tracking**: Add, edit, and delete expenses and income with categories, dates, and descriptions.
- **Group Expense Splitting**: Create groups, add participants, split shared expenses, and automatically calculate settlements (who owes whom).
- **Activity Timeline**: See a history of your recent actions (expenses, group changes, etc.).
- **Monthly & Category Overview**: Visualize your spending by month and by category with charts and summaries.
- **Income Tracking**: Log income and see net balances.
- **Currency Selection**: Choose your preferred currency (USD, INR, extensible).
- **Guest Mode**: Try the app instantly without signing up.
- **Demo Credentials**: Log in with demo credentials for a quick preview.
- **Responsive UI**: Works great on desktop and mobile, with a clean, modern design.
- **Reusable Components**: Modular UI components (Button, Modal, Card, SectionHeader, etc.).

---

## 🛠️ Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Supabase](https://supabase.com/) for backend/database
- LocalStorage for guest/demo mode

---

## 📦 Directory Structure

```
├── src/
│   ├── app/                # Main app pages (dashboard, expense-tracker, expense-splitter, login, API routes)
│   ├── components/         # Reusable UI components (Button, Modal, Card, etc.)
│   └── lib/                # Supabase client and data hooks
├── supabase/               # Supabase config, migrations, and local dev setup
├── public/                 # Static assets
├── package.json            # Project metadata and scripts
└── ...
```

---

## ⚡ Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root with:

```
NEXTAUTH_SECRET=your-random-secret
```

- For production, update `src/lib/supabase.js` with your own Supabase project URL and anon key.
- (Optional) Set up other environment variables as needed for Supabase or NextAuth providers.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Supabase Local Development (Optional)

- Install [Supabase CLI](https://supabase.com/docs/guides/cli)
- Run `supabase start` to launch the local database and API (see `supabase/config.toml` for ports and settings)
- Migrations and seed data are managed in the `supabase/` directory

---

## 🔐 Authentication

- **Demo Login:**
  - Email: `demo@example.com`
  - Password: `password123`
- **Sign Up:**
  - Use the sign-up form (handled by Supabase Auth)
- **Guest Mode:**
  - Click "Continue as Guest" on the login page for instant access (data stored in your browser)

---

## 🖥️ Usage

- **Dashboard:** View your total balance, expenses, income, and recent activity.
- **Add Expense/Income:** Use the dashboard or expense tracker page to log new entries.
- **Groups:** Create groups for trips, roommates, etc. Add shared expenses and see who owes whom.
- **Charts:** Visualize your spending by category and month.
- **Activity Timeline:** Track all your actions in one place.

---

## 🧩 Components

Reusable UI components are in `src/components/` (see [README](src/components/README.md)).

---

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests. Follow best practices and keep code modular and well-documented.

---

## 📄 License

[MIT](LICENSE) (or specify your license)

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Vercel](https://vercel.com/) (for easy deployment)

---

