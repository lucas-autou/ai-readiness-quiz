// Test script to validate new quiz questions
const newQuizResponses = {
  'time-consuming-process': 'reporting-analytics',
  'weekly-hours-wasted': '40',
  'process-error-cost': 'high-impact',
  'monthly-budget-available': 'R$ 2.000-10.000/mês - Preciso de aprovação do diretor',
  'current-tech-stack': ['spreadsheets', 'crm', 'analytics'],
  'success-metric': 'cost-savings',
  'implementation-urgency': '90 dias - Fim do trimestre, preciso de quick wins',
  'team-impact-size': '21-50 pessoas - Múltiplas equipes',
  'industry-sector': 'technology',
  'biggest-ai-concern': 'data-security',
  'specific-process-description': 'Todo dia extraio dados de vendas do Salesforce (30min), copio para Excel (15min), cruzo com dados do ERP (45min), formato relatório no PowerPoint (2h), envio para 5 gerentes aprovarem. Se alguém pede mudança, refaço tudo. Total: 4h/dia. Isso acontece para 3 analistas da minha equipe, então são 12h/dia só nisso!'
};

// Log the quiz data
console.log('=== NEW QUIZ RESPONSES ===');
console.log(JSON.stringify(newQuizResponses, null, 2));

// Calculate expected savings
const weeklyHours = parseInt(newQuizResponses['weekly-hours-wasted']);
const hoursSaved = weeklyHours * 0.7; // 70% automation
const monthlySavings = hoursSaved * 4 * 150; // R$150/hour

console.log('\n=== EXPECTED CALCULATIONS ===');
console.log(`Weekly hours wasted: ${weeklyHours}`);
console.log(`Hours that can be saved (70%): ${hoursSaved}`);
console.log(`Monthly cost savings: R$ ${monthlySavings.toLocaleString('pt-BR')}`);

// Test the API endpoint
async function testQuizSubmission() {
  const testData = {
    email: 'test@example.com',
    company: 'Tech Solutions Ltd',
    jobTitle: 'Operations Manager',
    responses: newQuizResponses,
    score: 75,
    language: 'pt'
  };

  try {
    const response = await fetch('http://localhost:3000/api/submit-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('\n=== API RESPONSE ===');
    console.log('Success:', result.success);
    console.log('Has Report:', result.hasReport);
    
    if (result.aiReport) {
      const report = JSON.parse(result.aiReport);
      console.log('\n=== GENERATED REPORT PREVIEW ===');
      console.log('Executive Summary:', report.executive_summary?.substring(0, 200) + '...');
      console.log('Challenges:', report.department_challenges?.slice(0, 2));
      console.log('Quick Wins:', report.quick_wins?.month_1_actions);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testQuizSubmission();