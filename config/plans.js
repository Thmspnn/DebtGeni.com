const defaultPlans = [
  {
    name: 'Basic',
    price: 19.99,
    interval: 'monthly',
    description: 'Essential tools for personal finance management',
    features: [
      { key: 'budget_tracking', access: 'full' },
      { key: 'expense_analysis', access: 'limited' },
      { key: 'debt_calculator', access: 'full' },
      { key: 'coaching_calls', access: 'limited' },
      { key: 'investment_tools', access: 'none' },
      { key: 'ai_insights', access: 'none' }
    ]
  },
  {
    name: 'Pro',
    price: 49.99,
    interval: 'monthly',
    description: 'Advanced features for serious wealth builders',
    features: [
      { key: 'budget_tracking', access: 'full' },
      { key: 'expense_analysis', access: 'full' },
      { key: 'debt_calculator', access: 'full' },
      { key: 'coaching_calls', access: 'full' },
      { key: 'investment_tools', access: 'limited' },
      { key: 'ai_insights', access: 'limited' }
    ]
  },
  {
    name: 'Elite',
    price: 99.99,
    interval: 'monthly',
    description: 'Complete financial transformation suite',
    features: [
      { key: 'budget_tracking', access: 'full' },
      { key: 'expense_analysis', access: 'full' },
      { key: 'debt_calculator', access: 'full' },
      { key: 'coaching_calls', access: 'full' },
      { key: 'investment_tools', access: 'full' },
      { key: 'ai_insights', access: 'full' }
    ]
  }
];

const defaultFeatures = [
  {
    name: 'Budget Tracking',
    key: 'budget_tracking',
    description: 'Track income, expenses, and savings goals',
    category: 'core',
    limitedAccess: {
      maxUsage: 5,
      timeFrame: 'monthly',
      description: 'Create up to 5 budget categories per month'
    }
  },
  {
    name: 'Expense Analysis',
    key: 'expense_analysis',
    description: 'Detailed analysis of spending patterns',
    category: 'analytics',
    limitedAccess: {
      maxUsage: 3,
      timeFrame: 'monthly',
      description: 'Generate up to 3 expense reports per month'
    }
  },
  {
    name: 'Debt Calculator',
    key: 'debt_calculator',
    description: 'Calculate debt payoff strategies',
    category: 'tools',
    limitedAccess: {
      maxUsage: 10,
      timeFrame: 'monthly',
      description: 'Calculate up to 10 debt scenarios per month'
    }
  },
  {
    name: 'Coaching Calls',
    key: 'coaching_calls',
    description: '1-on-1 financial coaching sessions',
    category: 'support',
    limitedAccess: {
      maxUsage: 1,
      timeFrame: 'monthly',
      description: '1 coaching call per month'
    }
  },
  {
    name: 'Investment Tools',
    key: 'investment_tools',
    description: 'Investment portfolio analysis and recommendations',
    category: 'tools',
    limitedAccess: {
      maxUsage: 5,
      timeFrame: 'monthly',
      description: 'Analyze up to 5 investment scenarios per month'
    }
  },
  {
    name: 'AI Insights',
    key: 'ai_insights',
    description: 'AI-powered financial insights and recommendations',
    category: 'analytics',
    limitedAccess: {
      maxUsage: 20,
      timeFrame: 'monthly',
      description: 'Generate up to 20 AI insights per month'
    }
  }
];

module.exports = {
  defaultPlans,
  defaultFeatures
};
