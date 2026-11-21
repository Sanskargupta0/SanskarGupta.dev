# [Portfolio](https://sanskargupta.dev/) &middot; [![Author Sanskar Gupta](https://img.shields.io/badge/Author-Sanskar-%3C%3E)](https://www.linkedin.com/in/sanskarguptadev/)<br>
[![GitHub](https://img.shields.io/badge/GitHub-%3C%3E)](https://github.com/Sanskargupta0/Portfolio)  
[![Next.js](https://img.shields.io/badge/Next.js-%3C%3E)](https://nextjs.org/)  
[![React](https://img.shields.io/badge/React-%3C%3E)](https://react.dev/)  
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%3C%3E)](https://tailwindcss.com/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-%3C%3E)](https://www.typescriptlang.org/)

## 📝 Project Description

A modern, responsive personal portfolio website built with Next.js 14 that showcases projects, skills, and blog posts. This portfolio features a dark theme design, English-language content, GitHub contributions visualization, contact form integration, and a complete blog system with MDX support. The application includes view tracking, search functionality, and is optimized for SEO with dynamic metadata generation.

## ⚙️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, CSS Modules
- **Content**: MDX, Velite (Content Processing)
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: Not required (Public portfolio)
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics & Speed Insights
- **UI Components**: Radix UI, Lucide React
- **Language**: English
- **External APIs**: 
  - NoCode API (Google Sheets integration)
  - Web3Forms (Contact form)
  - GitHub Calendar API

## 🔋 Features

👉 **Modern Portfolio Design**: Clean, dark-themed responsive design that works seamlessly across desktop, tablet, and mobile devices with smooth animations powered by Framer Motion.

👉 **Project Showcase**: Interactive project gallery with detailed descriptions, technology stacks, live demo links, and GitHub repository links with cover images.

👉 **Skills Visualization**: Animated scrolling marquee displaying frontend and backend technologies with icons and color-coded categories.

👉 **GitHub Integration**: Real-time GitHub contributions calendar with custom styling and contribution activity visualization.

👉 **Blog System**: 
- Full-featured blog with MDX support
- English-language content
- Table of contents generation
- Syntax highlighting for code blocks
- SEO-optimized blog posts
- Tag-based categorization

👉 **Contact Integration**: 
- Contact form with Web3Forms integration
- Google Sheets data collection via NoCode API
- Form validation with React Hook Form
- Social media links integration

👉 **SEO Optimization**: 
- Dynamic metadata generation
- Open Graph tags
- Twitter Card support
- Structured data (JSON-LD)
- Sitemap generation
- Robot.txt configuration

👉 **View Tracking**: Database-powered view tracking system for blog posts and portfolio analytics.

👉 **Search Functionality**: Built-in search for blog posts and content discovery.

English is the supported language for the website and blog.

👉 **Performance Optimized**: 
- Image optimization with Next.js Image component
- Lazy loading for better performance
- Optimized bundle size
- Fast page transitions

## 🛠️ System Architecture

### Core Components

1. **Portfolio Structure**:
   - About section with personal introduction
   - Skills showcase with technology icons
   - Project gallery with filtering capabilities
   - Blog system with MDX content
   - Contact form with external integrations

2. **Content Management**:
   - MDX files for English blog posts
   - Velite for content processing and optimization
   - Dynamic routing for blog posts and projects
   - Automatic table of contents generation

3. **Data Flow**:
   - PostgreSQL database for view tracking
   - Contact form data sent to Google Sheets
   - GitHub API for contributions data
   - Static generation for optimal performance

## 🚀 Quick Start

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (version 18.x or higher)
- [pnpm](https://pnpm.io/) (recommended) or [npm](https://www.npmjs.com/)

### Cloning the Repository

```bash
git clone https://github.com/Sanskargupta0/Portfolio.git
cd Portfolio
```

### Installation

Install dependencies using pnpm (recommended):

```bash
pnpm install
```

or using npm:

```bash
npm install
```

### Environment Setup

1. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

2. Fill in all the required environment variables in your `.env.local` file. See the [Environment Variables](#environment-variables) section below for detailed instructions.

### Database Setup

1. **Set up PostgreSQL Database**:
   - Create a PostgreSQL database (recommended: [Neon](https://neon.tech/) or [Supabase](https://supabase.com/))
   - Copy the connection strings to your `.env.local` file

2. **Run Database Migrations**:

```bash
npx prisma db push
```

3. **Generate Prisma Client**:

```bash
npx prisma generate
```

### Running the Application

1. **Start the development server**:

```bash
pnpm dev
```

or

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

### Database
```env
POSTGRES_PRISMA_URL=your_postgresql_connection_string
POSTGRES_URL_NON_POOLING=your_postgresql_non_pooling_connection_string
```

### Google Sheets API
```env
# Google Sheets API for contact form integration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your_google_spreadsheet_id
```

### Application Settings
```env
NODE_ENV=development
```

### Google Sheets Setup

For detailed instructions on setting up Google Sheets API integration, see the [Google Sheets Setup Guide](./GOOGLE_SHEETS_SETUP.md).

Quick setup steps:
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account and download the JSON key
4. Create a Google Spreadsheet and share it with the service account
5. Extract credentials and add them to your `.env.local`
6. Run `pnpm setup:sheets` to initialize the spreadsheet headers

## 🎨 Customization Guide

To make this portfolio your own, follow these steps:

### 1. Personal Information (src/config.ts)

Update the main configuration file with your details:

```typescript
export const config = {
  appName: "Your Name",
  appDesignation: "Your Title/Role",
  appDescription: "Your description",
  domainName: "yourdomain.com",
  
  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://www.linkedin.com/in/yourusername/",
    instagram: "https://www.instagram.com/yourusername/",
    discord: "https://discordapp.com/users/yourusername",
    email: "your.email@example.com",
    phone: "your-phone-number",
    youtube: "https://www.youtube.com/@yourusername",
    twitter: "https://x.com/yourusername",
    buymeacoffee: "https://buymeacoffee.com/yourusername",
  }
}
```

### 2. About Section (src/components/about-section.tsx)

Replace the content with your personal story:
- Update the name and alias
- Replace the bio text with your background
- Update hackathon/project counts
- Change the profile image
- Update any links to your achievements

### 3. Projects (src/components/project/_project-mock.ts)

Replace all project data with your own:
- Project titles and descriptions
- Technology stacks
- GitHub repository URLs
- Live demo URLs
- Project cover images

### 4. Skills (src/constants/stack.tsx)

Customize the technologies displayed:
- Add/remove technologies from `FRONTEND_STACKS` and `BACKEND_STACKS`
- Update the tech stack icons and colors
- Organize by your expertise level

### 5. GitHub Username (src/components/github-contributions.tsx)

```tsx
<GitHubCalendar
  username="your-github-username" // Update this
  // ...
/>
```

### 6. Blog Content (src/content/posts/)

- Replace all existing blog posts with your content
- Update author information in locale files
- Add your own cover images
- Update any personal references throughout

### 7. SEO and Metadata (src/lib/seo.tsx)

Update the schema and metadata:
- Replace name and social handles
- Update Twitter creator handle
- Change domain references
- Update the person schema data

### 8. Redirects (next.config.mjs)

Update all redirect destinations:
- Resume link
- Social media profiles
- Support/donation links

### 9. Images and Assets

Replace the following images:
- `src/assets/images/live-the-code.webp` → Your photo
- `public/icon.png` → Your favicon
- `public/apple-icon.png` → Apple touch icon
- All project cover images
- Blog post images

### 10. Contact Form

Update the Web3Forms access key in `src/components/contact-us.tsx`:

```typescript
access_key: "your_web3forms_access_key"
```

### 11. External Service Setup

#### NoCode API (Google Sheets)
1. Sign up at [NoCode API](https://nocodeapi.com/)
2. Create a Google Sheets integration
3. Get your API key and sheet tab ID
4. Update the endpoint URL in `src/app/api/contact/route.ts`

#### Web3Forms
1. Sign up at [Web3Forms](https://web3forms.com/)
2. Create a new form
3. Get your access key
4. Update in contact form component

### 12. Locale Files

Update author information in:
- `src/locales/en/blog.json`

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Content development (watch mode)
pnpm dev:content

# Build content
pnpm build:content

# Format code
pnpm format

# Database operations
npx prisma studio          # Open database studio
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client
```

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── (main)/              # Main layout group
│   │   │   ├── blog/            # Blog pages
│   │   │   ├── projects/        # Projects showcase
│   │   │   └── tags/            # Tag pages
│   │   ├── api/                 # API routes
│   │   │   ├── contact/         # Contact form handler
│   │   │   └── views/           # View tracking
│   │   └── feed.xml/            # RSS feed generation
│   ├── components/              # Reusable components
│   │   ├── layout/              # Layout components
│   │   ├── mdx/                 # MDX components
│   │   ├── post/                # Blog post components
│   │   ├── project/             # Project components
│   │   └── ui/                  # UI components
│   ├── content/                 # Blog content (MDX)
│   │   └── posts/               # English blog posts
│   ├── lib/                     # Utility functions
│   ├── constants/               # Application constants
│   ├── locales/                 # English interface text
│   ├── styles/                  # Global styles
│   └── types/                   # TypeScript types
├── public/                      # Static assets
├── prisma/                      # Database schema
└── velite.config.ts            # Content processing config
```

## 🎯 Content Management

### Adding Blog Posts

1. Create a new MDX file in `src/content/posts/en/`
2. Follow the frontmatter structure:

```mdx
---
title: "Your Post Title"
description: "Post description"
tags: ["tag1", "tag2"]
date: 2024-01-01
published: true
cover: "./images/cover/your-image.jpg"
---

Your content here...
```

3. Run `pnpm dev:content` to process the content

### Adding Projects

1. Update `src/components/project/_project-mock.ts`
2. Add project cover images to `src/assets/images/cover/`
3. Include all required fields (title, description, stacks, etc.)

### 📸 Screenshots

#### Home Page
![Home Page](/screenshots/home-page.png)

#### Project Page
![Dashboard](/screenshots/project-page.png)

#### Blog Page
![Marketplace](/screenshots/blog-page.png)

#### Light Mode
![Upgrade Page](/screenshots/light-mode.png)


## 🚦 Troubleshooting

### Common Issues

1. **Content not updating**: Run `pnpm build:content` to rebuild
2. **Database connection errors**: Check PostgreSQL connection strings
3. **Contact form not working**: Verify Web3Forms and NoCode API keys
4. **Images not loading**: Ensure images are in the correct directory
5. **GitHub contributions not showing**: Check username in component

### Performance Tips

- Optimize images before adding them
- Use WebP format for better compression
- Keep blog post sizes reasonable
- Monitor bundle size with build analysis

## 🔒 Security Considerations

- Environment variables are properly configured
- API routes include input validation
- External form submissions are handled securely
- No sensitive data exposed in client-side code

## 📊 Analytics

The portfolio includes:
- Vercel Analytics for performance monitoring
- View tracking for blog posts
- Speed Insights for Core Web Vitals

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Deploy to Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by [Sanskar Gupta](https://www.linkedin.com/in/sanskarguptadev/)


## Local development

Run `npm run dev` to start Next.js with one Velite content watcher. Do not run
`dev:content` alongside it; Next.js already starts the watcher. Stop the development
server before building or starting another server in the same checkout, since
they share `.next` output.

Copy `.env.example` to `.env.local` and supply development service credentials.
Without the PostgreSQL URLs, local view counts and Spotify history explicitly
show unavailable; no fake data is returned or persisted. Both URLs are required
for these features: `POSTGRES_PRISMA_URL` for views and
`POSTGRES_URL_NON_POOLING` for listening history. Apply the existing Prisma
migrations to your development database before testing persistence.

Google Sheets credentials are required when submitting the contact form.
Malformed configured environment values fail validation rather than bypass it.
Set `PRISMA_LOG_QUERIES=true` only when SQL tracing is needed. Database errors
remain logged regardless of that setting.


## Search and agent discovery

See [agent SEO documentation](docs/agent-seo.md) for crawler resources, shared
content sources, validation commands, and optional scanner/account setup.
