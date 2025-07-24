'use client';

import { ArrowRight, CheckCircle, TrendingUp, Users, Zap, Sparkles, Target, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useTranslation();

  const auraTheme = {
    cinnabar: '#EC4E22',
    coral: '#FFA850', 
    violet: '#8850E2',
    lightPink: '#FDF2F8',
    lightBeige: '#FEF7ED',
    lightGray: '#F9FAFB',
    darkText: '#1F2937',
    mediumText: '#6B7280'
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${auraTheme.lightPink} 0%, ${auraTheme.lightBeige} 50%, ${auraTheme.lightGray} 100%)`,
        fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Elementos orgânicos mais complexos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Árvore orgânica principal */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Tronco principal */}
            <path
              d="M150 280 Q145 250 140 220 Q135 190 145 160 Q155 130 175 110 Q200 90 230 110 Q260 130 250 160 Q240 190 220 210 Q200 230 185 250 Q170 270 150 280"
              fill={`url(#treeGradient1)`}
              className="animate-pulse"
            />
            {/* Galhos orgânicos */}
            <circle cx="185" cy="140" r="35" fill={`url(#treeGradient2)`} className="animate-pulse" style={{animationDelay: '0.5s'}} />
            <circle cx="215" cy="170" r="28" fill={`url(#treeGradient3)`} className="animate-pulse" style={{animationDelay: '1s'}} />
            <circle cx="155" cy="155" r="22" fill={`url(#treeGradient1)`} className="animate-pulse" style={{animationDelay: '1.5s'}} />
            <circle cx="195" cy="195" r="18" fill={`url(#treeGradient2)`} className="animate-pulse" style={{animationDelay: '2s'}} />
            
            <defs>
              <radialGradient id="treeGradient1">
                <stop offset="0%" stopColor={auraTheme.coral} stopOpacity="0.6" />
                <stop offset="100%" stopColor={auraTheme.coral} stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="treeGradient2">
                <stop offset="0%" stopColor={auraTheme.violet} stopOpacity="0.5" />
                <stop offset="100%" stopColor={auraTheme.violet} stopOpacity="0.1" />
              </radialGradient>
              <radialGradient id="treeGradient3">
                <stop offset="0%" stopColor={auraTheme.cinnabar} stopOpacity="0.4" />
                <stop offset="100%" stopColor={auraTheme.cinnabar} stopOpacity="0.1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Formas orgânicas flutuantes */}
        <div 
          className="absolute top-32 left-20 w-72 h-72 opacity-12 animate-pulse"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 30% 70%, ${auraTheme.coral}20 0%, transparent 70%)`,
            borderRadius: '73% 27% 64% 36% / 42% 68% 32% 58%',
            transform: 'rotate(15deg)',
            animationDuration: '4s'
          }}
        />
        
        <div 
          className="absolute top-16 right-32 w-48 h-64 opacity-8 animate-pulse"
          style={{
            background: `radial-gradient(ellipse 50% 60% at 60% 30%, ${auraTheme.violet}15 0%, transparent 80%)`,
            borderRadius: '45% 55% 72% 28% / 63% 44% 56% 37%',
            transform: 'rotate(-25deg)',
            animationDuration: '6s',
            animationDelay: '1s'
          }}
        />

        <div 
          className="absolute bottom-40 left-10 w-56 h-44 opacity-10 animate-pulse"
          style={{
            background: `radial-gradient(ellipse 70% 30% at 40% 60%, ${auraTheme.cinnabar}18 0%, transparent 75%)`,
            borderRadius: '68% 32% 35% 65% / 57% 43% 57% 43%',
            transform: 'rotate(35deg)',
            animationDuration: '5s',
            animationDelay: '2s'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <header className="text-center mb-16">
          <h1 
            className="text-5xl md:text-7xl font-medium leading-tight mb-6"
            style={{ color: auraTheme.darkText, lineHeight: 1.1 }}
          >
            {t('home.title')}
          </h1>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: auraTheme.mediumText, lineHeight: 1.6 }}
          >
            {t('home.subtitle')}
          </p>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div 
            className="p-8 md:p-12 max-w-4xl mx-auto relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              borderRadius: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 25px rgba(236,78,34,0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <h2 
              className="text-3xl md:text-4xl font-medium mb-6"
              style={{ color: auraTheme.darkText }}
            >
              {t('home.heroTitle')}
            </h2>
            <p 
              className="text-lg mb-8 leading-relaxed"
              style={{ color: auraTheme.mediumText }}
            >
              {t('home.heroDescription')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div 
                className="rounded-lg p-4 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}
              >
                <TrendingUp className="w-8 h-8 mb-2 mx-auto" style={{ color: auraTheme.cinnabar }} />
                <p className="text-sm" style={{ color: auraTheme.mediumText }}>{t('home.stats.revenue')}</p>
              </div>
              <div 
                className="rounded-lg p-4 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}
              >
                <Users className="w-8 h-8 mb-2 mx-auto" style={{ color: auraTheme.coral }} />
                <p className="text-sm" style={{ color: auraTheme.mediumText }}>{t('home.stats.advantage')}</p>
              </div>
              <div 
                className="rounded-lg p-4 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}
              >
                <Zap className="w-8 h-8 mb-2 mx-auto" style={{ color: auraTheme.violet }} />
                <p className="text-sm" style={{ color: auraTheme.mediumText }}>{t('home.stats.automation')}</p>
              </div>
            </div>

            <Link
              href="/quiz"
              className="inline-flex items-center gap-3 text-white font-medium text-xl px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              style={{
                background: `linear-gradient(135deg, ${auraTheme.cinnabar} 0%, ${auraTheme.coral} 100%)`,
                borderRadius: '24px',
                boxShadow: '0 12px 30px rgba(236,78,34,0.3)',
                border: 'none'
              }}
            >
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              {t('home.ctaButton')}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h3 
              className="text-4xl font-medium mb-6"
              style={{ color: auraTheme.darkText }}
            >
              {t('home.benefitsTitle')}
            </h3>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: auraTheme.mediumText }}
            >
              Insights personalizados que transformam{' '}
              <span style={{ color: auraTheme.violet, fontWeight: 500 }}>incerteza em estratégia</span>
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div 
              className="group p-8 relative transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: '28px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <div 
                className="absolute top-6 right-6 w-16 h-16 opacity-20 rounded-full"
                style={{ background: auraTheme.cinnabar }}
              />
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white relative z-10"
                style={{ background: auraTheme.cinnabar }}
              >
                <Target className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-medium mb-4" style={{ color: auraTheme.darkText }}>
                {t('home.benefits.score.title')}
              </h4>
              <p className="text-base leading-relaxed" style={{ color: auraTheme.mediumText }}>
                {t('home.benefits.score.description')}
              </p>
            </div>
            
            <div 
              className="group p-8 relative transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: '28px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <div 
                className="absolute top-6 right-6 w-16 h-16 opacity-20 rounded-full"
                style={{ background: auraTheme.coral }}
              />
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white relative z-10"
                style={{ background: auraTheme.coral }}
              >
                <Lightbulb className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-medium mb-4" style={{ color: auraTheme.darkText }}>
                {t('home.benefits.actionPlan.title')}
              </h4>
              <p className="text-base leading-relaxed" style={{ color: auraTheme.mediumText }}>
                {t('home.benefits.actionPlan.description')}
              </p>
            </div>
            
            <div 
              className="group p-8 relative transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: '28px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <div 
                className="absolute top-6 right-6 w-16 h-16 opacity-20 rounded-full"
                style={{ background: auraTheme.violet }}
              />
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white relative z-10"
                style={{ background: auraTheme.violet }}
              >
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-medium mb-4" style={{ color: auraTheme.darkText }}>
                {t('home.benefits.quickWins.title')}
              </h4>
              <p className="text-base leading-relaxed" style={{ color: auraTheme.mediumText }}>
                {t('home.benefits.quickWins.description')}
              </p>
            </div>
            
            <div 
              className="group p-8 relative transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: '28px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >
              <div 
                className="absolute top-6 right-6 w-16 h-16 opacity-20 rounded-full"
                style={{ background: auraTheme.cinnabar }}
              />
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white relative z-10"
                style={{ background: auraTheme.cinnabar }}
              >
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-medium mb-4" style={{ color: auraTheme.darkText }}>
                {t('home.benefits.riskAssessment.title')}
              </h4>
              <p className="text-base leading-relaxed" style={{ color: auraTheme.mediumText }}>
                {t('home.benefits.riskAssessment.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="text-center mb-16">
          <div 
            className="p-8 max-w-3xl mx-auto relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              borderRadius: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 25px rgba(136,80,226,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <div 
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30"
              style={{ background: `radial-gradient(circle, ${auraTheme.violet} 0%, transparent 70%)` }}
            />
            <p 
              className="text-lg mb-4 italic leading-relaxed"
              style={{ color: auraTheme.darkText }}
            >
              &quot;{t('home.testimonial.quote')}&quot;
            </p>
            <p 
              className="font-semibold"
              style={{ color: auraTheme.cinnabar }}
            >
              - {t('home.testimonial.author')}
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div 
            className="p-12 max-w-3xl mx-auto relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              borderRadius: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 8px 25px rgba(136,80,226,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <div 
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30"
              style={{ background: `radial-gradient(circle, ${auraTheme.violet} 0%, transparent 70%)` }}
            />
            
            <h3 
              className="text-4xl font-medium mb-6"
              style={{ color: auraTheme.darkText }}
            >
              {t('home.finalCta.title')}
            </h3>
            <p 
              className="text-xl mb-8 leading-relaxed"
              style={{ color: auraTheme.mediumText }}
            >
              {t('home.finalCta.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-3 text-white font-medium text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                style={{
                  background: `linear-gradient(135deg, ${auraTheme.violet} 0%, ${auraTheme.cinnabar} 100%)`,
                  borderRadius: '24px',
                  boxShadow: '0 12px 30px rgba(136,80,226,0.3)',
                  border: 'none'
                }}
              >
                {t('home.finalCta.button')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="text-sm opacity-70" style={{ color: auraTheme.mediumText }}>
                {t('common.free')} • {t('common.takesMinutes')} • {t('common.noCreditCard')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
