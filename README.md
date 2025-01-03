# Jay Patrick Cano Website

A minimal, interactive portfolio website built with Next.js 15, TypeScript, and Tailwind CSS. Features a unique terminal interface, particle background, and smooth animations.

![Portfolio Preview](./public/images/portfolio.jpg)

## ✨ Features

- 🌓 Dark/Light mode support
- 💻 Interactive terminal interface
- 🎯 Particle background animation
- 📱 Fully responsive design
- ⚡ Server-side rendering
- 🎨 Smooth animations and transitions
- 🔍 SEO optimized
- 📊 Real-time GitHub activity feed
- ⌨️ Keyboard navigation support
- 🎭 Custom loading animations
- 🔧 Modular component architecture

## 🛠️ Technologies

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide Icons** - Beautiful icons
- **React Scroll** - Smooth scrolling
- **next-themes** - Theme management

### UI Components
- **Radix UI** - Accessible UI primitives
- **Tailwind Merge** - Tailwind class merging
- **clsx** - Conditional class names

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Bun** - Fast JavaScript runtime and package manager

## 📦 Project Structure

\`\`\`
x3ef8@ubuntu:~/Desktop/0x3ef8.github.io-main$ tree -I node_modules
.
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── files
│   ├── humans.txt
│   ├── images
│   │   ├── hirehub.jpg
│   │   ├── nero.jpg
│   │   ├── project.png
│   │   ├── project2.jpg
│   │   ├── project3.jpg
│   │   └── project4.jpg
│   ├── robots.txt
│   ├── site.webmanifest
│   └── sitemap.xml
├── src
│   ├── app
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── background
│   │   │   ├── github-activity.tsx
│   │   │   └── particle-background.tsx
│   │   ├── interactive-terminal
│   │   │   └── terminal.tsx
│   │   ├── layout
│   │   │   ├── footer.tsx
│   │   │   └── nav.tsx
│   │   ├── loading
│   │   │   └── loading.tsx
│   │   ├── sections
│   │   │   ├── experience-timeline.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── projects.tsx
│   │   │   └── skills.tsx
│   │   ├── theme
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   └── ui
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── select.tsx
│   ├── config
│   │   ├── content.ts
│   │   └── terminal-content.ts
│   ├── hooks
│   │   ├── useDocumentTitle.ts
│   │   └── useTypewriter.ts
│   ├── lib
│   │   └── utils.ts
│   └── styles
│       ├── custom.css
│       └── globals.css
├── tailwind.config.js
└── tsconfig.json
\`\`\`

## 🚀 Getting Started

1. Clone the repository:
\`\`\`bash
git clone https://github.com/0x3EF8/0x3ef8.github.io.git
cd modern-portfolio
\`\`\`

2. Install dependencies:
\`\`\`bash
bun install
\`\`\`

3. Start the development server:
\`\`\`bash
bun dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

The portfolio can be customized by modifying the following files:

- \`config/content.ts\` - Main content configuration
- \`config/terminal-content.ts\` - Terminal commands and responses
- \`styles/globals.css\` - Global styles and theme variables

## 🎨 Customization

### Theme

The theme can be customized by modifying the CSS variables in \`styles/globals.css\`. The portfolio uses a CSS variable-based theming system that supports both light and dark modes.

### Content

Update the content in \`config/content.ts\` to personalize:
- Hero section
- Skills
- Experience timeline
- Projects
- Navigation
- Footer content
- GitHub activity settings

### Terminal

The interactive terminal can be customized by modifying \`config/terminal-content.ts\`:
- Custom commands
- ASCII art
- Welcome message
- Command responses

## 📱 Progressive Web App

This portfolio is PWA-ready with:
- Offline support
- App manifest
- Service worker
- Installable on mobile devices

## 🔍 SEO

The portfolio includes:
- Dynamic metadata
- Structured data
- Open Graph tags
- Twitter cards
- Sitemap
- Robots.txt

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- GitHub: [@0x3EF8](https://github.com/0x3EF8)
- Email: 0x3ef8@gmail.com

## 💫 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

---

Made with ❤️ by [Jay Patrick Cano](https://github.com/0x3EF8)
\`\`\`

