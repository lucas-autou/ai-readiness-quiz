'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Share2, Mail, ArrowRight, TrendingUp, Target, Lightbulb, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';
import ClientLogos from '@/components/ClientLogos';
import ShareReportModal from '@/components/ShareReportModal';
import { generateFallbackReport } from '@/lib/fallbackReportGenerator';

interface ReportData {
  executive_summary: string;
  department_challenges: string[];
  career_impact: {
    personal_productivity: string;
    team_performance: string;
    leadership_recognition: string;
    professional_growth: string;
  };
  quick_wins: {
    month_1_actions: Array<{
      action: string;
      impact: string;
    }>;
    quarter_1_goals: Array<{
      goal: string;
      outcome: string;
    }>;
  };
  implementation_roadmap: Array<{
    phase: string;
    duration: string;
    description: string;
    career_benefit: string;
  }>;
}

interface QuizResult {
  id: number;
  email: string;
  company: string;
  jobTitle: string;
  score: number;
  aiReport: string | null;
  createdAt: string;
  responses?: Record<string, string | string[]>;
}

function ResultsPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const responseId = searchParams?.get('id');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results?id=${responseId}`);
        if (response.ok) {
          const data = await response.json();
          setResult(data);
        } else {
          throw new Error('Failed to fetch results');
        }
      } catch {
        setError('Failed to load your results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (responseId) {
      fetchResults();
    } else {
      setError('No response ID provided');
      setLoading(false);
    }
  }, [responseId]);


  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: t('results.aiChampion'), color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 60) return { level: t('results.aiExplorer'), color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (score >= 40) return { level: t('results.aiCurious'), color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: t('results.aiBeginner'), color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const parseJSONReport = (report: string): ReportData | null => {
    console.log('🔍 Starting JSON parsing process for report, length:', report?.length || 0);
    
    try {
      // Check if this is a markdown fallback message (not JSON)
      if (report.trim().startsWith('#') || report.includes('Premium AI Report Not Available')) {
        console.log('📝 Report is markdown fallback, not JSON - using smart fallback');
        return generateSmartFallback();
      }
      
      // Multiple attempts to parse and clean the JSON
      const cleaningAttempts = [
        // Attempt 1: Basic cleaning
        () => report.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, ''),
        // Attempt 2: Extract JSON boundaries
        () => {
          const firstBrace = report.indexOf('{');
          const lastBrace = report.lastIndexOf('}');
          if (firstBrace >= 0 && lastBrace > firstBrace) {
            return report.substring(firstBrace, lastBrace + 1);
          }
          return report;
        },
        // Attempt 3: Remove markdown formatting
        () => report.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim(),
        // Attempt 4: Fix common JSON issues
        () => report.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').trim()
      ];
      
      for (let i = 0; i < cleaningAttempts.length; i++) {
        try {
          const cleanedReport = cleaningAttempts[i]();
          console.log(`🧹 Cleaning attempt ${i + 1}, length:`, cleanedReport.length);
          console.log(`📝 First 200 chars:`, cleanedReport.substring(0, 200));
          
          const parsed = JSON.parse(cleanedReport);
          console.log('✅ Successfully parsed JSON on attempt', i + 1);
          console.log('📊 Parsed report structure:', Object.keys(parsed));
          
          // Validate and return if it has the correct structure
          const validatedReport = validateAndFixReportStructure(parsed);
          if (validatedReport) {
            console.log('✅ Report structure validated successfully');
            return validatedReport;
          }
        } catch (parseError) {
          console.log(`❌ Parse attempt ${i + 1} failed:`, parseError);
          continue;
        }
      }
      
      // All parsing attempts failed - generate intelligent fallback
      console.log('🛡️ All JSON parsing attempts failed, generating intelligent fallback');
      return generateSmartFallback();
      
    } catch (error) {
      console.error('❌ Critical error in parseJSONReport:', error);
      console.log('📝 Raw report content (first 500 chars):', report?.substring(0, 500));
      
      // Last resort: generate fallback
      return generateSmartFallback();
    }
  };
  
  const validateAndFixReportStructure = (parsed: unknown): ReportData | null => {
    if (!parsed || typeof parsed !== 'object') {
      console.log('❌ Invalid parsed object');
      return null;
    }
    
    console.log('🔍 Validating report structure...');
    const reportData = parsed as ReportData;
    console.log('🔍 Executive summary present:', !!reportData.executive_summary);
    console.log('🔍 Department challenges present:', !!reportData.department_challenges);
    console.log('🔍 Career impact present:', !!reportData.career_impact);
    console.log('🔍 Quick wins present:', !!reportData.quick_wins);
    console.log('🔍 Implementation roadmap present:', !!reportData.implementation_roadmap);
    
    // If it has the complete structure, return it
    if (reportData.executive_summary && reportData.department_challenges && 
        reportData.career_impact && reportData.quick_wins && reportData.implementation_roadmap) {
      return reportData;
    }
    
    // Try to fix incomplete structure with available data
    if (Object.keys(parsed).length > 0) {
      console.log('🔧 Attempting to fix incomplete structure with available data');
      
      const allValues = Object.values(parsed).filter(v => typeof v === 'string' && v.length > 10);
      const firstContent = allValues[0] || 'Relatório personalizado gerado com base nas suas respostas.';
      
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const parsedData = parsed as any;
      return {
        executive_summary: parsedData.executive_summary || parsedData.summary || parsedData.overview || firstContent,
        department_challenges: Array.isArray(parsedData.department_challenges) ? parsedData.department_challenges 
          : Array.isArray(parsedData.challenges) ? parsedData.challenges 
          : parsedData.challenges ? [parsedData.challenges]
          : ['Análise de desafios específicos identificados para o seu departamento'],
        career_impact: parsedData.career_impact || {
          personal_productivity: parsedData.productivity || 'Aumento significativo na produtividade pessoal através de ferramentas de IA',
          team_performance: parsedData.team || 'Melhoria no desempenho da equipe com automação inteligente',
          leadership_recognition: parsedData.leadership || 'Reconhecimento como líder inovador e visionário em IA',
          professional_growth: parsedData.growth || 'Crescimento profissional acelerado através de competências em IA'
        },
        quick_wins: parsedData.quick_wins || {
          month_1_actions: parsedData.actions || [
            { action: 'Identificar e testar ferramentas de IA relevantes para o departamento', impact: 'Base sólida para implementação e resultados rápidos' }
          ],
          quarter_1_goals: parsedData.goals || [
            { goal: 'Implementar primeira solução de IA piloto', outcome: 'Resultados mensuráveis e aprovação para expansão' }
          ]
        },
        implementation_roadmap: Array.isArray(parsedData.implementation_roadmap) ? parsedData.implementation_roadmap
          : Array.isArray(parsedData.roadmap) ? parsedData.roadmap
      /* eslint-enable @typescript-eslint/no-explicit-any */
          : [
            {
              phase: 'Fase 1: Avaliação e Planejamento',
              duration: '4 semanas',
              description: 'Análise detalhada das necessidades do departamento e preparação estratégica',
              career_benefit: 'Posicionamento como líder visionário e estrategista em IA'
            },
            {
              phase: 'Fase 2: Implementação Piloto',
              duration: '6 semanas',
              description: 'Desenvolvimento e teste de soluções de IA específicas',
              career_benefit: 'Demonstração de resultados tangíveis e liderança prática'
            }
          ]
      } as ReportData;
    }
    
    return null;
  };
  
  const generateSmartFallback = (): ReportData => {
    console.log('🛡️ Generating smart fallback report with user data');
    
    // Use the fallback generator with user data if available
    if (result) {
      const userData = {
        company: result.company,
        jobTitle: result.jobTitle,
        score: result.score,
        responses: result.responses || {},
        language: 'pt' // Assumindo PT para o contexto brasileiro
      };
      
      try {
        return generateFallbackReport(userData);
      } catch (error) {
        console.error('❌ Error generating smart fallback:', error);
      }
    }
    
    // Last resort: minimal fallback
    return {
      executive_summary: result ? 
        `Relatório personalizado para ${result.jobTitle} na ${result.company}. Score: ${result.score}/100. Oportunidades de IA identificadas para seu departamento com base na análise detalhada das suas respostas.` :
        'Relatório de análise de IA personalizado baseado nas suas respostas.',
      department_challenges: [
        'Processos manuais consomem tempo excessivo da equipe',
        'Falta de automação resulta em erros e retrabalho',
        'Análise de dados é feita de forma reativa',
        'Pressão por resultados mais rápidos sem ferramentas adequadas',
        'Necessidade de demonstrar inovação e liderança tecnológica'
      ],
      career_impact: {
        personal_productivity: 'Aumento significativo na produtividade pessoal através de ferramentas de IA',
        team_performance: 'Melhoria no desempenho da equipe com automação inteligente',
        leadership_recognition: 'Reconhecimento como líder inovador e visionário em IA',
        professional_growth: 'Crescimento profissional acelerado através de competências em IA'
      },
      quick_wins: {
        month_1_actions: [
          { action: 'Implementar ferramentas básicas de IA para automação', impact: 'Resultados imediatos em produtividade' }
        ],
        quarter_1_goals: [
          { goal: 'Estabelecer programa piloto de IA', outcome: 'Base sólida para expansão futura' }
        ]
      },
      implementation_roadmap: [
        {
          phase: 'Fase 1: Avaliação e Planejamento',
          duration: '4 semanas',
          description: 'Análise detalhada das necessidades e preparação estratégica',
          career_benefit: 'Posicionamento como líder em inovação'
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="aura-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-aura-vermelho-cinnabar mx-auto mb-4"></div>
          <p className="aura-text-primary text-lg font-medium">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="aura-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="aura-card p-8">
            <h1 className="aura-heading text-2xl mb-4">{t('results.error')}</h1>
            <p className="aura-text-secondary mb-6">{error}</p>
            <Link
              href="/"
              className="aura-button aura-button-primary"
            >
              {t('results.tryAgain')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const scoreLevel = getScoreLevel(result.score);
  const reportData = result.aiReport ? parseJSONReport(result.aiReport) : null;
  
  // Debug info
  if (result.aiReport && !reportData) {
    console.log('Report exists but parsing failed. Raw report length:', result.aiReport.length);
    console.log('First 300 chars:', result.aiReport.substring(0, 300));
  }
  

  return (
    <div className="aura-background">
      <div className="aura-container py-8 sm:py-12">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        {/* Premium Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm uppercase tracking-widest font-bold" style={{ color: '#EC4E22' }}>{t('results.executiveReport')}</div>
              <div className="text-xl aura-text-primary font-bold">{result.company}</div>
            </div>
          </div>
          <h1 className="aura-heading text-4xl sm:text-5xl md:text-7xl mb-8 leading-tight">
            {t('results.yourAiChampion')}
            <br />
            <span className="aura-text-glow">{t('results.yourAiChampionHighlight')}</span>
          </h1>
          <p className="aura-body text-xl max-w-4xl mx-auto leading-relaxed mb-8">
            {t('results.personalizedRoadmap')}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-6 mt-8">
            <div className="aura-glass rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="aura-text-primary text-sm font-semibold">{t('results.confidential')}</span>
            </div>
            <div className="aura-glass rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#EC4E22' }}></div>
              <span className="aura-text-primary text-sm font-semibold">{t('results.personalized')}</span>
            </div>
            <div className="aura-glass rounded-full px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#8850E2' }}></div>
              <span className="aura-text-primary text-sm font-semibold">{t('results.actionable')}</span>
            </div>
          </div>
        </div>

        {/* Executive Score Card */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="aura-card p-12 relative overflow-hidden">
            {/* Subtle background patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-aura-coral/20 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-aura-violeta/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="aura-glass rounded-full px-6 py-3 mb-6 inline-flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="aura-text-primary font-bold">{t('results.assessmentComplete')}</span>
                </div>
                <h2 className="aura-heading text-4xl md:text-5xl mb-3">{t('results.aiChampionReadiness')}</h2>
                <p className="aura-text-secondary text-lg">{t('results.departmentAnalysis')}</p>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-7xl sm:text-8xl md:text-9xl font-black aura-text-glow mb-3">{result.score}</div>
                  <div className="aura-heading text-xl mb-1">{t('results.readinessScore')}</div>
                  <div className="aura-text-secondary text-sm">{t('results.outOf100')}</div>
                </div>
                
                <div className="text-center">
                  <div className={`aura-glass rounded-2xl px-6 py-4 mb-4 inline-flex items-center gap-3`}>
                    <div className="w-4 h-4 rounded-full bg-aura-vermelho-cinnabar"></div>
                    <span className="aura-heading text-xl">
                      {scoreLevel.level}
                    </span>
                  </div>
                  <div className="aura-text-secondary text-sm">{t('results.currentStatus')}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {result.score >= 80 ? '🚀' : result.score >= 60 ? '⚡' : result.score >= 40 ? '🎯' : '🏗️'}
                  </div>
                  <div className="aura-heading text-lg mb-1">
                    {result.score >= 80 ? t('results.championReady') : result.score >= 60 ? t('results.buildSkills') : result.score >= 40 ? t('results.learnExplore') : t('results.startLearning')}
                  </div>
                  <div className="aura-text-secondary text-sm">{t('results.recommendedAction')}</div>
                </div>
              </div>

              {/* Premium Score Visualization */}
              <div className="aura-glass rounded-2xl p-8 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="aura-text-primary font-bold text-lg">{t('results.aiReadinessProgress')}</span>
                  <span className="aura-heading text-2xl">{result.score}%</span>
                </div>
                <div className="aura-progress h-4 mb-4">
                  <div 
                    className="aura-progress-bar h-4 transition-all duration-2000 aura-progress-wave"
                    style={{ width: `${result.score}%` }}
                  >
                  </div>
                </div>
                <div className="flex justify-between text-sm aura-text-secondary">
                  <span>{t('results.aiBeginner')}</span>
                  <span>{t('results.aiCurious')}</span>
                  <span>{t('results.aiExplorer')}</span>
                  <span>{t('results.aiChampion')}</span>
                </div>
              </div>

              <div className="aura-glass-selected rounded-2xl p-8">
                <p className="aura-text-primary text-center text-lg leading-relaxed max-w-4xl mx-auto">
                  {t('results.assessmentSummary', { company: result.company })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Major Section Divider */}
        <div className="flex items-center justify-center my-24">
          <div className="flex-1 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,168,80,0.6), transparent)' }}></div>
          <div className="mx-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: '#EC4E22' }}></div>
              <div className="w-3 h-3 rounded-full animate-pulse delay-150 shadow-lg" style={{ backgroundColor: '#FFA850' }}></div>
              <div className="w-4 h-4 rounded-full animate-pulse delay-300 shadow-lg" style={{ backgroundColor: '#8850E2' }}></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: '#EC4E22' }}>{t('results.detailedAnalysisReport')}</p>
              <p className="aura-text-secondary text-xs">{t('results.personalizedFor')} {result.company}</p>
            </div>
          </div>
          <div className="flex-1 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(136,80,226,0.6), transparent)' }}></div>
        </div>

        {/* Executive Report Dashboard */}
        {reportData ? (
          <div className="executive-report-dashboard max-w-7xl mx-auto space-y-20">
            {/* Progress Navigation - Static Position */}
            <div className="mb-16">
              <div className="aura-glass rounded-3xl p-6 shadow-2xl max-w-5xl mx-auto border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full animate-pulse shadow-lg" 
                         style={{ backgroundColor: '#EC4E22' }}></div>
                    <span className="aura-heading text-lg">{t('results.executiveAiChampionReport')}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      {['Summary', 'Challenges', 'Career Impact', 'Quick Wins', 'Roadmap'].map((section) => (
                        <div key={section} className="flex flex-col items-center gap-2">
                          <div className="w-4 h-4 rounded-full shadow-lg" 
                               style={{ background: 'linear-gradient(90deg, #EC4E22, #FFA850)' }}></div>
                          <span className="text-xs aura-text-primary font-medium hidden sm:block">{section}</span>
                        </div>
                      ))}
                    </div>
                    <div className="aura-glass-selected px-4 py-2 rounded-full">
                      <span className="aura-text-primary text-sm font-bold">{t('results.complete')}</span>
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
                  <span className="aura-heading text-xl text-green-700 font-black uppercase tracking-wider">{t('results.executiveSummary')}</span>
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
                      <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">{t('results.executiveSummary')}</h2>
                      <div className="aura-glass-selected px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="aura-text-primary text-sm font-bold">{t('results.criticalInsights')}</span>
                      </div>
                    </div>
                    <p className="aura-text-secondary text-lg leading-relaxed">{t('results.strategicOverview')}</p>
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
                  <span className="aura-heading text-xl font-black uppercase tracking-wider" style={{ color: '#EC4E22' }}>{t('results.keyChallenges')}</span>
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
                    <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-red-500/30 group-hover:ring-red-500/50 group-hover:scale-105 transition-all duration-500"
                         style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                      <Target className="w-14 h-14 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full animate-pulse shadow-xl"
                         style={{ backgroundColor: '#FFA850' }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">{t('results.departmentChallenges')}</h2>
                      <div className="aura-glass-selected px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-aura-vermelho-cinnabar rounded-full animate-pulse"></div>
                        <span className="aura-text-primary text-sm font-bold">{t('results.keyObstacles')}</span>
                      </div>
                    </div>
                    <p className="aura-text-secondary text-lg leading-relaxed">{t('results.criticalChallenges')}</p>
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
                  <span className="aura-heading text-xl font-black uppercase tracking-wider" style={{ color: '#FFA850' }}>{t('results.careerImpact')}</span>
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
                    <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-orange-500/30 group-hover:ring-orange-500/50 group-hover:scale-105 transition-all duration-500"
                         style={{ background: 'linear-gradient(135deg, #FFA850, #8850E2)' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                      <TrendingUp className="w-14 h-14 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full animate-pulse shadow-xl"
                         style={{ backgroundColor: '#8850E2' }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">{t('results.careerImpact')}</h2>
                      <div className="aura-glass px-4 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(255,168,80,0.1)', border: '2px solid rgba(255,168,80,0.3)' }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFA850' }}></div>
                        <span className="aura-text-primary text-sm font-bold">{t('results.personalGains')}</span>
                      </div>
                    </div>
                    <p className="aura-text-secondary text-lg leading-relaxed">{t('results.careerAdvancement')}</p>
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
                          <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">{t('results.personalProductivity')}</h3>
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
                          <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">{t('results.teamPerformance')}</h3>
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
                          <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">{t('results.leadershipRecognition')}</h3>
                        </div>
                        <p className="aura-text-primary text-lg lg:text-xl font-medium leading-relaxed mb-4">{reportData.career_impact.leadership_recognition}</p>
                        <div className="aura-progress h-3">
                          <div className="aura-progress-bar h-3 w-5/6 aura-progress-wave"></div>
                        </div>
                      </div>
                      
                      <div className="group/card aura-glass aura-hover-lift rounded-2xl p-8 lg:p-10 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-300"
                               style={{ background: 'linear-gradient(135deg, #FFA850, #F59E0B)' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                            <Lightbulb className="w-7 h-7 text-white relative z-10" />
                          </div>
                          <h3 className="aura-text-primary font-bold text-sm uppercase tracking-wider">{t('results.professionalGrowth')}</h3>
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

            {/* === QUICK WINS === */}
            <div className="mb-20">
              <div className="flex items-center gap-6 mb-10">
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-green-500/60 to-transparent rounded-full"></div>
                <div className="flex items-center gap-4 px-8 py-4 bg-green-500/10 rounded-2xl border-2 border-green-500/30 shadow-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-7 h-7 text-white" />
                  </div>
                  <span className="aura-heading text-xl text-green-700 font-black uppercase tracking-wider">{t('results.quickWins')}</span>
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-green-500/60 to-transparent rounded-full"></div>
              </div>
              
            <section className="group relative aura-card aura-hover-lift overflow-hidden shadow-2xl">
              {/* Subtle background patterns */}
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-green-500/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10 p-10 lg:p-12">
                <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-green-400/30 group-hover:ring-green-400/50 group-hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                      <Lightbulb className="w-14 h-14 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-400 rounded-full animate-pulse shadow-xl"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">{t('results.quickWins')}</h2>
                      <div className="aura-glass-selected px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="aura-text-primary text-sm font-bold">{t('results.immediateActions')}</span>
                      </div>
                    </div>
                    <p className="aura-text-secondary text-lg leading-relaxed">{t('results.fastWins')}</p>
                  </div>
                </div>
                
                <div className="aura-glass rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 rounded-3xl"></div>
                  <div className="relative z-10">
                    {/* Month 1 Actions */}
                    <div className="mb-16">
                      <h3 className="aura-heading text-3xl mb-8">
                        {t('results.month1Actions')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {reportData.quick_wins.month_1_actions.map((action, index) => (
                          <div key={index} className="group/action aura-glass aura-hover-lift rounded-2xl p-8 transition-all duration-300">
                            <div className="flex items-start gap-6">
                              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/action:scale-110 transition-transform duration-300 flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                                <span className="text-white font-black text-xl relative z-10">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="aura-heading text-xl leading-tight mb-3">{action.action}</h4>
                                <p className="aura-text-secondary leading-relaxed">{action.impact}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quarter 1 Goals */}
                    <div>
                      <h3 className="aura-heading text-3xl mb-8">
                        {t('results.quarter1Goals')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-8">
                        {reportData.quick_wins.quarter_1_goals.map((goal, index) => (
                          <div key={index} className="group/goal aura-glass aura-hover-lift rounded-2xl p-8 transition-all duration-300">
                            <div className="flex items-start gap-6">
                              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/goal:scale-110 transition-transform duration-300 flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                                <Target className="w-7 h-7 text-white relative z-10" />
                              </div>
                              <div className="flex-1">
                                <h4 className="aura-heading text-xl leading-tight mb-3">{goal.goal}</h4>
                                <p className="aura-text-secondary leading-relaxed"><strong className="aura-text-primary">{t('results.outcome')}:</strong> {goal.outcome}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </div>

            {/* === IMPLEMENTATION ROADMAP === */}
            <div className="mb-20">
              <div className="flex items-center gap-6 mb-10">
                <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(136,80,226,0.6), transparent)' }}></div>
                <div className="flex items-center gap-4 px-8 py-4 rounded-2xl border-2 shadow-xl" style={{ backgroundColor: 'rgba(136,80,226,0.1)', borderColor: 'rgba(136,80,226,0.3)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8850E2' }}>
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <span className="aura-heading text-xl font-black uppercase tracking-wider" style={{ color: '#8850E2' }}>{t('results.implementationRoadmap')}</span>
                </div>
                <div className="flex-1 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(136,80,226,0.6), transparent)' }}></div>
              </div>
              
            <section className="group relative aura-card aura-hover-lift overflow-hidden shadow-2xl">
              {/* Subtle background patterns */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10 p-10 lg:p-12">
                <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-purple-500/30 group-hover:ring-purple-500/50 group-hover:scale-105 transition-all duration-500"
                         style={{ background: 'linear-gradient(135deg, #8850E2, #A855F7)' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                      <Clock className="w-14 h-14 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full animate-pulse shadow-xl"
                         style={{ backgroundColor: '#A855F7' }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <h2 className="aura-heading text-4xl lg:text-6xl tracking-tight">{t('results.implementationRoadmap')}</h2>
                      <div className="aura-glass px-4 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(136,80,226,0.1)', border: '2px solid rgba(136,80,226,0.3)' }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8850E2' }}></div>
                        <span className="aura-text-primary text-sm font-bold">{t('results.executionPlan')}</span>
                      </div>
                    </div>
                    <p className="aura-text-secondary text-lg leading-relaxed">{t('results.strategicTimeline')}</p>
                  </div>
                </div>
                
                <div className="aura-glass rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-aura-violeta/5 via-transparent to-purple-500/5 rounded-3xl"></div>
                  <div className="relative z-10">
                    <div className="space-y-10">
                      {reportData.implementation_roadmap.map((phase, index) => (
                        <div key={index} className="group/phase relative">
                          {/* Connection line for phases */}
                          {index < reportData.implementation_roadmap.length - 1 && (
                            <div className="absolute left-10 top-24 w-1 h-20 opacity-30 rounded-full"
                                 style={{ background: 'linear-gradient(to bottom, #8850E2, #A855F7)' }}></div>
                          )}
                          
                          <div className="aura-glass aura-hover-lift rounded-2xl p-8 lg:p-10 transition-all duration-300">
                            <div className="flex items-start gap-8">
                              <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl group-hover/phase:scale-110 transition-transform duration-300"
                                     style={{ background: 'linear-gradient(135deg, #8850E2, #A855F7)' }}>
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
                                  <span className="text-white font-black text-3xl relative z-10">{index + 1}</span>
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                                  <h3 className="aura-heading text-3xl lg:text-4xl leading-tight">{phase.phase}</h3>
                                  <div className="flex items-center gap-4">
                                    <div className="aura-glass px-4 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: 'rgba(136,80,226,0.1)', border: '2px solid rgba(136,80,226,0.3)' }}>
                                      <Clock className="w-5 h-5" style={{ color: '#8850E2' }} />
                                      <span className="aura-text-primary text-sm font-bold">{phase.duration}</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full animate-pulse shadow-lg"
                                         style={{ backgroundColor: '#8850E2' }}></div>
                                  </div>
                                </div>
                                
                                <p className="aura-text-primary text-xl lg:text-2xl font-medium leading-relaxed mb-6">{phase.description}</p>
                                
                                {/* Career Benefit */}
                                <div className="aura-glass rounded-2xl p-6 mb-6" style={{ backgroundColor: 'rgba(136,80,226,0.1)', border: '2px solid rgba(136,80,226,0.3)' }}>
                                  <div className="flex items-center gap-3 mb-3">
                                    <TrendingUp className="w-5 h-5" style={{ color: '#8850E2' }} />
                                    <span className="aura-text-primary text-sm font-bold uppercase tracking-wider">{t('results.careerBenefit')}</span>
                                  </div>
                                  <p className="aura-text-primary font-medium leading-relaxed text-lg">{phase.career_benefit}</p>
                                </div>
                                
                                {/* Progress indicator */}
                                <div className="aura-progress h-3 mb-3">
                                  <div className="aura-progress-bar h-3 aura-progress-wave transition-all duration-1000 delay-300"
                                       style={{ width: index === 0 ? '95%' : index === 1 ? '60%' : '25%' }}>
                                  </div>
                                </div>
                                <div className="flex justify-between text-sm aura-text-secondary">
                                  <span>{t('results.start')}</span>
                                  <span>{index === 0 ? t('results.readyToBegin') : index === 1 ? t('results.moderateComplexity') : t('results.longTermVision')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Timeline Summary */}
                    <div className="mt-12 pt-10 border-t border-gray-200">
                      <div className="aura-glass rounded-3xl p-8 lg:p-10" style={{ backgroundColor: 'rgba(136,80,226,0.1)', border: '2px solid rgba(136,80,226,0.3)' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div>
                            <h4 className="aura-heading text-2xl mb-2">{t('results.timeToFirstResults')}</h4>
                            <p className="aura-text-secondary">{t('results.whenYouWillSeeResults')}</p>
                          </div>
                          <div className="text-right">
                            <p className="aura-text-glow text-4xl lg:text-5xl font-black mb-2">
                              {(() => {
                                // Calculate first phase duration for first results
                                if (reportData.implementation_roadmap.length > 0) {
                                  const firstPhase = reportData.implementation_roadmap[0];
                                  const duration = firstPhase.duration.toLowerCase();
                                  if (duration.includes('semana')) {
                                    const match = duration.match(/(\d+)/);
                                    if (match) {
                                      return parseInt(match[1]);
                                    }
                                  } else if (duration.includes('week')) {
                                    const match = duration.match(/(\d+)/);
                                    if (match) {
                                      return parseInt(match[1]);
                                    }
                                  }
                                }
                                // Fallback to 8 weeks for first results
                                return '8';
                              })()}
                            </p>
                            <p className="aura-heading text-2xl mb-1">{t('results.weeks')}</p>
                            <p className="aura-text-secondary">{t('results.firstMeasurableResults')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </div>
          </div>
        ) : result.aiReport ? (
          // Show premium design even for non-JSON reports
          <div className="executive-report-dashboard max-w-7xl mx-auto space-y-20">
            {/* Simple Premium Report for any content */}
            <div className="mb-20">
              <div className="flex items-center gap-6 mb-10">
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent rounded-full"></div>
                <div className="flex items-center gap-4 px-8 py-4 bg-blue-500/10 rounded-2xl border-2 border-blue-500/30 shadow-xl">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="aura-heading text-xl text-blue-700 font-black uppercase tracking-wider">{t('results.aiAnalysisReport')}</span>
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent rounded-full"></div>
              </div>
              
              <section className="aura-card aura-hover-lift overflow-hidden shadow-2xl">
                <div className="relative z-10 p-10 lg:p-12">
                  <div className="aura-glass rounded-3xl p-10 lg:p-12 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="prose prose-lg max-w-none">
                        <pre className="aura-text-primary text-base whitespace-pre-wrap leading-relaxed font-medium">{result.aiReport}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="aura-card p-10 text-center">
              <h3 className="aura-heading text-3xl mb-6">{t('results.reportGeneration')}</h3>
              <p className="aura-text-secondary text-lg mb-8">
                {t('results.reportWillBeGenerated')}
              </p>
              
              
              <div className="flex items-center justify-center gap-3 aura-text-primary text-lg">
                <Mail className="w-6 h-6 aura-icon" />
                <span>{t('results.checkEmail')}: {result.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Client Logos - Trust Section */}
        <div className="mt-20">
          <ClientLogos />
        </div>

        {/* Premium CTA Section */}
        <div className="max-w-6xl mx-auto mt-24">
          <div className="aura-card p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-aura-coral/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="aura-glass-selected rounded-full px-6 py-3 text-sm font-bold mb-8 inline-flex items-center gap-3">
                <div className="w-3 h-3 bg-aura-vermelho-cinnabar rounded-full animate-pulse"></div>
                {t('results.executiveStrategySession')}
              </div>
              
              <h3 className="aura-heading text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
                {t('results.becomeTheAiChampion')}
                <br />
                <span className="aura-text-glow">{t('results.yourTeamNeeds')}</span>
              </h3>
              
              <p className="aura-body text-xl mb-12 max-w-4xl mx-auto leading-relaxed"
                 dangerouslySetInnerHTML={{
                   __html: t('results.assessmentRevealsPath', { company: result.company })
                 }}>
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="aura-glass rounded-2xl p-8 aura-hover-lift">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                       style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    <Target className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <h4 className="aura-heading text-lg mb-3">{t('results.departmentRoadmap')}</h4>
                  <p className="aura-text-secondary">{t('results.departmentPlan')}</p>
                </div>
                
                <div className="aura-glass rounded-2xl p-8 aura-hover-lift">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                       style={{ background: 'linear-gradient(135deg, #8850E2, #A855F7)' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    <Lightbulb className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <h4 className="aura-heading text-lg mb-3">{t('results.careerPositioning')}</h4>
                  <p className="aura-text-secondary">{t('results.aiExpertStatus')}</p>
                </div>
                
                <div className="aura-glass rounded-2xl p-8 aura-hover-lift">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    <TrendingUp className="w-8 h-8 text-white relative z-10" />
                  </div>
                  <h4 className="aura-heading text-lg mb-3">{t('results.leadershipRecognition')}</h4>
                  <p className="aura-text-secondary">{t('results.careerStrategies')}</p>
                </div>
              </div>
              
              {/* Limited Spots Badge */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" 
                     style={{ backgroundColor: 'rgba(236,78,34,0.1)', border: '2px solid rgba(236,78,34,0.3)' }}>
                  <div className="w-3 h-3 bg-aura-vermelho-cinnabar rounded-full animate-pulse"></div>
                  <span className="aura-text-primary font-bold">{t('results.limitedSpotsWeek')}</span>
                </div>
              </div>

              <div className="flex flex-col gap-8 max-w-3xl mx-auto mb-12">
                
                {/* Main CTA Button */}
                <a 
                  href={`mailto:contact@yourcompany.com?subject=Executive AI Strategy Consultation - ${encodeURIComponent(result.company)}&body=${encodeURIComponent('Hi, I just completed the AI readiness assessment and scored ' + result.score + '/100. I\'d like to schedule a 30-minute executive consultation to discuss our AI transformation strategy.')}`}
                  className="aura-button aura-button-primary text-xl px-16 py-5 aura-hover-lift group"
                >
                  <Mail className="w-7 h-7" />
                  <span>{t('results.scheduleStrategicSession')}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
                
                {/* What You Get Section */}
                <div className="aura-glass rounded-2xl p-8">
                  <h4 className="aura-heading text-xl mb-6">{t('results.whatYouGet')}</h4>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">{t('results.strategicSessionBenefits.expertTime')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">{t('results.strategicSessionBenefits.customPlan')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">{t('results.strategicSessionBenefits.exclusiveTools')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">{t('results.strategicSessionBenefits.noCommitment')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Guarantee */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full aura-glass">
                    <span className="text-2xl">✅</span>
                    <span className="aura-text-primary font-semibold">{t('results.implementableIdeasGuarantee')}</span>
                  </div>
                </div>
                
                {/* Secondary Action - Share Report */}
                <button 
                  onClick={() => setShareModalOpen(true)}
                  className="aura-button aura-button-secondary text-lg px-8 py-3"
                >
                  <Share2 className="w-5 h-5" />
                  Compartilhar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <Link
            href="/"
            className="aura-text-secondary hover:aura-text-primary transition-colors duration-200 text-lg font-medium"
          >
            {t('results.backToHome')}
          </Link>
        </div>
      </div>

      {/* Share Modal */}
      {result && (
        <ShareReportModal 
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          result={result}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}