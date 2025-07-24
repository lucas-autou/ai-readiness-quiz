export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: 'multiple-choice' | 'scale' | 'card-select' | 'slider' | 'ranking' | 'multi-select' | 'multi-card-select';
  options?: string[];
  cards?: { title: string; description: string; value: string; icon?: string }[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  weight: number;
  personalizable?: boolean;
  multiSelect?: boolean; // Enable multiple selections
  maxSelections?: number; // Optional limit on selections
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'department-challenge',
    question: "What's your biggest challenge when leadership asks about AI initiatives?",
    subtitle: "Think about your specific situation as a department leader",
    type: 'card-select',
    cards: [
      {
        title: "Proving ROI Without Risk",
        description: "You need to show measurable results but can't afford a failed initiative",
        value: "roi-pressure",
        icon: "📊"
      },
      {
        title: "Team Overwhelm",
        description: "Your department is drowning in manual work and needs immediate relief", 
        value: "team-burden",
        icon: "⚡"
      },
      {
        title: "Budget Approval Challenges",
        description: "You know what needs to be done but getting budget approved is complex",
        value: "budget-constraints",
        icon: "💰"
      },
      {
        title: "Career Risk Management",
        description: "You want to lead innovation but can't risk being seen as the person who failed",
        value: "career-protection",
        icon: "🛡️"
      }
    ],
    weight: 4,
    personalizable: true
  },
  {
    id: 'leadership-pressure',
    question: "How often does your leadership team discuss AI initiatives?",
    subtitle: "This helps us understand your organizational context",
    type: 'multiple-choice',
    options: [
      "Never mentioned - we focus on traditional approaches",
      "Occasionally comes up in meetings - starting to explore", 
      "Regular agenda item - actively evaluating options",
      "Top priority - immediate implementation expected"
    ],
    weight: 3,
    personalizable: true
  },
  {
    id: 'department-pain',
    question: "Which of your team's daily tasks would you most like to eliminate?",
    subtitle: "Think about what's consuming the most time and energy",
    type: 'card-select',
    cards: [
      {
        title: "Manual Data Entry",
        description: "Hours spent copying, updating, and reconciling data across systems",
        value: "data-entry-tasks",
        icon: "⌨️"
      },
      {
        title: "Repetitive Reporting",
        description: "Creating the same status reports, dashboards, and updates weekly",
        value: "repetitive-reporting",
        icon: "📊"
      },
      {
        title: "Meeting Coordination",
        description: "Scheduling, follow-ups, action item tracking, and status updates",
        value: "meeting-management",
        icon: "📅"
      },
      {
        title: "Customer Inquiries",
        description: "Answering the same questions, routing requests, basic troubleshooting",
        value: "customer-support",
        icon: "📞"
      }
    ],
    weight: 3
  },
  {
    id: 'approval-process',
    question: "What's the typical approval process for new software in your department?",
    subtitle: "Understanding your constraints helps us recommend the right approach",
    type: 'multiple-choice',
    options: [
      "I can approve small tools directly - under $500/month",
      "Need manager approval - up to $2,000/month budget", 
      "Department head decision - up to $10,000/month",
      "Executive committee required - enterprise-level decisions"
    ],
    weight: 4
  },
  {
    id: 'career-positioning',
    question: "Which best describes your current situation with AI?",
    subtitle: "Be honest - this affects the recommendations we provide",
    type: 'multiple-choice',
    options: [
      "Avoiding the topic - hoping someone else handles it",
      "Researching quietly - building knowledge before acting",
      "Actively exploring - evaluating options for my department", 
      "Leading initiatives - positioning myself as the AI champion"
    ],
    weight: 2
  },
  {
    id: 'biggest-fear',
    question: "What's your biggest fear about recommending new technology?",
    subtitle: "Understanding your concerns helps us provide better guidance",
    type: 'card-select',
    cards: [
      {
        title: "Initiative Failure",
        description: "Recommending something that doesn't work and damaging your reputation",
        value: "failure-risk",
        icon: "⚠️"
      },
      {
        title: "Team Resistance",
        description: "Your team pushes back and you're stuck managing conflict",
        value: "team-pushback",
        icon: "🤝"
      },
      {
        title: "Budget Waste",
        description: "Spending money on tools that don't deliver promised results",
        value: "budget-waste",
        icon: "💸"
      },
      {
        title: "Being Left Behind",
        description: "Staying safe while competitors and peers move ahead with AI",
        value: "competitive-lag",
        icon: "🏃‍♂️"
      }
    ],
    weight: 3
  },
  {
    id: 'success-metric',
    question: "What would make you feel like an AI initiative was successful for your career?",
    subtitle: "Think about how this would impact your professional standing",
    type: 'card-select',
    cards: [
      {
        title: "Team Recognition",
        description: "Your team is more productive and grateful for the improvements you brought",
        value: "team-appreciation",
        icon: "👥"
      },
      {
        title: "Leadership Praise", 
        description: "Your boss recognizes you as the person who solved a major problem",
        value: "executive-recognition",
        icon: "🏆"
      },
      {
        title: "Measurable Results",
        description: "Clear metrics you can point to in performance reviews and meetings",
        value: "quantifiable-impact",
        icon: "📈"
      },
      {
        title: "Industry Reputation",
        description: "Being known as the AI champion who successfully led digital transformation",
        value: "professional-reputation",
        icon: "🌟"
      }
    ],
    weight: 3,
    personalizable: true
  },
  {
    id: 'implementation-timeline',
    question: "What's your realistic timeline for implementing a new departmental tool?",
    subtitle: "Consider your team's capacity and other priorities",
    type: 'multiple-choice',
    options: [
      "This month - we need immediate relief from current problems",
      "Next quarter - planned implementation with proper preparation",
      "Next 6 months - strategic initiative with full change management",
      "Next year - part of annual planning and budget cycle"
    ],
    weight: 2
  },
  {
    id: 'department-focus',
    question: "Which area of your department would benefit most from AI assistance?",
    subtitle: "Think about where you spend the most time on manual or repetitive work",
    type: 'card-select',
    cards: [
      {
        title: "Data & Analytics",
        description: "Report generation, data analysis, trend identification, dashboard creation",
        value: "data-analytics",
        icon: "📊"
      },
      {
        title: "Customer Communications",
        description: "Email responses, support tickets, follow-ups, relationship management",
        value: "customer-comms",
        icon: "📧"
      },
      {
        title: "Project Management",
        description: "Status tracking, resource allocation, timeline management, coordination",
        value: "project-mgmt",
        icon: "📋"
      },
      {
        title: "Process Optimization",
        description: "Workflow improvements, quality control, compliance tracking, efficiency gains",
        value: "process-optimization",
        icon: "⚙️"
      }
    ],
    weight: 1
  },
  {
    id: 'department-size',
    question: "How many people report to you or work in your immediate area?",
    subtitle: "This helps us scale recommendations to your team management scope",
    type: 'multiple-choice',
    options: [
      "Just me - individual contributor looking to optimize personal workflow",
      "2-5 people - small team leader focused on team productivity",
      "6-15 people - department manager overseeing multiple functions",
      "16-50 people - senior manager with multiple teams or large department",
      "50+ people - director/VP level with complex organizational structure"
    ],
    weight: 2
  },
  {
    id: 'industry-sector',
    question: "Which industry best describes your primary business?",
    subtitle: "We'll provide AI recommendations specific to your sector",
    type: 'card-select',
    cards: [
      {
        title: "Technology/SaaS",
        description: "Software, tech services, digital platforms",
        value: "technology",
        icon: "💻"
      },
      {
        title: "Manufacturing",
        description: "Production, supply chain, industrial operations", 
        value: "manufacturing",
        icon: "🏭"
      },
      {
        title: "Healthcare/Life Sciences",
        description: "Medical services, pharmaceuticals, biotechnology",
        value: "healthcare",
        icon: "🏥"
      },
      {
        title: "Financial Services",
        description: "Banking, insurance, fintech, investment",
        value: "financial",
        icon: "🏦"
      },
      {
        title: "Retail/E-commerce",
        description: "Consumer goods, online retail, marketplace",
        value: "retail",
        icon: "🛒"
      },
      {
        title: "Professional Services",
        description: "Consulting, legal, accounting, marketing agencies",
        value: "services",
        icon: "💼"
      }
    ],
    weight: 3
  },
  {
    id: 'champion-obstacle',
    question: "What's your biggest obstacle to becoming the AI champion in your organization?",
    subtitle: "Select the barriers that most concern you about leading AI initiatives",
    type: 'multi-card-select',
    multiSelect: true,
    maxSelections: 3,
    cards: [
      {
        title: "Technical Knowledge Gap",
        description: "Not understanding AI capabilities well enough to make informed decisions",
        value: "knowledge-gap",
        icon: "🧠"
      },
      {
        title: "Budget Justification",
        description: "Difficulty proving ROI and getting financial approval for AI tools",
        value: "budget-approval",
        icon: "💰"
      },
      {
        title: "Change Management", 
        description: "Resistance from team members who prefer current processes",
        value: "team-resistance",
        icon: "🤝"
      },
      {
        title: "Vendor Selection",
        description: "Too many options, unclear which AI solutions are right for your needs",
        value: "vendor-confusion",
        icon: "🔍"
      },
      {
        title: "Implementation Risk",
        description: "Fear that AI project could fail and damage your professional reputation",
        value: "failure-fear", 
        icon: "⚠️"
      },
      {
        title: "Time Constraints",
        description: "Too busy with current responsibilities to properly evaluate and implement AI",
        value: "time-shortage",
        icon: "⏰"
      }
    ],
    weight: 4
  },
  {
    id: 'company-context',
    question: "What best describes your company's overall size and structure?",
    subtitle: "This helps us understand your organizational context and decision-making process",
    type: 'multiple-choice',
    options: [
      "Startup/Small Business - under 50 employees, informal structure",
      "Growing Company - 50-200 employees, establishing formal processes",  
      "Mid-size Corporation - 200-1000 employees, departmental structure",
      "Large Enterprise - 1000-5000 employees, complex hierarchy",
      "Fortune 500/Global - 5000+ employees, multiple divisions and locations"
    ],
    weight: 2
  },
  {
    id: 'current-tools',
    question: "Which business tools does your team use most frequently?",
    subtitle: "We'll recommend AI solutions that integrate with your existing stack",
    type: 'card-select',
    cards: [
      {
        title: "Microsoft Ecosystem",
        description: "Office 365, Teams, SharePoint, Dynamics",
        value: "microsoft",
        icon: "🔷"
      },
      {
        title: "Google Workspace",
        description: "Gmail, Drive, Sheets, Meet, Google Cloud",
        value: "google",
        icon: "🔍"
      },
      {
        title: "Salesforce/CRM Focus",
        description: "Salesforce, HubSpot, Pipedrive, customer management",
        value: "salesforce",
        icon: "☁️"
      },
      {
        title: "Creative/Design Tools",
        description: "Adobe Creative Suite, Figma, content creation",
        value: "creative",
        icon: "🎨"
      },
      {
        title: "Development/Technical",
        description: "AWS, GitHub, Jira, developer tools",
        value: "technical",
        icon: "🛠️"
      },
      {
        title: "Industry-Specific Software",
        description: "ERP systems, specialized industry platforms",
        value: "industry-specific",
        icon: "🏭"
      }
    ],
    weight: 3
  }
];

export function calculateScore(responses: Record<string, string | string[]>): number {
  let totalScore = 0;
  let totalWeight = 0;

  quizQuestions.forEach(question => {
    const response = responses[question.id];
    if (!response) return;

    let points = 0;
    let maxPoints = 5; // Default max points

    // Custom scoring for department-focused questions
    switch (question.id) {
      case 'department-challenge':
        // Higher scores for proactive vs reactive challenges
        const challengeMap: Record<string, number> = {
          'roi-pressure': 4, // Shows strategic thinking
          'budget-constraints': 3, // Shows leadership awareness
          'team-burden': 2, // Operational focus
          'career-protection': 1 // Defensive mindset
        };
        points = challengeMap[response as string] || 1;
        maxPoints = 4;
        break;

      case 'leadership-pressure':
        // Higher scores for more AI-forward organizations
        const pressureMap: Record<string, number> = {
          'Never mentioned - we focus on traditional approaches': 1,
          'Occasionally comes up in meetings - starting to explore': 2,
          'Regular agenda item - actively evaluating options': 3,
          'Top priority - immediate implementation expected': 4
        };
        points = pressureMap[response as string] || 1;
        maxPoints = 4;
        break;

      case 'career-positioning':
        // Higher scores for more proactive AI engagement
        const positionMap: Record<string, number> = {
          'Avoiding the topic - hoping someone else handles it': 1,
          'Researching quietly - building knowledge before acting': 2,
          'Actively exploring - evaluating options for my department': 3,
          'Leading initiatives - positioning myself as the AI champion': 4
        };
        points = positionMap[response as string] || 1;
        maxPoints = 4;
        break;

      case 'approval-process':
        // Higher scores for more decision-making authority
        const approvalMap: Record<string, number> = {
          'I can approve small tools directly - under $500/month': 4,
          'Need manager approval - up to $2,000/month budget': 3,
          'Department head decision - up to $10,000/month': 2,
          'Executive committee required - enterprise-level decisions': 1
        };
        points = approvalMap[response as string] || 1;
        maxPoints = 4;
        break;

      case 'implementation-timeline':
        // Higher scores for faster implementation capability
        const timelineMap: Record<string, number> = {
          'This month - we need immediate relief from current problems': 4,
          'Next quarter - planned implementation with proper preparation': 3,
          'Next 6 months - strategic initiative with full change management': 2,
          'Next year - part of annual planning and budget cycle': 1
        };
        points = timelineMap[response as string] || 1;
        maxPoints = 4;
        break;

      default:
        // Default scoring logic for other question types
        switch (question.type) {
          case 'multiple-choice':
            if (question.options && typeof response === 'string') {
              points = question.options.indexOf(response) + 1;
              maxPoints = question.options.length;
            }
            break;
          
          case 'scale':
          case 'slider':
            if (typeof response === 'string') {
              points = parseInt(response);
              maxPoints = question.scaleMax || 5;
            }
            break;
            
          case 'card-select':
            if (question.cards && typeof response === 'string') {
              // Find the card and assign points based on its position
              const cardIndex = question.cards.findIndex(card => card.value === response);
              points = cardIndex >= 0 ? cardIndex + 1 : 1;
              maxPoints = question.cards.length;
            }
            break;

          case 'multi-card-select':
            if (question.cards && Array.isArray(response)) {
              // For multi-select, calculate average position of selected cards
              let totalCardPoints = 0;
              response.forEach(val => {
                const cardIndex = question.cards!.findIndex(card => card.value === val);
                totalCardPoints += cardIndex >= 0 ? cardIndex + 1 : 1;
              });
              points = response.length > 0 ? totalCardPoints / response.length : 1;
              maxPoints = question.cards.length;
            }
            break;
            
          default:
            points = 1;
            maxPoints = 1;
        }
    }

    // Normalize to 0-1 scale, then apply weight
    const normalizedScore = points / maxPoints;
    totalScore += normalizedScore * question.weight;
    totalWeight += question.weight;
  });

  return Math.round((totalScore / totalWeight) * 100);
}