# Sankalp Suman - AI-Powered QA Engineering Portfolio & CMS

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-1.52-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)

A modern, full-stack portfolio and dynamic content management system crafted for **Sankalp Suman**, showcasing expertise in **QA Automation, SDET, AI-driven Testing, and Full-Stack Engineering**.

Equipped with an **Interactive RAG-Powered AI Chatbot**, **Live QA Quality Dashboards**, **AI Test Case Playground**, **Real-Time CMS Admin Panel**, and **Instant Email Notifications**.

---

## 🌟 Key Features

### 🧠 AI & Intelligent Assistants
- **Interactive AI Assistant (`AIChatbot`)**: Powered by Google Gemini with custom RAG (Retrieval-Augmented Generation) knowledge retrieval, providing immediate answers about experience, skills, projects, and scheduling meetings. Includes realistic typing and thinking animations.
- **AI QA Playground**: Interactive developer workspace to test AI prompt engineering, test scenario generation, API assertion builders, and bug summary analyzers.
- **Dynamic AI Resume Generator**: Tailors resume summaries and highlights dynamically to match specific job descriptions and recruiter requirements with instant PDF download (`jspdf` + `html2canvas`).
- **AI Command Center**: Interactive quick-access dock for navigating key technical competencies and engineering achievements.

### 📊 Quality Engineering & Data Visualization
- **Live QA Metrics Dashboard**: Real-time interactive charts (via `recharts`) showing automation coverage, bug triage metrics, test pass rates, and CI/CD pipeline efficiency.
- **Impact Stories & Case Studies**: In-depth breakdowns of enterprise testing frameworks, performance optimizations, and defect reduction strategies.
- **Interactive Skills Matrix**: Categorized tech stack visualization with skill proficiency indicators and official technology badges.

### 🛠️ Comprehensive Content Management System (Admin CMS)
- **Secure Admin Portal (`/admin`)**: Real-time dashboard to manage and update all portfolio content directly without touching code.
- **Modular Editors**:
  - Hero, About Me & Metrics
  - Work Experience & Career Timeline
  - Projects & Case Studies
  - QA Metrics & Testing KPIs
  - Certifications & Achievements
  - Blog Posts (`/blog`) with Markdown support
  - What I'm Doing Now (`/now`)
  - AI Tools & Prompt Engineering Configurations
  - SEO Metadata & OpenGraph settings
  - Contact Inquiries & Meeting Requests management

### 🎨 Visual Craft & Performance
- **Modern Dark Aesthetic**: Clean, high-contrast dark palette with subtle cyan/blue accents, glassmorphic cards, and smooth gradient highlights.
- **Physics-Based Transitions**: Silky smooth component and page transitions powered by `motion` (Framer Motion) and `@studio-freight/lenis` smooth scroll.
- **Responsive Navigation**: Desktop navigation with dynamic scroll indicators and a resilient bottom-left floating quick-scroll portal button.
- **PWA & Offline Readiness**: Service worker caching and offline status detection with user feedback banners.
- **Multilingual Support**: Built-in translation engine and language switcher.

### 📬 Backend & Email Integration
- **Express.js API Server**: Bundled and optimized via `esbuild` for single-port full-stack execution.
- **Nodemailer SMTP System**: Automated email delivery with rich HTML templates for contact submissions and recruiter booking alerts.
- **Server-Side Rate Limiting & Cache**: `node-cache` integration to protect AI endpoints and maximize performance.

---

## 🏗️ Architecture & Tech Stack

```
├── api/                        # Backend Express server & API routes
│   ├── _ragService.ts          # Knowledge base indexing & context retrieval
│   ├── _server.ts              # Primary Express server & API handlers
│   └── lib/                    # Gemini client helpers & error boundaries
├── public/                     # Static assets, icons, manifest, favicon
├── src/
│   ├── components/
│   │   ├── admin/              # CMS admin panels & UI modules
│   │   ├── portfolio/          # Portfolio showcase components
│   │   │   ├── AIChatbot.tsx   # Gemini-powered RAG AI Chatbot
│   │   │   ├── AIPlayground.tsx# Interactive QA AI testing playground
│   │   │   ├── QADashboard.tsx # Live testing metrics & Recharts graphs
│   │   │   ├── Navbar.tsx      # Responsive header & quick-scroll portal
│   │   │   └── ...             # Experience, Projects, Timeline, Hero, etc.
│   │   ├── pwa/                # Service worker & offline banners
│   │   └── ui/                 # Reusable UI primitives
│   ├── context/                # Auth, Theme, and Translation contexts
│   ├── hooks/                  # Custom React hooks (useLanguage, etc.)
│   ├── pages/                  # Route views (Home, Blog, Admin, Now)
│   │   ├── admin/              # Detailed section editors for CMS
│   │   ├── PortfolioHome.tsx   # Main landing portfolio view
│   │   ├── BlogList.tsx        # Technical articles index
│   │   ├── BlogDetail.tsx      # Article reader with Markdown support
│   │   └── NowPage.tsx         # What I'm currently up to
│   ├── services/               # Firestore, Gemini API, and Auth services
│   ├── App.tsx                 # Main application shell & routing
│   └── index.css               # Global Tailwind CSS styles
```

### Core Technologies:
| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, ESBuild, TypeScript (`tsx`) |
| **AI / LLM** | Google Gemini API (`@google/genai`), Custom RAG Engine |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |
| **Utilities** | Nodemailer, React Markdown, Zod, React Hook Form, JSPSF, HTML2Canvas, Lenis Scroll |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**
- **Firebase Project**: Firestore database configured
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sankalp-suman-portfolio.git
cd sankalp-suman-portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
# Gemini API Key (Required for AI Chatbot & Playground)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL (Local dev server)
APP_URL=http://localhost:3000

# Cloudinary (Optional, for media asset uploads in CMS)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# SMTP Email Settings (Required for live contact form & recruiter alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 4. Run Development Server
```bash
npm run dev
```
The app will be running at **`http://localhost:3000`**.

---

## 📜 Available Scripts

- `npm run dev`: Starts the full-stack development server with Vite middleware on port 3000.
- `npm run build`: Compiles the React frontend into `dist/` and bundles the Express server into `dist/server.cjs` via `esbuild`.
- `npm run start`: Runs the compiled production server (`node dist/server.cjs`).
- `npm run lint`: Runs TypeScript validation (`tsc --noEmit`) to ensure type safety.
- `npm run clean`: Removes build output artifacts in `dist/`.

---

## 🔒 Security & Best Practices

- **Server-Side API Proxying**: The Gemini API key and SMTP credentials remain strictly server-side in `/api` routes and are never exposed to the client.
- **Input Sanitization**: Form inputs and contact fields are strictly validated via Zod and sanitized before transmission.
- **Rate-Limited Endpoints**: AI endpoints feature in-memory caching and request throttling to prevent quota abuse.

---

## 👨‍💻 Author

**Sankalp Suman**
- **LinkedIn**: [linkedin.com/in/sankalp-suman-qa](https://linkedin.com/in/sankalp-suman-qa)
- **Portfolio**: [Live Portfolio Demo](https://ais-dev-f6bmxsvqedm4r3t2gz5255-638313012041.asia-southeast1.run.app)
- **Role**: Senior Quality Assurance Automation Engineer & SDET

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to explore, customize, and adapt for your own portfolio.
