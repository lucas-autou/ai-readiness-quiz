# AI Readiness Quiz - Lead Magnet

A responsive Next.js application that assesses enterprise executives' AI readiness and generates personalized reports as a B2B lead magnet.

## 🎯 Target Audience

- Non-technical business leaders (C-suite, VPs, directors)
- Companies with 500+ employees
- Leaders feeling pressure to implement AI but unsure how to proceed

## ✨ Features

- **Landing Page**: Compelling headline targeting AI anxiety/opportunity
- **Quiz Flow**: 8-10 business-focused questions (no technical jargon)
- **Email Capture**: Required before report generation
- **AI Report**: Personalized insights with actionable recommendations using Claude API
- **Multi-language**: English and Portuguese support
- **Lead Database**: Store responses for nurturing via Supabase

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Anthropic Claude API
- **Email**: Resend (optional)
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Anthropic API key
- Supabase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-readiness-quiz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx
```

5. Set up database tables:
   - Visit `/setup` in your browser
   - Or run the SQL from `supabase_setup.sql` in your Supabase dashboard

6. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Database Schema

```sql
-- Quiz Responses
CREATE TABLE quiz_responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    responses JSONB NOT NULL,
    score INTEGER NOT NULL,
    ai_report TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leads
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    job_title TEXT,
    score INTEGER NOT NULL,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `EMAIL_SERVICE_KEY` (optional)
3. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
npm start
```

## 🎨 Customization

- **Colors**: Update the aura theme in `src/styles/aura-theme.css`
- **Questions**: Modify `src/lib/questions.ts`
- **Report Templates**: Edit `src/app/api/submit-quiz/route.ts`
- **Languages**: Add translations in `src/lib/i18n/translations/`

## 📂 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── quiz/           # Quiz flow pages
│   │   └── results/        # Results display
│   ├── lib/                # Utilities and configurations
│   │   ├── i18n/           # Internationalization
│   │   └── database.ts     # Database utilities
│   └── styles/             # CSS files
├── scripts/                # Database setup scripts
├── vercel.json            # Vercel configuration
└── README.md
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Git Workflow

- `main` - Production ready code
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Production fixes

## 📊 Analytics & Monitoring

The application includes built-in analytics for:
- Quiz completion rates
- Email capture conversion
- Report generation success
- User engagement metrics

## 🔒 Security

- Environment variables for sensitive data
- Input validation on all forms
- Rate limiting on API endpoints
- Secure database queries with parameterization

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section in the wiki
- Review the deployment logs in Vercel dashboard
