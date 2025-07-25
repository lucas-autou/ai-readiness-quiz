'use client';

import { useState } from 'react';
import { CheckCircle, Target, TrendingUp, Lightbulb, Clock } from 'lucide-react';

const sampleReportData = {
  "executive_summary": "Como VP de Marketing na TechCorp, sua pontuação de 75/100 demonstra uma sólida base para liderar a transformação de IA no departamento. Com sua experiência em campanhas digitais e gestão de equipe de 12 pessoas, você está perfeitamente posicionado para implementar ferramentas de IA que podem aumentar a eficiência das campanhas em 40% e reduzir custos operacionais em $280K anuais. Esta iniciativa não apenas resolverá os gargalos atuais na análise de dados e personalização de conteúdo, mas também estabelecerá você como o pioneiro em inovação na TechCorp. Ao liderar esta transformação, você se posicionará para uma promoção para Chief Marketing Officer, enquanto entrega resultados mensuráveis que impressionarão a diretoria. O momento é ideal, considerando que seus concorrentes ainda estão explorando estas tecnologias, dando à TechCorp uma vantagem competitiva significativa de 12-18 meses.",
  
  "department_challenges": [
    "Análise manual de dados de campanha consome 15 horas semanais da equipe, limitando tempo para estratégia criativa e planejamento",
    "Personalização de conteúdo para diferentes segmentos de cliente requer processo manual propenso a erros e inconsistências",
    "Relatórios de performance são gerados manualmente, atrasando tomadas de decisão críticas em 2-3 dias",
    "Falta de previsibilidade nas campanhas resulta em desperdício de 25% do orçamento publicitário mensal",
    "Pressão da diretoria por ROI mais claro e métricas de atribuição mais precisas para justificar investimentos em marketing"
  ],
  
  "career_impact": {
    "personal_productivity": "Implementação de IA para análise de dados liberará 12 horas semanais do seu tempo, permitindo foco em estratégia de alto nível e relacionamento com stakeholders. Dashboards automatizados reduzirão reuniões de status em 60%, criando mais tempo para iniciativas inovadoras que demonstram liderança visionária.",
    "team_performance": "Sua equipe de marketing experimentará aumento de 35% na produtividade através de automação de tarefas repetitivas. Ferramentas de IA para criação de conteúdo permitirão que o time produza 3x mais variações de campanhas, enquanto análise preditiva melhorará taxa de conversão em 28%.",
    "leadership_recognition": "Liderar a primeira implementação bem-sucedida de IA na TechCorp estabelecerá você como o inovador interno. Executivos começarão a consultar você sobre tecnologia, posicionando-o naturalmente para promoção a Chief Marketing Officer quando a posição abrir em 2025.",
    "professional_growth": "Dominar IA em marketing o tornará um dos profissionais mais valiosos da empresa. Habilidades em machine learning, automação de marketing e análise preditiva são altamente transferíveis, aumentando seu valor de mercado em 45-60% segundo dados da indústria."
  },
  
  "quick_wins": {
    "month_1_actions": [
      { 
        "action": "Implementar ChatGPT Enterprise para criação de copy de campanhas e automação de respostas em redes sociais", 
        "impact": "Redução de 8 horas semanais em criação de conteúdo, permitindo foco em estratégia. ROI imediato de $15K mensais em produtividade." 
      },
      { 
        "action": "Configurar Google Analytics Intelligence e Microsoft Power BI com conectores de IA para dashboards automáticos", 
        "impact": "Relatórios em tempo real eliminarão 6 horas semanais de trabalho manual, melhorando velocidade de decisão em 70%." 
      }
    ],
    "quarter_1_goals": [
      { 
        "goal": "Lançar programa piloto de personalização com IA em 3 campanhas principais, medindo aumento de conversão", 
        "outcome": "Demonstrar 25-30% melhoria em performance, criando case study interno que sustenta pedido de orçamento para expansão" 
      },
      { 
        "goal": "Treinar equipe em ferramentas de IA e estabelecer processo padronizado para adoção departamental", 
        "outcome": "Reconhecimento como líder em change management, posicionando para projetos cross-funcionais de maior visibilidade" 
      }
    ]
  },
  
  "implementation_roadmap": [
    {
      "phase": "Avaliação Estratégica e Projeto Piloto",
      "duration": "6 semanas",
      "description": "Como VP de Marketing, você liderará auditoria completa dos processos atuais de marketing, identificando oportunidades de IA de maior impacto. Implementará ferramentas de IA para criação de conteúdo e análise de dados em 2-3 campanhas piloto, estabelecendo métricas claras de sucesso e ROI.",
      "career_benefit": "Estabelece você como líder visionário capaz de identificar e implementar soluções inovadoras, demonstrando competências executivas para a diretoria"
    },
    {
      "phase": "Expansão Departamental e Otimização", 
      "duration": "10 semanas",
      "description": "Expandir implementação de IA para todas as campanhas ativas, treinar equipe de 12 pessoas em novas ferramentas, e estabelecer processos padronizados. Implementar automação completa de relatórios e começar análise preditiva para budget allocation.",
      "career_benefit": "Demonstra habilidades de change management e liderança de equipe, com resultados mensuráveis que impressionam C-level executives"
    },
    {
      "phase": "Liderança Organizacional em IA",
      "duration": "4 meses", 
      "description": "Tornar-se consultor interno de IA, ajudando outros departamentos (Vendas, Customer Success) a implementar soluções similares. Apresentar resultados para board, liderar workshops de IA, e desenvolver roadmap de longo prazo para toda a organização.",
      "career_benefit": "Posiciona você para promoção a Chief Marketing Officer ou Chief Innovation Officer, com portfolio comprovado de transformação digital"
    }
  ]
};

export default function VisualTestPage() {
  const [reportData] = useState(sampleReportData);

  return (
    <div className="aura-background min-h-screen">
      <div className="aura-container py-8 sm:py-12">
        {/* Test Header */}
        <div className="text-center mb-12">
          <h1 className="aura-heading text-4xl mb-4">Visual Test - Report Layout</h1>
          <p className="aura-text-secondary">Testing the AI report generation and layout</p>
        </div>

        {/* Executive Report Dashboard */}
        <div className="executive-report-dashboard max-w-7xl mx-auto space-y-20">
          {/* Progress Navigation - Static Position */}
          <div className="mb-16">
            <div className="aura-glass rounded-3xl p-6 shadow-2xl max-w-5xl mx-auto border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full animate-pulse shadow-lg" 
                       style={{ backgroundColor: '#EC4E22' }}></div>
                  <span className="aura-heading text-lg">Relatório Executivo de Campeão de IA</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    {['Summary', 'Challenges', 'Career Impact', 'Quick Wins', 'Roadmap'].map((section, index) => (
                      <div key={section} className="flex flex-col items-center gap-2">
                        <div className="w-4 h-4 rounded-full shadow-lg" 
                             style={{ background: 'linear-gradient(90deg, #EC4E22, #FFA850)' }}></div>
                        <span className="text-xs aura-text-primary font-medium hidden sm:block">{section}</span>
                      </div>
                    ))}
                  </div>
                  <div className="aura-glass-selected px-4 py-2 rounded-full">
                    <span className="aura-text-primary text-sm font-bold">Completo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* === EXECUTIVE SUMMARY === */}
          <div className="mb-20">
            <div className="flex items-center gap-6 mb-10">
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-green-500/60 to-transparent rounded-full"></div>
              <div className="flex items-center gap-4 px-8 py-4 bg-green-500/10 rounded-2xl border-2 border-green-500/30 shadow-xl">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <span className="aura-heading text-xl text-green-700 font-black uppercase tracking-wider">Executive Summary</span>
              </div>
              <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-green-500/60 to-transparent rounded-full"></div>
            </div>
            
          <section className="group relative aura-card aura-hover-lift overflow-hidden shadow-2xl">
            {/* Subtle background patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-10 lg:p-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-green-400/30 group-hover:ring-green-400/50 group-hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                    <CheckCircle className="w-14 h-14 text-white relative z-10" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full animate-pulse shadow-xl"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">Resumo Executivo</h2>
                    <div className="aura-glass-selected px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="aura-text-primary text-sm font-bold">Insights Críticos</span>
                    </div>
                  </div>
                  <p className="aura-text-secondary text-lg leading-relaxed">Visão Geral Estratégica e Insights Chave para Liderança de Mercado</p>
                </div>
              </div>
              
              <div className="aura-glass rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 rounded-3xl"></div>
                <div className="relative z-10">
                  <p className="aura-text-primary text-xl lg:text-2xl leading-relaxed font-medium tracking-wide">{reportData.executive_summary}</p>
                </div>
              </div>
            </div>
          </section>
          </div>

          {/* === DEPARTMENT CHALLENGES === */}
          <div className="mb-20">
            <div className="flex items-center gap-6 mb-10">
              <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(236,78,34,0.6), transparent)' }}></div>
              <div className="flex items-center gap-4 px-8 py-4 rounded-2xl border-2 shadow-xl" style={{ backgroundColor: 'rgba(236,78,34,0.1)', borderColor: 'rgba(236,78,34,0.3)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#EC4E22' }}>
                  <Target className="w-7 h-7 text-white" />
                </div>
                <span className="aura-heading text-xl font-black uppercase tracking-wider" style={{ color: '#EC4E22' }}>Key Challenges</span>
              </div>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(236,78,34,0.6), transparent)' }}></div>
            </div>
            
          <section className="group relative aura-card aura-hover-lift overflow-hidden shadow-2xl">
            {/* Subtle background patterns */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-orange-400/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-10 lg:p-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-aura-vermelho-cinnabar to-aura-coral rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-aura-vermelho-cinnabar/30 group-hover:ring-aura-vermelho-cinnabar/50 group-hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                    <Target className="w-14 h-14 text-white relative z-10" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-aura-coral rounded-full animate-pulse shadow-xl"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">Desafios do Departamento</h2>
                    <div className="aura-glass-selected px-4 py-2 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-aura-vermelho-cinnabar rounded-full animate-pulse"></div>
                      <span className="aura-text-primary text-sm font-bold">Obstáculos Chave</span>
                    </div>
                  </div>
                  <p className="aura-text-secondary text-lg leading-relaxed">Desafios Críticos Afetando Sua Equipe e Carreira</p>
                </div>
              </div>
              
              <div className="aura-glass rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-aura-vermelho-cinnabar/5 via-transparent to-aura-coral/5 rounded-3xl"></div>
                <div className="relative z-10 space-y-8">
                  {reportData.department_challenges.map((challenge, index) => (
                    <div key={index} className="group/item aura-glass aura-hover-lift rounded-2xl p-8 transition-all duration-300">
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover/item:scale-110 transition-transform duration-300"
                               style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                            <span className="text-white font-black text-2xl relative z-10">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="aura-text-primary text-lg lg:text-xl font-medium leading-relaxed">{challenge}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          </div>

          {/* === CAREER IMPACT === */}
          <div className="mb-20">
            <div className="flex items-center gap-6 mb-10">
              <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,168,80,0.6), transparent)' }}></div>
              <div className="flex items-center gap-4 px-8 py-4 rounded-2xl border-2 shadow-xl" style={{ backgroundColor: 'rgba(255,168,80,0.1)', borderColor: 'rgba(255,168,80,0.3)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFA850' }}>
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <span className="aura-heading text-xl font-black uppercase tracking-wider" style={{ color: '#FFA850' }}>Career Impact</span>
              </div>
              <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,168,80,0.6), transparent)' }}></div>
            </div>
            
          <section className="group relative aura-card aura-hover-lift overflow-hidden shadow-2xl">
            {/* Subtle background patterns */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-aura-coral/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-aura-violeta/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-10 lg:p-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-aura-coral to-aura-violeta rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-aura-coral/30 group-hover:ring-aura-coral/50 group-hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                    <TrendingUp className="w-14 h-14 text-white relative z-10" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-aura-violeta rounded-full animate-pulse shadow-xl"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">Impacto na Carreira</h2>
                    <div className="aura-glass px-4 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(255,168,80,0.1)', border: '2px solid rgba(255,168,80,0.3)' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFA850' }}></div>
                      <span className="aura-text-primary text-sm font-bold">Ganhos Pessoais</span>
                    </div>
                  </div>
                  <p className="aura-text-secondary text-lg leading-relaxed">Como a Implementação de IA Avançará Sua Carreira</p>
                </div>
              </div>
              
              <div className="aura-glass rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-aura-coral/5 via-transparent to-aura-violeta/5 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                    <div className="group/card aura-glass aura-hover-lift rounded-2xl p-8 lg:p-10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                          <Clock className="w-7 h-7 text-white relative z-10" />
                        </div>
                        <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">Produtividade Pessoal</h3>
                      </div>
                      <p className="aura-text-primary text-lg lg:text-xl font-medium leading-relaxed mb-4">{reportData.career_impact.personal_productivity}</p>
                      <div className="aura-progress h-3">
                        <div className="aura-progress-bar h-3 w-4/5 aura-progress-wave"></div>
                      </div>
                    </div>
                    
                    <div className="group/card aura-glass aura-hover-lift rounded-2xl p-8 lg:p-10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                          <Target className="w-7 h-7 text-white relative z-10" />
                        </div>
                        <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">Performance da Equipe</h3>
                      </div>
                      <p className="aura-text-primary text-lg lg:text-xl font-medium leading-relaxed mb-4">{reportData.career_impact.team_performance}</p>
                      <div className="aura-progress h-3">
                        <div className="aura-progress-bar h-3 w-3/4 aura-progress-wave"></div>
                      </div>
                    </div>
                    
                    <div className="group/card aura-glass aura-hover-lift rounded-2xl p-8 lg:p-10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-300"
                             style={{ background: 'linear-gradient(135deg, #8850E2, #A855F7)' }}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                          <TrendingUp className="w-7 h-7 text-white relative z-10" />
                        </div>
                        <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">Reconhecimento da Liderança</h3>
                      </div>
                      <p className="aura-text-primary text-lg lg:text-xl font-medium leading-relaxed mb-4">{reportData.career_impact.leadership_recognition}</p>
                      <div className="aura-progress h-3">
                        <div className="aura-progress-bar h-3 w-5/6 aura-progress-wave"></div>
                      </div>
                    </div>
                    
                    <div className="group/card aura-glass aura-hover-lift rounded-2xl p-8 lg:p-10 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-aura-coral to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                          <Lightbulb className="w-7 h-7 text-white relative z-10" />
                        </div>
                        <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">Crescimento Profissional</h3>
                      </div>
                      <p className="aura-text-primary text-lg lg:text-xl font-medium leading-relaxed mb-4">{reportData.career_impact.professional_growth}</p>
                      <div className="aura-progress h-3">
                        <div className="aura-progress-bar h-3 w-4/5 aura-progress-wave"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}