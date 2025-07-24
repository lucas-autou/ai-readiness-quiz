export type Language = 'en' | 'pt';

export interface Translations {
  // Common
  common: {
    continue: string;
    back: string;
    email: string;
    company: string;
    jobTitle: string;
    loading: string;
    submit: string;
    free: string;
    takesMinutes: string;
    noCreditCard: string;
  };
  
  // Home page
  home: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroDescription: string;
    stats: {
      revenue: string;
      advantage: string;
      automation: string;
    };
    ctaButton: string;
    benefitsTitle: string;
    benefits: {
      score: {
        title: string;
        description: string;
      };
      actionPlan: {
        title: string;
        description: string;
      };
      quickWins: {
        title: string;
        description: string;
      };
      riskAssessment: {
        title: string;
        description: string;
      };
    };
    testimonial: {
      quote: string;
      author: string;
    };
    finalCta: {
      title: string;
      description: string;
      button: string;
    };
  };
  
  // Quiz
  quiz: {
    title: string;
    subtitle: string;
    features: {
      careerFocused: {
        title: string;
        description: string;
      };
      teamNeeds: {
        title: string;
        description: string;
      };
      aiChampion: {
        title: string;
        description: string;
      };
    };
    startButton: string;
    progress: {
      question: string;
      of: string;
      almostDone: string;
    };
    emailCapture: {
      title: string;
      subtitle: string;
      emailLabel: string;
      emailPlaceholder: string;
      companyLabel: string;
      companyPlaceholder: string;
      jobTitleLabel: string;
      jobTitlePlaceholder: string;
      submitButton: string;
      buildingPlaybook: string;
      securityNote: string;
    };
    multiSelect: {
      selectUpTo: string;
    };
    scale: {
      clickToRate: string;
      lowest: string;
      highest: string;
    };
    answerSaved: string;
    selected: string;
  };

  // Results page
  results: {
    loading: string;
    error: string;
    tryAgain: string;
    executiveReport: string;
    aiChampionPlaybook: string;
    assessmentComplete: string;
    aiChampionReadiness: string;
    departmentAnalysis: string;
    readinessScore: string;
    outOf100: string;
    currentStatus: string;
    recommendedAction: string;
    aiReadinessProgress: string;
    executiveSummary: string;
    criticalInsights: string;
    strategicOverview: string;
    departmentChallenges: string;
    keyObstacles: string;
    criticalChallenges: string;
    careerImpact: string;
    personalGains: string;
    careerAdvancement: string;
    personalProductivity: string;
    teamPerformance: string;
    leadershipRecognition: string;
    professionalGrowth: string;
    quickWins: string;
    immediateActions: string;
    quickWinsDescription: string;
    implementationRoadmap: string;
    strategicPhases: string;
    roadmapDescription: string;
    detailedAnalysisReport: string;
    personalizedFor: string;
    executiveAiChampionReport: string;
    complete: string;
    // Additional results page translations
    yourAiChampionPlaybook: string;
    personalizedRoadmap: string;
    confidential: string;
    personalized: string;
    actionable: string;
    assessmentSummary: string;
    // Progress levels
    aiBeginner: string;
    aiCurious: string;
    aiExplorer: string;
    aiChampion: string;
    // Sections
    summary: string;
    challenges: string;
    careerImpactSection: string;
    quickWinsSection: string;
    roadmap: string;
    // Quick Wins
    fastWins: string;
    month1Actions: string;
    quarter1Goals: string;
    outcome: string;
    // Implementation
    executionPlan: string;
    strategicTimeline: string;
    careerBenefit: string;
    completeTransformation: string;
    // Final CTA
    readyToBecome: string;
    aiLeaderTitle: string;
    yourTeamNeeds: string;
    finalDescription: string;
    departmentPlan: string;
    aiExpertStatus: string;
    careerStrategies: string;
    getFullPlaybook: string;
    downloadReport: string;
    // Additional missing translations
    yourAiChampion: string;
    yourAiChampionHighlight: string;
    championReady: string;
    buildSkills: string;
    learnExplore: string;
    startLearning: string;
    totalImplementationTimeline: string;
    fromAssessmentToDeployment: string;
    months: string;
    executiveStrategySession: string;
    becomeTheAiChampion: string;
    downloadFullReportPdf: string;
    thirtyMinuteConsultation: string;
    noObligation: string;
    seniorConsultant: string;
    backToHome: string;
    assessmentRevealsPath: string;
    loadingEllipsis: string;
    // Progress indicators
    start: string;
    readyToBegin: string;
    moderateComplexity: string;
    longTermVision: string;
  };
  
  // Questions (will be added to quiz questions structure)
  questions: {
    // Questions will be organized by ID
    [key: string]: {
      question: string;
      subtitle?: string;
      options?: string[];
      cards?: {
        title: string;
        description: string;
      }[];
      scaleLabels?: {
        min: string;
        max: string;
      };
    };
  };
}

export type TranslationKey = keyof Translations;
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationPath = NestedKeyOf<Translations>;
