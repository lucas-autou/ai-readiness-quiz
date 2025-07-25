'use client';

import { ArrowRight, Zap, Target, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';
import ClientLogos from '@/components/ClientLogos';
import TrustBadges from '@/components/TrustBadges';

export default function HomePage() {
  const { } = useTranslation();


  return (
    <div className="min-h-screen relative overflow-hidden aura-background">
      {/* Simple geometric decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Clean tree illustration - simplified */}
        <div className="absolute bottom-0 right-16 w-64 h-64 opacity-20">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <rect x="55" y="80" width="10" height="40" fill="var(--aura-vermelho-cinnabar)" />
            <circle cx="60" cy="50" r="30" fill="var(--aura-coral)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        
        {/* Hero Section Simplificado */}
        <section className="text-center mb-32 pt-16">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 aura-heading text-center">
              Descubra se sua empresa está{' '}
              <span className="aura-text-violet">pronta para a IA</span>
            </h1>
            
            <p className="text-xl md:text-2xl leading-relaxed mb-8 max-w-4xl mx-auto aura-body text-center">
              Uma avaliação personalizada que revela{' '}
              <span className="aura-text-cinnabar font-semibold">oportunidades reais</span>{' '}
              e cria um plano de ação específico para seu negócio crescer com inteligência artificial.
            </p>
            

            <div className="inline-block p-8 md:p-12 relative mb-8 aura-card">
              
              <Link href="/quiz" className="aura-button aura-button-primary text-xl px-12 py-4 group relative z-10 inline-flex items-center gap-3">
                Fazer Avaliação Gratuita
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <div className="text-center mt-8">
                <p className="text-base aura-text-secondary font-medium">
                  ✓ Gratuito ✓ 5 minutos ✓ Relatório personalizado
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 aura-heading">
              O que você vai descobrir
            </h2>
            <p className="text-xl max-w-3xl mx-auto aura-body">
              Insights personalizados que transformam{' '}
              <span className="aura-text-violet font-semibold">incerteza em estratégia</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {/* Card 1 - Clean design */}
            <div className="group p-8 relative aura-card" style={{ minHeight: '300px' }}>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-white mx-auto transition-transform duration-300" style={{ background: 'var(--aura-gradient-primary)' }}>
                  <Target className="w-10 h-10" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-6 aura-subheading">
                    Seu Nível de Prontidão
                  </h3>
                </div>
                
                <p className="text-lg leading-relaxed aura-body">
                  Em 5 minutos, entenda exatamente onde sua empresa está e{' '}
                  <span className="aura-text-cinnabar font-semibold">quais são os próximos passos</span>{' '}
                  mais importantes.
                </p>
              </div>
            </div>

            {/* Card 2 - Clean design */}
            <div className="group p-8 relative aura-card" style={{ minHeight: '300px' }}>
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-white mx-auto group-hover:scale-105 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, var(--aura-coral) 0%, var(--aura-coral-light) 100%)', boxShadow: '0 8px 24px rgba(255,168,80,0.2)' }}>
                  <Lightbulb className="w-10 h-10" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-6 aura-subheading">
                    Oportunidades Específicas
                  </h3>
                </div>
                
                <p className="text-lg leading-relaxed aura-body">
                  Descubra aplicações de IA que fazem sentido para{' '}
                  <span className="aura-text-coral font-semibold">seu tipo de negócio</span>,{' '}
                  com exemplos reais e impacto mensurável.
                </p>
              </div>
            </div>

            {/* Card 3 - Clean design */}
            <div className="group p-8 relative aura-card" style={{ minHeight: '300px' }}>
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 text-white mx-auto group-hover:scale-105 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, var(--aura-violet) 0%, var(--aura-violet-light) 100%)', boxShadow: 'var(--aura-shadow-violet-glow)' }}>
                  <Zap className="w-10 h-10" />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-6 aura-subheading">
                    Plano de Ação Prático
                  </h3>
                </div>
                
                <p className="text-lg leading-relaxed aura-body">
                  Um roadmap pronto com prioridades,{' '}
                  <span className="aura-text-violet font-semibold">recursos necessários</span>{' '}
                  e métricas para implementar IA gradualmente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Client Logos Section */}
        <ClientLogos />
        
        {/* Trust Badges */}
        <TrustBadges />

        {/* Final CTA - Mais Orgânico e Proeminente */}
        <section className="text-center mb-16">
          <div className="p-12 max-w-4xl mx-auto relative aura-card">
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 aura-heading text-center">
                Pronto para descobrir o potencial de IA da sua empresa?
              </h2>

              <div className="mb-8">
                <Link href="/quiz" className="aura-button aura-button-primary text-xl px-12 py-4 group relative inline-flex items-center gap-2">
                  Começar Avaliação
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
              
              <div className="text-center">
                <p className="text-base aura-text-secondary">
                  Sem compromisso • Resultado na hora
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
