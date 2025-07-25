'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, Mail, Building2, User, TrendingUp, Clock, Target, Lightbulb } from 'lucide-react';
import { quizQuestions, calculateScore } from '@/lib/questions';
import { useRouter } from 'next/navigation';
import { useTranslation, useLanguage, LanguageSelector } from '@/lib/i18n';
import { en } from '@/lib/i18n/translations/en';
import { pt } from '@/lib/i18n/translations/pt';

interface UserInfo {
  email: string;
  company: string;
  jobTitle: string;
}

export default function QuizPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({ email: '', company: '', jobTitle: '' });
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Helper function to get translated question content
  const getTranslatedQuestion = (question: (typeof quizQuestions)[0]) => {
    const translations = language === 'pt' ? pt : en;
    const questionData = translations.questions[question.id as keyof typeof translations.questions];
    
    if (!questionData) {
      // Fallback to original question if translation not found
      return question;
    }
    
    return {
      ...question,
      question: questionData.question || question.question,
      subtitle: questionData.subtitle || question.subtitle,
      options: questionData.options || question.options,
      cards: questionData.cards ? questionData.cards.map((card: { title: string; description: string }, index: number) => ({
        ...question.cards?.[index],
        title: card.title,
        description: card.description,
        value: question.cards?.[index]?.value || '',
        icon: question.cards?.[index]?.icon || ''
      })) : question.cards,
      scaleLabels: questionData.scaleLabels || question.scaleLabels
    };
  };

  const isIntroStep = currentStep === 0;
  const isQuizStep = currentStep >= 1 && currentStep <= quizQuestions.length;
  const isEmailStep = currentStep === quizQuestions.length + 1;
  const currentQuestion = isQuizStep ? getTranslatedQuestion(quizQuestions[currentStep - 1]) : null;
  const progress = isIntroStep ? 0 : (currentStep / (quizQuestions.length + 1)) * 100;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.email && userInfo.company && userInfo.jobTitle) {
      handleSubmit();
    }
  };

  const handleQuestionResponse = (response: string) => {
    if (currentQuestion) {
      if (currentQuestion.multiSelect) {
        setResponses(prev => {
          const currentResponses = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] as string[] : [];
          const maxSelections = currentQuestion.maxSelections || 5;
          
          if (currentResponses.includes(response)) {
            // Remove if already selected
            return { ...prev, [currentQuestion.id]: currentResponses.filter(r => r !== response) };
          } else if (currentResponses.length < maxSelections) {
            // Add if under limit
            return { ...prev, [currentQuestion.id]: [...currentResponses, response] };
          } else {
            // At limit, replace first with new selection
            return { ...prev, [currentQuestion.id]: [...currentResponses.slice(1), response] };
          }
        });
      } else {
        setResponses(prev => ({ ...prev, [currentQuestion.id]: response }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep <= quizQuestions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const score = calculateScore(responses);
    
    try {
      const response = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userInfo,
          responses,
          score,
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/results?id=${data.responseId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.setupRequired) {
          if (confirm(`Setup Required: ${errorData.error}\n\nWould you like to go to the setup page with detailed instructions?`)) {
            router.push('/setup');
          }
        } else {
          throw new Error(errorData.error || 'Submission failed');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('There was an error submitting your quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (isQuizStep && currentQuestion) {
      const response = responses[currentQuestion.id];
      if (currentQuestion.multiSelect) {
        return Array.isArray(response) && response.length > 0;
      }
      return !!response;
    }
    if (isEmailStep) {
      return userInfo.email && userInfo.company && userInfo.jobTitle;
    }
    return false;
  };


  return (
    <div className="min-h-screen relative overflow-hidden aura-background">
      {/* Clean minimal background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Simple tree illustration */}
        <div className="absolute bottom-0 right-16 w-32 h-32 opacity-10">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <rect x="35" y="50" width="10" height="30" fill="var(--aura-vermelho-cinnabar)" />
            <circle cx="40" cy="30" r="20" fill="var(--aura-coral)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        {/* Progress Bar */}
        {!isIntroStep && (
          <div className="mb-8">
            <div className="aura-progress aura-progress-wave h-3 max-w-2xl mx-auto">
              <div 
                className="aura-progress-bar h-3"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center mt-3 text-base font-medium aura-text-secondary">
              {isEmailStep ? t('quiz.progress.almostDone') : `${t('quiz.progress.question')} ${currentStep} ${t('quiz.progress.of')} ${quizQuestions.length}`}
            </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {/* Intro Step */}
          {isIntroStep && (
            <div className="text-center">
              <div className="p-12 relative" style={{ 
                background: 'rgba(255,255,255,0.9)', 
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)'
              }}>
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <div 
                      className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                      style={{
                        background: 'var(--aura-gradient-primary)',
                        boxShadow: '0 8px 24px rgba(236,78,34,0.25)'
                      }}
                    >
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight aura-heading">
                      {t('quiz.title')}
                    </h1>
                    <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto aura-body">
                      {t('quiz.subtitle')}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(236,78,34,0.2)' }}>
                        <Clock className="w-6 h-6 aura-icon" />
                      </div>
                      <h3 className="font-semibold mb-2 aura-subheading">{t('quiz.features.careerFocused.title')}</h3>
                      <p className="text-sm aura-body">{t('quiz.features.careerFocused.description')}</p>
                    </div>
                    <div className="p-6 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(136,80,226,0.2)' }}>
                        <Target className="w-6 h-6 aura-icon--violet" />
                      </div>
                      <h3 className="font-semibold mb-2 aura-subheading">{t('quiz.features.teamNeeds.title')}</h3>
                      <p className="text-sm aura-body">{t('quiz.features.teamNeeds.description')}</p>
                    </div>
                    <div className="p-6 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,168,80,0.2)' }}>
                        <Lightbulb className="w-6 h-6 aura-icon--coral" />
                      </div>
                      <h3 className="font-semibold mb-2 aura-subheading">{t('quiz.features.aiChampion.title')}</h3>
                      <p className="text-sm aura-body">{t('quiz.features.aiChampion.description')}</p>
                    </div>
                  </div>

                  <button onClick={() => setCurrentStep(1)} className="aura-button aura-button-primary aura-button-magnetic aura-liquid-hover text-xl px-12 py-5 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-3">
                      {t('quiz.startButton')}
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>

                  <p className="text-sm mt-6 aura-text-secondary">
                    {t('common.free')} • No signup required • Get results instantly
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Capture Step */}
          {isEmailStep && (
            <div className="p-8 relative" style={{ 
              background: 'rgba(255,255,255,0.9)', 
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)'
            }}>
              
              <div className="relative z-10 text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 leading-tight aura-heading">
                  {t('quiz.emailCapture.title')}
                </h1>
                <p className="text-xl aura-body">
                  {t('quiz.emailCapture.subtitle')}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 aura-text-primary">
                      <Mail className="w-4 h-4 aura-icon" />
                      {t('quiz.emailCapture.emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="aura-input aura-input-organic w-full px-4 py-3"
                      placeholder={t('quiz.emailCapture.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 aura-text-primary">
                      <Building2 className="w-4 h-4 aura-icon--coral" />
                      {t('quiz.emailCapture.companyLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={userInfo.company}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                      className="aura-input aura-input-organic w-full px-4 py-3"
                      placeholder={t('quiz.emailCapture.companyPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 aura-text-primary">
                      <User className="w-4 h-4 aura-icon--violet" />
                      {t('quiz.emailCapture.jobTitleLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={userInfo.jobTitle}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="aura-input aura-input-organic w-full px-4 py-3"
                      placeholder={t('quiz.emailCapture.jobTitlePlaceholder')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canProceed() || isSubmitting}
                  className="aura-button w-full py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    background: !canProceed() || isSubmitting 
                      ? 'var(--aura-medium-gray)' 
                      : 'var(--aura-gradient-secondary)',
                    color: 'white',
                    boxShadow: !canProceed() || isSubmitting 
                      ? 'none' 
                      : '0 8px 24px rgba(136,80,226,0.25)'
                  }}
                >
                  {isSubmitting ? t('quiz.emailCapture.buildingPlaybook') : t('quiz.emailCapture.submitButton')}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm aura-text-secondary">
                  {t('quiz.emailCapture.securityNote')}
                </p>
              </form>

              {/* Email step navigation */}
              <div className="flex justify-between mt-6 relative z-10">
                <button onClick={handleBack} className="aura-button aura-button-secondary flex items-center gap-2 px-6 py-3">
                  <ArrowLeft className="w-4 h-4" />
                  {t('common.back')}
                </button>
                <div></div>
              </div>
            </div>
          )}

          {/* Quiz Questions */}
          {isQuizStep && currentQuestion && (
            <div className="p-8 relative" style={{ 
              background: 'rgba(255,255,255,0.9)', 
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)'
            }}>
              
              <div className="relative z-10 text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 leading-tight aura-heading">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-xl mb-6 max-w-2xl mx-auto leading-relaxed aura-body">
                    {currentQuestion.subtitle}
                  </p>
                )}
                <div 
                  className="w-16 h-1 mx-auto rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--aura-cinnabar) 0%, var(--aura-coral) 50%, var(--aura-violet) 100%)'
                  }}
                ></div>
              </div>

              <div className="space-y-4 relative z-10">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="grid gap-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionResponse(option)}
                        className={`group relative p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          responses[currentQuestion.id] === option
                            ? 'shadow-xl'
                            : 'hover:shadow-lg'
                        }`}
                        style={{
                          background: responses[currentQuestion.id] === option 
                            ? 'rgba(236,78,34,0.1)' 
                            : 'rgba(255,255,255,0.9)',
                          border: responses[currentQuestion.id] === option 
                            ? '2px solid var(--aura-vermelho-cinnabar)' 
                            : '1px solid rgba(0,0,0,0.08)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: responses[currentQuestion.id] === option 
                            ? '0 8px 32px rgba(236,78,34,0.15)' 
                            : '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              responses[currentQuestion.id] === option ? 'scale-110' : ''
                            }`}
                            style={{
                              background: responses[currentQuestion.id] === option ? 'var(--aura-cinnabar)' : 'transparent',
                              borderColor: responses[currentQuestion.id] === option ? 'var(--aura-cinnabar)' : 'var(--aura-medium-gray)'
                            }}
                          >
                            {responses[currentQuestion.id] === option && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div 
                              className={`font-medium text-lg leading-relaxed aura-text-primary ${
                                responses[currentQuestion.id] === option ? 'font-semibold' : ''
                              }`}
                            >
                              {option}
                            </div>
                          </div>
                          {responses[currentQuestion.id] === option && (
                            <div className="absolute top-4 right-4">
                              <div 
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ background: 'var(--aura-cinnabar)' }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Selection Interface */}
                {(currentQuestion.type === 'card-select' || currentQuestion.type === 'multi-card-select') && currentQuestion.cards && (
                  <>
                    {currentQuestion.multiSelect && (
                      <div className="mb-6 text-center">
                        <div 
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                          style={{ background: 'rgba(255,168,80,0.2)' }}
                        >
                          <span className="text-sm aura-text-primary">
                            {t('quiz.multiSelect.selectUpTo')} {currentQuestion.maxSelections} options
                          </span>
                          {Array.isArray(responses[currentQuestion.id]) && (
                            <span 
                              className="text-white px-2 py-1 rounded-full text-xs font-bold"
                              style={{ background: 'var(--aura-coral)' }}
                            >
                              {(responses[currentQuestion.id] as string[]).length}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentQuestion.cards.map((card, index) => {
                        const currentResponses = Array.isArray(responses[currentQuestion.id]) ? responses[currentQuestion.id] as string[] : [];
                        const isSelected = currentQuestion.multiSelect 
                          ? currentResponses.includes(card.value)
                          : responses[currentQuestion.id] === card.value;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleQuestionResponse(card.value)}
                            className={`group relative p-6 text-left transition-all duration-300 transform hover:scale-[1.02] ${
                              isSelected ? 'shadow-xl' : 'hover:shadow-lg'
                            }`}
                            style={{
                              background: isSelected 
                                ? 'rgba(255,168,80,0.1)' 
                                : 'rgba(255,255,255,0.9)',
                              border: isSelected 
                                ? '2px solid var(--aura-coral)' 
                                : '1px solid rgba(0,0,0,0.08)',
                              borderRadius: '24px',
                              backdropFilter: 'blur(20px)',
                              boxShadow: isSelected 
                                ? '0 8px 32px rgba(255,168,80,0.15)' 
                                : '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                          >
                            
                            <div className={`flex items-start gap-4 relative z-10 ${isSelected ? 'pr-10' : ''}`}>
                              <div className="text-3xl">{card.icon}</div>
                              <div className="flex-1">
                                <h3 className={`text-xl font-bold mb-3 aura-subheading ${isSelected ? 'font-semibold' : ''}`}>
                                  {card.title}
                                </h3>
                                <p className="text-sm leading-relaxed aura-body">
                                  {card.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--aura-coral)' }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Slider Interface */}
                {currentQuestion.type === 'slider' && (
                  <div className="space-y-8">
                    <div 
                      className="rounded-2xl p-8 border relative"
                      style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.90) 100%)`,
                        border: '2px solid rgba(136,80,226,0.3)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: `0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`
                      }}
                    >
                      <div className="flex justify-between text-sm font-medium mb-8 aura-text-secondary">
                        <span className="flex items-center gap-2 text-left max-w-[40%]">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          {currentQuestion.scaleLabels?.min}
                        </span>
                        <span className="flex items-center gap-2 text-right max-w-[40%]">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          {currentQuestion.scaleLabels?.max}
                        </span>
                      </div>
                      
                      <div className="relative mb-8">
                        <input
                          type="range"
                          min={currentQuestion.scaleMin || 1}
                          max={currentQuestion.scaleMax || 10}
                          value={responses[currentQuestion.id] || Math.floor((currentQuestion.scaleMax || 10) / 2)}
                          onChange={(e) => handleQuestionResponse(e.target.value)}
                          className="w-full h-3 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, 
                              #ef4444 0%, 
                              #f59e0b 50%, 
                              #10b981 100%)`
                          }}
                        />
                      </div>
                      
                      {responses[currentQuestion.id] && (
                        <div className="text-center">
                          <div 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                            style={{ background: 'rgba(255,168,80,0.3)' }}
                          >
                            <span className="font-bold text-lg aura-text-primary">
                              {responses[currentQuestion.id]}
                            </span>
                            <span className="text-sm aura-text-secondary">
                              / {currentQuestion.scaleMax || 10}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'scale' && (
                  <div className="space-y-8">
                    <div 
                      className="rounded-2xl p-8 border relative"
                      style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.90) 100%)`,
                        border: '2px solid rgba(136,80,226,0.3)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: `0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`
                      }}
                    >
                      <div className="flex justify-between text-sm font-medium mb-8 aura-text-secondary">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          {currentQuestion.scaleLabels?.min}
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          {currentQuestion.scaleLabels?.max}
                        </span>
                      </div>
                      
                      <div className="flex justify-between gap-3">
                        {Array.from({ length: currentQuestion.scaleMax || 5 }, (_, i) => i + 1).map(value => (
                          <button
                            key={value}
                            onClick={() => handleQuestionResponse(value.toString())}
                            className={`group relative flex-1 aspect-square max-w-[80px] rounded-2xl text-center font-bold text-xl transition-all duration-300 transform ${
                              responses[currentQuestion.id] === value.toString()
                                ? 'scale-110 shadow-2xl'
                                : 'hover:scale-105 hover:shadow-lg'
                            }`}
                            style={{
                              background: responses[currentQuestion.id] === value.toString()
                                ? 'var(--aura-gradient-primary)'
                                : 'rgba(255,255,255,0.8)',
                              color: responses[currentQuestion.id] === value.toString()
                                ? 'white'
                                : 'var(--aura-dark-gray)',
                              border: responses[currentQuestion.id] === value.toString()
                                ? 'none'
                                : '1px solid rgba(255,255,255,0.6)',
                              boxShadow: responses[currentQuestion.id] === value.toString()
                                ? '0 8px 24px rgba(236,78,34,0.25)'
                                : '0 4px 12px rgba(0,0,0,0.08)',
                              backdropFilter: 'blur(20px)'
                            }}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center h-full">
                              {value}
                            </div>
                            {responses[currentQuestion.id] === value.toString() && (
                              <div className="absolute -top-2 -right-2">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ background: 'var(--aura-coral)' }}
                                >
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-6 text-center">
                        <p className="text-sm aura-text-secondary">
                          {t('quiz.scale.clickToRate')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12 relative z-10">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="aura-button aura-button-secondary group flex items-center gap-2 px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-medium">{t('common.back')}</span>
                </button>

                <div className="flex items-center gap-3">
                  {canProceed() && (
                    <div 
                      className="flex items-center gap-2 animate-fade-in px-3 py-2 rounded-full"
                      style={{ 
                        background: 'rgba(255,168,80,0.2)',
                        color: 'var(--aura-coral)'
                      }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {currentQuestion.multiSelect 
                          ? `${Array.isArray(responses[currentQuestion.id]) ? (responses[currentQuestion.id] as string[]).length : 0} ${t('quiz.selected')}`
                          : t('quiz.answerSaved')
                        }
                      </span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="aura-button group relative overflow-hidden flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"
                    style={{
                      background: !canProceed() 
                        ? 'var(--aura-medium-gray)' 
                        : 'var(--aura-gradient-primary)',
                      color: 'white',
                      boxShadow: !canProceed() 
                        ? 'none' 
                        : '0 8px 24px rgba(236,78,34,0.25)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">
                      {currentStep === quizQuestions.length ? t('quiz.progress.almostDone').replace('Almost done! Just need your details', 'Almost Done!') : t('common.continue')}
                    </span>
                    <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}