# Mainline CV - AI-Powered Resume Builder

A modern, full-featured resume builder application powered by AI, built with Next.js 15, Tailwind CSS 4, and shadcn/ui components.

![Mainline CV](./public/og-image.jpg)

## 🚀 Features

### Resume Builder

- **AI-Powered Suggestions** - Get intelligent content recommendations using AI
- **Multiple Templates** - Choose from various professional resume designs
- **Live Preview** - See your changes in real-time as you edit
- **Section Management** - Add, remove, and reorder resume sections
- **PDF Export** - Download your polished resume as a PDF

### ATS Optimization

- **ATS Score Analysis** - Get your resume scored against Applicant Tracking Systems
- **Keyword Optimization** - Improve your resume's keyword match rate
- **Actionable Feedback** - Receive specific suggestions to improve your score
- **One-Click Fix** - Navigate directly to the resume builder with parsed data

### User Experience

- **Modern UI** - Beautiful, responsive interface with dark/light mode
- **Authentication** - Secure login and signup functionality
- **Dashboard** - Manage all your resumes in one place
- **Mobile Responsive** - Works seamlessly on all devices

## 🛠️ Tech Stack

### Core

- **Next.js 15** - App Router with Turbopack
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling

### UI Components

- **shadcn/ui** - Beautifully designed components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Motion** (Framer Motion) - Smooth animations

### Forms & Validation

- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **next-safe-action** - Type-safe server actions

### Theming

- **next-themes** - Dark/light mode support
- **tweakcn** - Theme customization

## 📁 Project Structure

```
newclient/
├── public/              # Static assets
├── fonts/               # Custom fonts (DM Sans)
├── src/
│   ├── actions/         # Server actions
│   ├── app/             # Next.js App Router pages
│   │   ├── about/       # About page
│   │   ├── ats-score/   # ATS score analyzer
│   │   ├── contact/     # Contact page
│   │   ├── dashboard/   # User dashboard
│   │   ├── faq/         # FAQ page
│   │   ├── login/       # Login page
│   │   ├── pricing/     # Pricing page
│   │   ├── privacy/     # Privacy policy
│   │   ├── resume-builder/ # Resume builder
│   │   └── signup/      # Signup page
│   ├── components/      # React components
│   │   ├── blocks/      # Page sections/blocks
│   │   └── ui/          # UI components (shadcn/ui)
│   ├── lib/             # Utilities & contexts
│   └── styles/          # Global styles
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd newclient
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Visit [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Command          | Description                             |
| ---------------- | --------------------------------------- |
| `npm run dev`    | Start development server with Turbopack |
| `npm run build`  | Build for production                    |
| `npm run start`  | Start production server                 |
| `npm run lint`   | Run ESLint and fix issues               |
| `npm run format` | Format code with Prettier               |

## 🎨 Theming

The app supports dark and light modes using `next-themes`. The theme can be customized using:

- **CSS Variables** - Defined in `src/styles/globals.css`
- **tweakcn** - Live theme customization (integrated via script)

### Custom Fonts

The application uses:

- **DM Sans** - Primary font family
- **Inter** - Secondary font family

## 🔗 Backend Integration

This frontend connects to a backend API for:

- User authentication
- Resume data persistence
- AI-powered content generation
- ATS score analysis

Configure the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📄 Pages

| Page           | Route             | Description                                 |
| -------------- | ----------------- | ------------------------------------------- |
| Home           | `/`               | Landing page with hero, features, pricing   |
| Resume Builder | `/resume-builder` | Full resume editing experience              |
| ATS Score      | `/ats-score`      | Upload and analyze resume ATS compatibility |
| Dashboard      | `/dashboard`      | Manage saved resumes                        |
| Login          | `/login`          | User authentication                         |
| Signup         | `/signup`         | New user registration                       |
| Pricing        | `/pricing`        | Subscription plans                          |
| About          | `/about`          | Company information                         |
| FAQ            | `/faq`            | Frequently asked questions                  |
| Contact        | `/contact`        | Contact form                                |
| Privacy        | `/privacy`        | Privacy policy                              |

## 🚀 Deployment

The app is optimized for deployment on:

- **Vercel** (Recommended)
- **Netlify**
- **Self-hosted** via Node.js

### Deploy to Vercel

```bash
npm run build
vercel deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Mainline CV** - Build your perfect resume with AI 🚀
