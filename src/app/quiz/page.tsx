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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>
        {/* Progress Bar */}
        {!isIntroStep && (
          <div className="mb-8">
            <div className="bg-white/10 rounded-full h-2 max-w-2xl mx-auto">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-blue-200 mt-2 text-sm">
              {isEmailStep ? t('quiz.progress.almostDone') : `${t('quiz.progress.question')} ${currentStep} ${t('quiz.progress.of')} ${quizQuestions.length}`}
            </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {/* Intro Step */}
          {isIntroStep && (
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {t('quiz.title')}
                  </h1>
                  <p className="text-xl text-blue-200 mb-8 leading-relaxed max-w-2xl mx-auto">
                    {t('quiz.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{t('quiz.features.careerFocused.title')}</h3>
                    <p className="text-blue-200 text-sm">{t('quiz.features.careerFocused.description')}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{t('quiz.features.teamNeeds.title')}</h3>
                    <p className="text-blue-200 text-sm">{t('quiz.features.teamNeeds.description')}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{t('quiz.features.aiChampion.title')}</h3>
                    <p className="text-blue-200 text-sm">{t('quiz.features.aiChampion.description')}</p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-3">
                    {t('quiz.startButton')}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>

                <p className="text-blue-300 text-sm mt-6">
                  {t('common.free')} • No signup required • Get results instantly
                </p>
              </div>
            </div>
          )}

          {/* Email Capture Step */}
          {isEmailStep && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {t('quiz.emailCapture.title')}
                </h1>
                <p className="text-xl text-blue-200">
                  {t('quiz.emailCapture.subtitle')}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      <Mail className="inline w-4 h-4 mr-2" />
                      {t('quiz.emailCapture.emailLabel')}
                    </label>
                    <input
                      type="email"
                      required
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('quiz.emailCapture.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      {t('quiz.emailCapture.companyLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={userInfo.company}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('quiz.emailCapture.companyPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      {t('quiz.emailCapture.jobTitleLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={userInfo.jobTitle}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('quiz.emailCapture.jobTitlePlaceholder')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canProceed() || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? t('quiz.emailCapture.buildingPlaybook') : t('quiz.emailCapture.submitButton')}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-blue-200 text-sm">
                  {t('quiz.emailCapture.securityNote')}
                </p>
              </form>

              {/* Email step navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('common.back')}
                </button>
                <div></div>
              </div>
            </div>
          )}

          {/* Quiz Questions */}
          {isQuizStep && currentQuestion && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-xl text-blue-200 mb-6 max-w-2xl mx-auto">
                    {currentQuestion.subtitle}
                  </p>
                )}
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-4">
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="grid gap-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionResponse(option)}
                        className={`group relative p-6 rounded-xl text-left transition-all duration-300 border-2 transform hover:scale-[1.02] ${
                          responses[currentQuestion.id] === option
                            ? 'bg-gradient-to-r from-blue-600/40 to-purple-600/40 border-blue-400 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 border-white/20 text-blue-100 hover:bg-white/10 hover:border-white/30 hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            responses[currentQuestion.id] === option
                              ? 'bg-blue-400 border-blue-400 scale-110'
                              : 'border-white/40 group-hover:border-white/60'
                          }`}>
                            {responses[currentQuestion.id] === option && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium text-lg leading-relaxed ${
                              responses[currentQuestion.id] === option ? 'text-white' : 'text-blue-100'
                            }`}>
                              {option}
                            </div>
                          </div>
                          {responses[currentQuestion.id] === option && (
                            <div className="absolute top-4 right-4">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
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
                        <div className="inline-flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-full">
                          <span className="text-blue-200 text-sm">
                            {t('quiz.multiSelect.selectUpTo')} {currentQuestion.maxSelections} options
                          </span>
                          {Array.isArray(responses[currentQuestion.id]) && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
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
                            className={`group relative p-6 rounded-2xl text-left transition-all duration-300 border-2 transform hover:scale-[1.02] ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600/40 to-purple-600/40 border-blue-400 shadow-xl shadow-blue-500/25'
                                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-lg'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="text-3xl">{card.icon}</div>
                              <div className="flex-1">
                                <h3 className={`text-xl font-bold mb-2 ${
                                  isSelected ? 'text-white' : 'text-blue-100'
                                }`}>
                                  {card.title}
                                </h3>
                                <p className={`text-sm leading-relaxed ${
                                  isSelected ? 'text-blue-100' : 'text-blue-200'
                                }`}>
                                  {card.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-4 right-4">
                                  <CheckCircle className="w-6 h-6 text-green-400" />
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
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                      <div className="flex justify-between text-blue-300 text-sm font-medium mb-8">
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
                          <div className="inline-flex items-center gap-2 bg-blue-600/30 px-4 py-2 rounded-full">
                            <span className="text-white font-bold text-lg">
                              {responses[currentQuestion.id]}
                            </span>
                            <span className="text-blue-200 text-sm">
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
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                      <div className="flex justify-between text-blue-300 text-sm font-medium mb-8">
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
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110 shadow-2xl shadow-blue-500/50'
                                : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:scale-105 hover:shadow-lg border border-white/20'
                            }`}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-center h-full">
                              {value}
                            </div>
                            {responses[currentQuestion.id] === value.toString() && (
                              <div className="absolute -top-2 -right-2">
                                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-6 text-center">
                        <p className="text-blue-300 text-sm">
                          {t('quiz.scale.clickToRate')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-medium">{t('common.back')}</span>
                </button>

                <div className="flex items-center gap-3">
                  {canProceed() && (
                    <div className="flex items-center gap-2 text-green-400 animate-fade-in">
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
                    className="group relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:hover:scale-100 disabled:opacity-50"
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