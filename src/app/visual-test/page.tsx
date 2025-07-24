'use client';

import { ArrowRight, Zap, ExternalLink, Sparkles, Target, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';

export default function VisualTestPage() {
  const { } = useTranslation();

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
    <>
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${auraTheme.lightPink} 0%, ${auraTheme.lightBeige} 50%, ${auraTheme.lightGray} 100%)`,
          fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Elementos orgânicos de fundo */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Formas orgânicas */}
          <div 
            className="absolute top-20 right-10 w-64 h-64 opacity-20"
            style={{
              background: `radial-gradient(circle, ${auraTheme.coral}40 0%, transparent 70%)`,
              borderRadius: '60% 40% 60% 40%',
              transform: 'rotate(25deg)'
            }}
          />
          <div 
            className="absolute bottom-32 left-16 w-48 h-48 opacity-15"
            style={{
              background: `radial-gradient(circle, ${auraTheme.violet}30 0%, transparent 70%)`,
              borderRadius: '40% 60% 40% 60%',
              transform: 'rotate(-15deg)'
            }}
          />
          
          {/* Árvore estilizada */}
          <div className="absolute bottom-0 right-0 w-80 h-80 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                d="M100 180 Q95 160 90 140 Q85 120 95 100 Q105 80 120 70 Q140 60 160 70 Q180 80 170 100 Q160 120 140 130 Q120 140 110 160 Q105 170 100 180"
                fill={auraTheme.coral}
                opacity="0.3"
              />
              <circle cx="120" cy="80" r="25" fill={auraTheme.violet} opacity="0.3" />
              <circle cx="140" cy="100" r="20" fill={auraTheme.cinnabar} opacity="0.3" />
              <circle cx="110" cy="95" r="15" fill={auraTheme.coral} opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Header comparativo */}
        <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/40 px-6 py-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium" style={{color: auraTheme.cinnabar}}>
                ✨ Aura Landing - Teste Visual
              </h1>
              <span className="text-sm px-3 py-1 rounded-full bg-white/50" style={{color: auraTheme.mediumText}}>
                Identidade orgânica
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm flex items-center gap-1 px-3 py-1 rounded-full bg-white/50 hover:bg-white/70 transition-all" style={{color: auraTheme.mediumText}}>
                Ver original <ExternalLink className="w-4 h-4" />
              </Link>
              <LanguageSelector />
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16">
          
          {/* HERO SECTION */}
          <section className="text-center mb-32">
            <div className="max-w-4xl mx-auto">
              <h1 
                className="text-5xl md:text-7xl font-medium leading-tight mb-8"
                style={{ color: auraTheme.darkText, lineHeight: 1.1 }}
              >
                Descubra se sua empresa está{' '}
                <span style={{ color: auraTheme.violet }}>pronta para a IA</span>
              </h1>
              
              <p 
                className="text-xl md:text-2xl leading-relaxed mb-12 max-w-3xl mx-auto"
                style={{ color: auraTheme.mediumText, lineHeight: 1.6 }}
              >
                Uma avaliação personalizada que revela{' '}
                <span style={{ color: auraTheme.cinnabar, fontWeight: 500 }}>oportunidades reais</span>{' '}
                e cria um plano de ação específico para seu negócio crescer com inteligência artificial.
              </p>

              <div 
                className="inline-block p-8 md:p-10 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  borderRadius: '32px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 8px 25px rgba(236,78,34,0.06)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <button
                  className="inline-flex items-center gap-4 text-white font-medium text-xl px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                  style={{
                    background: `linear-gradient(135deg, ${auraTheme.cinnabar} 0%, ${auraTheme.coral} 100%)`,
                    borderRadius: '24px',
                    boxShadow: '0 12px 30px rgba(236,78,34,0.3)',
                    border: 'none'
                  }}
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Fazer Avaliação Gratuita
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-sm mt-4 opacity-70" style={{ color: auraTheme.mediumText }}>
                  ✓ Gratuito  ✓ 5 minutos  ✓ Relatório personalizado
                </p>
              </div>
            </div>
          </section>

          {/* INSIGHTS CARDS SECTION */}
          <section className="mb-32">
            <div className="text-center mb-16">
              <h2 
                className="text-4xl font-medium mb-6"
                style={{ color: auraTheme.darkText }}
              >
                O que você vai descobrir
              </h2>
              <p 
                className="text-xl max-w-2xl mx-auto"
                style={{ color: auraTheme.mediumText }}
              >
                Insights personalizados que transformam{' '}
                <span style={{ color: auraTheme.violet, fontWeight: 500 }}>incerteza em estratégia</span>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: <Target className="w-8 h-8" />,
                  iconBg: auraTheme.cinnabar,
                  title: 'Seu Nível de Prontidão',
                  subtitle: 'Score personalizado',
                  description: 'Entenda exatamente onde sua empresa está no espectro da transformação digital e quais são os próximos passos mais importantes.',
                  highlight: 'transformação digital'
                },
                {
                  icon: <Lightbulb className="w-8 h-8" />,
                  iconBg: auraTheme.coral,
                  title: 'Oportunidades Específicas',
                  subtitle: 'Para seu setor',
                  description: 'Descubra aplicações de IA que fazem sentido para seu tipo de negócio, com exemplos reais e impacto mensurável.',
                  highlight: 'impacto mensurável'
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  iconBg: auraTheme.violet,
                  title: 'Plano de Ação Prático',
                  subtitle: '90 dias para começar',
                  description: 'Um roadmap claro com prioridades, recursos necessários e métricas de sucesso para implementar IA gradualmente.',
                  highlight: 'implementar IA gradualmente'
                }
              ].map((card, index) => (
                <div
                  key={index}
                  className="group p-8 relative transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
                    borderRadius: '28px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.4)'
                  }}
                >
                  {/* Elemento decorativo */}
                  <div 
                    className="absolute top-6 right-6 w-16 h-16 opacity-20 rounded-full"
                    style={{ background: card.iconBg }}
                  />
                  
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white relative z-10"
                    style={{ background: card.iconBg }}
                  >
                    {card.icon}
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium opacity-70" style={{ color: card.iconBg }}>
                      {card.subtitle}
                    </p>
                    <h3 className="text-2xl font-medium mb-4" style={{ color: auraTheme.darkText }}>
                      {card.title}
                    </h3>
                  </div>
                  
                  <p className="text-base leading-relaxed" style={{ color: auraTheme.mediumText }}>
                    {card.description.split(card.highlight)[0]}
                    <span style={{ color: auraTheme.violet, fontWeight: 500 }}>
                      {card.highlight}
                    </span>
                    {card.description.split(card.highlight)[1]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FINAL CTA SECTION */}
          <section className="text-center">
            <div 
              className="max-w-3xl mx-auto p-12 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                borderRadius: '32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 8px 25px rgba(136,80,226,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              {/* Elemento decorativo */}
              <div 
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-30"
                style={{ background: `radial-gradient(circle, ${auraTheme.violet} 0%, transparent 70%)` }}
              />
              
              <h2 
                className="text-4xl font-medium mb-6"
                style={{ color: auraTheme.darkText }}
              >
                Pronto para descobrir suas{' '}
                <span style={{ color: auraTheme.cinnabar }}>oportunidades de IA</span>?
              </h2>
              
              <p 
                className="text-xl mb-8 leading-relaxed"
                style={{ color: auraTheme.mediumText }}
              >
                Junte-se a mais de 500 líderes que já transformaram{' '}
                <span style={{ color: auraTheme.violet, fontWeight: 500 }}>incerteza em vantagem competitiva</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  className="inline-flex items-center gap-3 text-white font-medium text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                  style={{
                    background: `linear-gradient(135deg, ${auraTheme.violet} 0%, ${auraTheme.cinnabar} 100%)`,
                    borderRadius: '24px',
                    boxShadow: '0 12px 30px rgba(136,80,226,0.3)',
                    border: 'none'
                  }}
                >
                  Começar Avaliação
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-sm opacity-70" style={{ color: auraTheme.mediumText }}>
                  Sem compromisso • Resultados em 24h
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}