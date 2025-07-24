'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Mail, ArrowRight, TrendingUp, Target, Lightbulb, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';

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
}

function ResultsPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const responseId = searchParams?.get('id');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (score >= 80) return { level: 'AI Champion Ready', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 60) return { level: 'AI Explorer', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (score >= 40) return { level: 'AI Curious', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: 'AI Beginner', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const parseJSONReport = (report: string): ReportData | null => {
    try {
      const parsed = JSON.parse(report);
      
      // Validate structure for new department-focused report
      if (parsed.executive_summary && parsed.department_challenges && 
          parsed.career_impact && parsed.quick_wins && parsed.implementation_roadmap) {
        return parsed as ReportData;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to parse JSON report:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('results.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-4">{t('results.error')}</h1>
            <p className="text-blue-200 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        {/* Premium Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm text-blue-300 uppercase tracking-widest font-semibold">{t('results.executiveReport')}</div>
              <div className="text-lg text-white font-semibold">{result.company}</div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('results.yourAiChampion')}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> {t('results.yourAiChampionHighlight')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            {t('results.personalizedRoadmap')}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 mt-6 text-sm text-blue-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{t('results.confidential')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>{t('results.personalized')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>{t('results.actionable')}</span>
            </div>
          </div>
        </div>

        {/* Executive Score Card */}
        <div className="max-w-5xl mx-auto mb-32">
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-2 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold">{t('results.assessmentComplete')}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('results.aiChampionReadiness')}</h2>
                <p className="text-blue-200">{t('results.departmentAnalysis')}</p>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-2">{result.score}</div>
                  <div className="text-lg sm:text-xl text-blue-300 font-semibold">{t('results.readinessScore')}</div>
                  <div className="text-sm text-blue-400">{t('results.outOf100')}</div>
                </div>
                
                <div className="text-center">
                  <div className={`inline-flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl ${scoreLevel.bgColor} mb-3`}>
                    <div className={`w-4 h-4 rounded-full ${scoreLevel.color.replace('text-', 'bg-')}`}></div>
                    <span className={`text-lg sm:text-xl font-bold ${scoreLevel.color}`}>
                      {scoreLevel.level}
                    </span>
                  </div>
                  <div className="text-blue-200 text-sm">{t('results.currentStatus')}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {result.score >= 80 ? '🚀' : result.score >= 60 ? '⚡' : result.score >= 40 ? '🎯' : '🏗️'}
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-white">
                    {result.score >= 80 ? t('results.championReady') : result.score >= 60 ? t('results.buildSkills') : result.score >= 40 ? t('results.learnExplore') : t('results.startLearning')}
                  </div>
                  <div className="text-blue-200 text-sm">{t('results.recommendedAction')}</div>
                </div>
              </div>

              {/* Premium Score Visualization */}
              <div className="bg-white/5 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-300 font-medium">{t('results.aiReadinessProgress')}</span>
                  <span className="text-white font-bold">{result.score}%</span>
                </div>
                <div className="bg-white/10 rounded-full h-3 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-3 rounded-full transition-all duration-2000 relative"
                    style={{ width: `${result.score}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-blue-300 mt-2">
                  <span>{t('results.aiBeginner')}</span>
                  <span>{t('results.aiCurious')}</span>
                  <span>{t('results.aiExplorer')}</span>
                  <span>{t('results.aiChampion')}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-white/10">
                <p className="text-blue-100 max-w-3xl mx-auto text-center leading-relaxed">
                  {t('results.assessmentSummary', { company: result.company })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Major Section Divider */}
        <div className="flex items-center justify-center my-32">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
          <div className="mx-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse shadow-lg"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full animate-pulse delay-150 shadow-lg"></div>
              <div className="w-4 h-4 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full animate-pulse delay-300 shadow-lg"></div>
            </div>
            <div className="text-center">
              <p className="text-blue-300 text-sm font-medium">{t('results.detailedAnalysisReport')}</p>
              <p className="text-white/60 text-xs">{t('results.personalizedFor')} {result.company}</p>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
        </div>

        {/* Executive Report Dashboard */}
        {reportData ? (
          <div className="executive-report-dashboard max-w-7xl mx-auto space-y-20">
            {/* Progress Navigation */}
            <div className="sticky top-4 z-50 mb-12">
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold text-lg">{t('results.executiveAiChampionReport')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {['Summary', 'Challenges', 'Career Impact', 'Quick Wins', 'Roadmap'].map((section, index) => (
                        <div key={section} className="flex flex-col items-center gap-1">
                          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${index < 5 ? 'bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg' : 'bg-white/30'}`}></div>
                          <span className="text-xs text-blue-300 hidden sm:block">{section}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1 rounded-full border border-green-400/30">
                      <span className="text-green-300 text-sm font-bold">{t('results.complete')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Executive Summary Section */}
            <section className="group relative bg-gradient-to-br from-emerald-500/20 to-teal-600/15 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border-2 border-emerald-400/40 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-700 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-400/10 via-transparent to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-emerald-400/20 group-hover:ring-emerald-400/40 group-hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <CheckCircle className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{t('results.executiveSummary')}</h2>
                      <div className="hidden sm:flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/30">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-emerald-200 text-sm font-medium">{t('results.criticalInsights')}</span>
                      </div>
                    </div>
                    <p className="text-lg text-emerald-200 leading-relaxed">{t('results.strategicOverview')}</p>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/15 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 rounded-2xl"></div>
                  <div className="relative z-10">
                    <p className="text-white text-xl lg:text-2xl leading-relaxed font-light tracking-wide">{reportData.executive_summary}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Department Challenges Section */}
            <section className="group relative bg-gradient-to-br from-red-500/20 to-orange-600/15 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border-2 border-red-400/40 shadow-2xl hover:shadow-red-500/10 transition-all duration-700 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-400/10 via-transparent to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-red-400/20 group-hover:ring-red-400/40 group-hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <Target className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{t('results.departmentChallenges')}</h2>
                      <div className="hidden sm:flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-400/30">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-red-200 text-sm font-medium">{t('results.keyObstacles')}</span>
                      </div>
                    </div>
                    <p className="text-lg text-red-200 leading-relaxed">{t('results.criticalChallenges')}</p>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/15 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5 rounded-2xl"></div>
                  <div className="relative z-10 space-y-6">
                    {reportData.department_challenges.map((challenge, index) => (
                      <div key={index} className="group/item bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 hover:border-red-400/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                              <span className="text-white font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="absolute -inset-1 bg-red-400/20 rounded-xl blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-lg lg:text-xl font-medium leading-relaxed tracking-wide">{challenge}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Career Impact Section */}
            <section className="group relative bg-gradient-to-br from-orange-500/20 to-yellow-600/15 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border-2 border-orange-400/40 shadow-2xl hover:shadow-orange-500/10 transition-all duration-700 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-orange-400/20 group-hover:ring-orange-400/40 group-hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <TrendingUp className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{t('results.careerImpact')}</h2>
                      <div className="hidden sm:flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-400/30">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-orange-200 text-sm font-medium">{t('results.personalGains')}</span>
                      </div>
                    </div>
                    <p className="text-lg text-orange-200 leading-relaxed">{t('results.careerAdvancement')}</p>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/15 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-yellow-500/5 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                      <div className="group/card bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/15 hover:to-blue-600/10 border border-blue-500/30 hover:border-blue-400/50 rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-blue-200 font-bold text-sm uppercase tracking-wider">{t('results.personalProductivity')}</h3>
                        </div>
                        <p className="text-white text-lg lg:text-xl font-semibold leading-tight mb-2">{reportData.career_impact.personal_productivity}</p>
                        <div className="w-full bg-blue-500/20 rounded-full h-2 mt-4">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full w-4/5 shadow-sm"></div>
                        </div>
                      </div>
                      
                      <div className="group/card bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10 border border-green-500/30 hover:border-green-400/50 rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-green-200 font-bold text-sm uppercase tracking-wider">{t('results.teamPerformance')}</h3>
                        </div>
                        <p className="text-white text-lg lg:text-xl font-semibold leading-tight mb-2">{reportData.career_impact.team_performance}</p>
                        <div className="w-full bg-green-500/20 rounded-full h-2 mt-4">
                          <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full w-3/4 shadow-sm"></div>
                        </div>
                      </div>
                      
                      <div className="group/card bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/15 hover:to-purple-600/10 border border-purple-500/30 hover:border-purple-400/50 rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-purple-200 font-bold text-sm uppercase tracking-wider">{t('results.leadershipRecognition')}</h3>
                        </div>
                        <p className="text-white text-lg lg:text-xl font-semibold leading-tight mb-2">{reportData.career_impact.leadership_recognition}</p>
                        <div className="w-full bg-purple-500/20 rounded-full h-2 mt-4">
                          <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full w-5/6 shadow-sm"></div>
                        </div>
                      </div>
                      
                      <div className="group/card bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 hover:from-yellow-500/15 hover:to-yellow-600/10 border border-yellow-500/30 hover:border-yellow-400/50 rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-300">
                            <Lightbulb className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-yellow-200 font-bold text-sm uppercase tracking-wider">{t('results.professionalGrowth')}</h3>
                        </div>
                        <p className="text-white text-lg lg:text-xl font-semibold leading-tight mb-2">{reportData.career_impact.professional_growth}</p>
                        <div className="w-full bg-yellow-500/20 rounded-full h-2 mt-4">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full w-4/5 shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Wins Section */}
            <section className="group relative bg-gradient-to-br from-green-500/20 to-emerald-600/15 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border-2 border-green-400/40 shadow-2xl hover:shadow-green-500/10 transition-all duration-700 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-400/10 via-transparent to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-green-400/20 group-hover:ring-green-400/40 group-hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <Lightbulb className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{t('results.quickWins')}</h2>
                      <div className="hidden sm:flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-200 text-sm font-medium">{t('results.immediateActions')}</span>
                      </div>
                    </div>
                    <p className="text-lg text-green-200 leading-relaxed">{t('results.fastWins')}</p>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/15 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 rounded-2xl"></div>
                  <div className="relative z-10">
                    {/* Month 1 Actions */}
                    <div className="mb-12">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        {t('results.month1Actions')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {reportData.quick_wins.month_1_actions.map((action, index) => (
                          <div key={index} className="group/action bg-gradient-to-br from-green-500/10 to-emerald-600/5 hover:from-green-500/15 hover:to-emerald-600/10 border border-green-500/30 hover:border-green-400/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover/action:scale-110 transition-transform duration-300 flex-shrink-0">
                                <span className="text-white font-bold text-lg">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-bold text-lg leading-tight mb-2">{action.action}</h4>
                                <p className="text-green-200 text-sm leading-relaxed">{action.impact}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quarter 1 Goals */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Q1</span>
                        </div>
                        {t('results.quarter1Goals')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {reportData.quick_wins.quarter_1_goals.map((goal, index) => (
                          <div key={index} className="group/goal bg-gradient-to-br from-emerald-500/10 to-green-600/5 hover:from-emerald-500/15 hover:to-green-600/10 border border-emerald-500/30 hover:border-emerald-400/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover/goal:scale-110 transition-transform duration-300 flex-shrink-0">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-bold text-lg leading-tight mb-2">{goal.goal}</h4>
                                <p className="text-emerald-200 text-sm leading-relaxed"><strong>{t('results.outcome')}:</strong> {goal.outcome}</p>
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

            {/* Roadmap Section */}
            <section className="group relative bg-gradient-to-br from-purple-500/20 to-violet-600/15 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border-2 border-purple-400/40 shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-400/15 via-transparent to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-400/10 via-transparent to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-purple-400/20 group-hover:ring-purple-400/40 group-hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                      <Clock className="w-12 h-12 text-white relative z-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">{t('results.implementationRoadmap')}</h2>
                      <div className="hidden sm:flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full border border-purple-400/30">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-purple-200 text-sm font-medium">{t('results.executionPlan')}</span>
                      </div>
                    </div>
                    <p className="text-lg text-purple-200 leading-relaxed">{t('results.strategicTimeline')}</p>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/15 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="space-y-8">
                      {reportData.implementation_roadmap.map((phase, index) => (
                        <div key={index} className="group/phase relative">
                          {/* Connection line for phases */}
                          {index < reportData.implementation_roadmap.length - 1 && (
                            <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-purple-400 to-purple-600 opacity-30"></div>
                          )}
                          
                          <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/5 hover:from-purple-500/15 hover:to-violet-600/10 border border-purple-500/30 hover:border-purple-400/50 rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
                            <div className="flex items-start gap-6">
                              <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/phase:scale-110 transition-transform duration-300">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                                  <span className="text-white font-black text-2xl relative z-10">{index + 1}</span>
                                </div>
                                <div className="absolute -inset-2 bg-purple-400/20 rounded-2xl blur-sm opacity-0 group-hover/phase:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                  <h3 className="text-white text-2xl lg:text-3xl font-bold leading-tight">{phase.phase}</h3>
                                  <div className="flex items-center gap-3">
                                    <div className="bg-purple-600/30 text-purple-200 px-4 py-2 rounded-full border border-purple-500/30 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm font-bold">{phase.duration}</span>
                                      </div>
                                    </div>
                                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg"></div>
                                  </div>
                                </div>
                                
                                <p className="text-purple-100 text-lg lg:text-xl font-medium leading-relaxed mb-4">{phase.description}</p>
                                
                                {/* Career Benefit */}
                                <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-purple-300" />
                                    <span className="text-purple-200 text-sm font-bold uppercase tracking-wider">{t('results.careerBenefit')}</span>
                                  </div>
                                  <p className="text-white font-medium leading-relaxed">{phase.career_benefit}</p>
                                </div>
                                
                                {/* Progress indicator */}
                                <div className="w-full bg-purple-500/20 rounded-full h-2 relative overflow-hidden">
                                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full shadow-sm transition-all duration-1000 delay-300"
                                       style={{ width: index === 0 ? '95%' : index === 1 ? '60%' : '25%' }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                                  </div>
                                </div>
                                <div className="flex justify-between text-xs text-purple-300 mt-2">
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
                    <div className="mt-10 pt-8 border-t border-purple-500/20">
                      <div className="bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-2xl p-6 lg:p-8 border border-purple-400/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-purple-200 font-bold text-lg mb-1">{t('results.totalImplementationTimeline')}</h4>
                            <p className="text-purple-300 text-sm opacity-75">{t('results.fromAssessmentToDeployment')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-3xl lg:text-4xl font-black">
                              {(() => {
                                // Calculate total duration in months with fallback
                                let totalMonths = 0;
                                reportData.implementation_roadmap.forEach(phase => {
                                  const duration = phase.duration.toLowerCase();
                                  if (duration.includes('week')) {
                                    const match = duration.match(/(\d+)/);
                                    if (match) {
                                      const weeks = parseInt(match[1]);
                                      totalMonths += weeks / 4;
                                    }
                                  } else if (duration.includes('month')) {
                                    const match = duration.match(/(\d+)/);
                                    if (match) {
                                      const months = parseInt(match[1]);
                                      totalMonths += months;
                                    }
                                  }
                                });
                                
                                // Fallback to realistic timeline if calculation fails
                                if (isNaN(totalMonths) || totalMonths === 0) {
                                  totalMonths = 2.5; // 10 weeks = 2.5 months
                                }
                                
                                return `${Math.ceil(totalMonths)}`;
                              })()}
                            </p>
                            <p className="text-white text-xl font-bold mb-1">{t('results.months')}</p>
                            <p className="text-purple-200 text-sm">{t('results.completeTransformation')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : result.aiReport ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Legacy Report Format</h3>
              <p className="text-blue-200 mb-6">
                This report was generated in an older format. Please contact support for an updated version.
              </p>
              <div className="bg-black/20 rounded-xl p-6 text-left">
                <pre className="text-blue-100 text-sm whitespace-pre-wrap overflow-auto">{result.aiReport}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Report Generation</h3>
              <p className="text-blue-200 mb-6">
                Your personalized AI strategy report will be generated and emailed to you within the next few minutes.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <Mail className="w-5 h-5" />
                <span>Check your email at: {result.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Premium CTA Section */}
        <div className="max-w-5xl mx-auto mt-32">
          <div className="bg-gradient-to-br from-blue-600/25 to-purple-600/25 backdrop-blur-sm rounded-3xl p-10 border border-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-4 py-2 text-white text-sm font-semibold mb-6">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                {t('results.executiveStrategySession')}
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {t('results.becomeTheAiChampion')}
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('results.yourTeamNeeds')}</span>
              </h3>
              
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
                 dangerouslySetInnerHTML={{
                   __html: t('results.assessmentRevealsPath', { company: result.company })
                 }}>
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-white font-bold mb-2">Department Roadmap</h4>
                  <p className="text-blue-200 text-sm">{t('results.departmentPlan')}</p>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-white font-bold mb-2">Career Positioning</h4>
                  <p className="text-blue-200 text-sm">{t('results.aiExpertStatus')}</p>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-bold mb-2">Leadership Recognition</h4>
                  <p className="text-blue-200 text-sm">{t('results.careerStrategies')}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <a 
                  href={`mailto:contact@yourcompany.com?subject=Executive AI Strategy Consultation - ${encodeURIComponent(result.company)}&body=${encodeURIComponent('Hi, I just completed the AI readiness assessment and scored ' + result.score + '/100. I\'d like to schedule a 30-minute executive consultation to discuss our AI transformation strategy.')}`}
                  className="group relative overflow-hidden inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Mail className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Schedule AI Champion Consultation</span>
                </a>
                
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-300 border border-white/30 hover:border-white/50"
                >
                  <Download className="w-6 h-6" />
                  {t('results.downloadFullReportPdf')}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-blue-300 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{t('results.thirtyMinuteConsultation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{t('results.noObligation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{t('results.seniorConsultant')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors duration-200"
          >
            {t('results.backToHome')}
          </Link>
        </div>
      </div>
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