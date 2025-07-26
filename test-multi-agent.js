// Simple test script for the multi-agent system
const { generateAIReportWithAgents } = require('./src/lib/ai-agents/index.ts');

async function testMultiAgent() {
  const testContext = {
    email: 'test@autou.com',
    company: 'AutoU',
    jobTitle: 'Operations Manager',
    score: 65,
    responses: {
      'industry-sector': 'Technology/SaaS',
      'department-size': '6-15 people',
      'department-challenge': 'team-burden',
      'approval-process': 'manager approval required',
      'implementation-timeline': 'next quarter',
      'operational-challenges': 'We spend too much time creating reports manually every week. The team has to compile data from 5 different systems and format everything by hand. This takes about 8 hours per week and often has errors.'
    },
    language: 'en'
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.log('❌ ANTHROPIC_API_KEY not found');
    return;
  }

  console.log('🧪 Testing Multi-Agent System...');
  
  try {
    const result = await generateAIReportWithAgents(testContext, apiKey);
    
    if (result.success) {
      console.log('✅ Multi-Agent System Working!');
      console.log('⏱️  Execution Time:', result.executionTime + 'ms');
      console.log('🤖 Agents Used:', result.agentsUsed.join(', '));
      console.log('📊 Report Generated:', !!result.report);
      
      if (result.report) {
        console.log('\n--- SAMPLE OUTPUT ---');
        console.log('Executive Summary:', result.report.executive_summary.substring(0, 150) + '...');
        console.log('Department Challenges:', result.report.department_challenges.length);
        console.log('Quick Wins:', result.report.quick_wins.month_1_actions.length);
        console.log('Roadmap Phases:', result.report.implementation_roadmap.length);
      }
    } else {
      console.log('❌ Multi-Agent System Failed');
      console.log('Error:', result.error);
      console.log('Execution Time:', result.executionTime + 'ms');
    }
    
  } catch (error) {
    console.log('❌ Test Error:', error.message);
  }
}

testMultiAgent();