# Habit Tracker

A modern web application designed to help users establish, track, and maintain positive routines. Built with a cutting-edge React and Next.js stack, this project leverages Firebase for secure, real-time data management to deliver a seamless user experience.

## ✨ Key Features

* **📊 Visual Progress Tracking:** Beautiful and interactive data visualizations powered by `recharts` to keep users motivated and aware of their consistency.
* **🎉 Engaging User Experience:** Celebratory animations using `canvas-confetti` and smooth UI transitions powered by `motion` for rewarding habit completion.
* **📸 Shareable Milestones:** Seamlessly convert progress dashboards into shareable graphics using `html-to-image` so users can celebrate their wins.
* **⚡ Modern Frontend:** Built on Next.js 15 and React 19, styled with Tailwind CSS v4 for a highly responsive, accessible, and lightning-fast interface.
* **☁️ Real-time Backend:** Fully integrated with Firebase for secure authentication and real-time database syncing across devices.

## 🚀 Tech Stack

**Core:**
* [Next.js](https://nextjs.org/) (v15.4)
* [React](https://react.dev/) (v19.2)

**Styling & UI:**
* [Tailwind CSS](https://tailwindcss.com/) (v4.1) & PostCSS
* [Lucide React](https://lucide.dev/) (Icons)
* clsx & tailwind-merge (Utility class management)

**Backend & Data:**
* [Firebase](https://firebase.google.com/) (v12.11)
* [date-fns](https://date-fns.org/) (Date manipulation)
* `@hookform/resolvers` (Form validation)

## 📦 Getting Started

### Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v20 or higher recommended)
* npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase configuration keys (refer to `.env.example` if available):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # Add any additional Firebase variables here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Available Scripts

In the project directory, you can run:

* `npm run dev`: Runs the app in development mode.
* `npm run build`: Builds the app for production to the `.next` folder.
* `npm run start`: Starts the production server using the built application.
* `npm run lint`: Runs ESLint to catch and fix code style issues.
* `npm run clean`: Cleans the Next.js cache and build output.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project, please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
