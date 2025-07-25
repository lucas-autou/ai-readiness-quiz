'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Share2, Mail, ArrowRight, TrendingUp, Copy, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, LanguageSelector } from '@/lib/i18n';
import ClientLogos from '@/components/ClientLogos';


interface QuizResult {
  id: number;
  email: string;
  company: string;
  jobTitle: string;
  score: number;
  aiReport: string | null;
  createdAt: string;
}

// Share Modal Component
function ShareModal({ isOpen, onClose, shareUrl, result }: {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  result: QuizResult;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Meu Relatório AI Champion - Score ${result.score}/100`);
    const body = encodeURIComponent(`Olá!

Acabei de completar uma avaliação de prontidão para IA e recebi meu relatório personalizado.

🎯 Score: ${result.score}/100
🏢 Empresa: ${result.company}
📊 Ver relatório completo: ${shareUrl}

Este é um link permanente onde você pode acessar meu relatório detalhado sobre como me tornar um campeão de IA na minha organização.

Abraços!`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`🚀 *Meu Relatório AI Champion*

Acabei de completar uma avaliação de prontidão para IA!

🎯 Score: *${result.score}/100*
🏢 Empresa: ${result.company}

📊 Ver meu relatório completo: ${shareUrl}

Este relatório mostra como posso me tornar um campeão de IA na minha organização! 🔥`);
    
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaLinkedIn = () => {
    const message = encodeURIComponent(`Acabei de completar uma avaliação completa da minha prontidão para IA e os resultados são muito interessantes!

🎯 Score de Prontidão IA: ${result.score}/100
🏢 Análise personalizada para: ${result.company}

Recebi um relatório detalhado com estratégias específicas para me tornar um campeão de IA na minha organização.

#IA #InteligenciaArtificial #Lideranca #Inovacao #TransformacaoDigital

Ver relatório: ${shareUrl}`);
    
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${message}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="aura-card max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 aura-text-secondary hover:aura-text-primary text-2xl"
        >
          ×
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
               style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="aura-heading text-2xl mb-2">{t('results.shareYourReport')}</h3>
          <p className="aura-text-secondary">Compartilhe seu relatório personalizado de IA</p>
        </div>

        <div className="space-y-4">
          {/* Copy Link Button */}
          <button
            onClick={copyToClipboard}
            className={`w-full aura-button ${copied ? 'aura-button-primary' : 'aura-button-secondary'} flex items-center justify-center gap-3`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Link Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar Link
              </>
            )}
          </button>

          {/* Email Button */}
          <button
            onClick={shareViaEmail}
            className="w-full aura-button aura-button-secondary flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            Compartilhar por Email
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={shareViaWhatsApp}
            className="w-full aura-button aura-button-secondary flex items-center justify-center gap-3"
          >
            <MessageCircle className="w-5 h-5" />
            Compartilhar no WhatsApp
          </button>

          {/* LinkedIn Button */}
          <button
            onClick={shareViaLinkedIn}
            className="w-full aura-button aura-button-secondary flex items-center justify-center gap-3"
          >
            <span className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">in</span>
            Compartilhar no LinkedIn
          </button>
        </div>

        {/* Permanent Link Display */}
        <div className="mt-6 p-4 aura-glass rounded-xl">
          <p className="text-xs aura-text-secondary mb-2">Link permanente:</p>
          <p className="text-sm aura-text-primary break-all font-mono">{shareUrl}</p>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs aura-text-secondary">Link sempre acessível</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlugResultsPageContent({ slug: propSlug }: { slug?: string }) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const slug = propSlug || (params?.slug as string);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchResultBySlug = async () => {
      try {
        // First try to fetch by slug via API
        const response = await fetch(`/api/results-by-slug?slug=${encodeURIComponent(slug)}`);
        
        if (response.ok) {
          const data = await response.json();
          setResult(data);
          setShareUrl(window.location.href);
        } else if (response.status === 404) {
          // If slug not found, check if it might be an old numeric ID
          if (/^\d+$/.test(slug)) {
            router.replace(`/results?id=${slug}`);
            return;
          }
          throw new Error('Results not found');
        } else {
          throw new Error('Failed to fetch results');
        }
      } catch {
        setError('Failed to load your results. Please check the link and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResultBySlug();
    } else {
      setError('Invalid link provided');
      setLoading(false);
    }
  }, [slug, router]);

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: t('results.aiChampion'), color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 60) return { level: t('results.aiExplorer'), color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (score >= 40) return { level: t('results.aiCurious'), color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: t('results.aiBeginner'), color: 'text-red-400', bgColor: 'bg-red-500/20' };
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

        {/* Client Logos - Trust Section */}
        <div className="mt-20">
          <ClientLogos />
        </div>

        {/* Share CTA Section - replacing download PDF */}
        <div className="max-w-6xl mx-auto mt-24">
          <div className="aura-card p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-aura-coral/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="aura-glass-selected rounded-full px-6 py-3 text-sm font-bold mb-8 inline-flex items-center gap-3">
                <div className="w-3 h-3 bg-aura-vermelho-cinnabar rounded-full animate-pulse"></div>
                Compartilhe Seu Sucesso
              </div>
              
              <h3 className="aura-heading text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
                Compartilhe Seu
                <br />
                <span className="aura-text-glow">Relatório AI Champion</span>
              </h3>
              
              <p className="aura-body text-xl mb-12 max-w-4xl mx-auto leading-relaxed">
                Seu relatório personalizado está sempre disponível neste link permanente. Compartilhe com colegas, gestores ou salve para consultar a qualquer momento.
              </p>
              
              <div className="flex flex-col gap-8 max-w-3xl mx-auto mb-12">
                {/* Main Share Button */}
                <button 
                  onClick={() => setShareModalOpen(true)}
                  className="aura-button aura-button-primary text-xl px-16 py-5 aura-hover-lift group"
                >
                  <Share2 className="w-7 h-7" />
                  <span>Compartilhar Relatório</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                {/* What You Can Do */}
                <div className="aura-glass rounded-2xl p-8">
                  <h4 className="aura-heading text-xl mb-6">O que você pode fazer:</h4>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">Copiar link permanente para salvar ou compartilhar</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">Enviar por email para colegas ou gestores</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">Compartilhar no WhatsApp ou LinkedIn</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="aura-text-primary">Acessar sempre que precisar - link nunca expira</span>
                    </div>
                  </div>
                </div>
                
                {/* Guarantee */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full aura-glass">
                    <span className="text-2xl">🔗</span>
                    <span className="aura-text-primary font-semibold">Link permanente e sempre atualizado</span>
                  </div>
                </div>
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
      <ShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
        result={result}
      />
    </div>
  );
}

export default function SlugResultsPageClient({ slug: propSlug }: { slug?: string }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    }>
      <SlugResultsPageContent slug={propSlug} />
    </Suspense>
  );
}