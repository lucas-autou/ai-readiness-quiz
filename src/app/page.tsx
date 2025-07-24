'use client';

import { ArrowRight, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-4xl mx-auto border border-white/20">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
              {t('home.heroTitle')}
            </h2>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              {t('home.heroDescription')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <TrendingUp className="w-8 h-8 text-blue-400 mb-2 mx-auto" />
                <p className="text-blue-100 text-sm">{t('home.stats.revenue')}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Users className="w-8 h-8 text-blue-400 mb-2 mx-auto" />
                <p className="text-blue-100 text-sm">{t('home.stats.advantage')}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <Zap className="w-8 h-8 text-blue-400 mb-2 mx-auto" />
                <p className="text-blue-100 text-sm">{t('home.stats.automation')}</p>
              </div>
            </div>

            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-xl"
            >
              {t('home.ctaButton')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t('home.benefitsTitle')}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">{t('home.benefits.score.title')}</h4>
              <p className="text-blue-100">
                {t('home.benefits.score.description')}
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">{t('home.benefits.actionPlan.title')}</h4>
              <p className="text-blue-100">
                {t('home.benefits.actionPlan.description')}
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">{t('home.benefits.quickWins.title')}</h4>
              <p className="text-blue-100">
                {t('home.benefits.quickWins.description')}
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">{t('home.benefits.riskAssessment.title')}</h4>
              <p className="text-blue-100">
                {t('home.benefits.riskAssessment.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto border border-white/20">
            <p className="text-lg text-white mb-4 italic">
              &quot;{t('home.testimonial.quote')}&quot;
            </p>
            <p className="text-blue-300 font-semibold">- {t('home.testimonial.author')}</p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t('home.finalCta.title')}
            </h3>
            <p className="text-blue-100 mb-6">
              {t('home.finalCta.description')}
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-all duration-200 hover:scale-105 shadow-xl"
            >
              {t('home.finalCta.button')}
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-sm text-blue-200 mt-3">{t('common.free')} • {t('common.takesMinutes')} • {t('common.noCreditCard')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
