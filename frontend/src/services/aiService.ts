// AI Service - Connects to Backend Azure OpenAI API
// Falls back to contextual responses if API is unavailable

import { api } from './api';

export interface AIInsight {
  title: string;
  description: string;
  impact: string;
  confidence: number;
  type: 'optimization' | 'alert' | 'improvement';
}

// API Configuration
const USE_API = true;
let apiAvailable = true;
let conversationId: string | null = null;

const mockInsights: AIInsight[] = [
  {
    title: "Revenue Acceleration Detected",
    description: "Q4 revenue growth of 12.5% indicates strong market positioning. Engineering dept expansion driving 67% of new contracts.",
    impact: "+$240K ARR",
    confidence: 94,
    type: 'improvement'
  },
  {
    title: "Infrastructure Cost Optimization",
    description: "IT infrastructure running at 45% capacity. AI recommends consolidating 3 redundant tools and rightsizing cloud resources.",
    impact: "$72K/year savings",
    confidence: 89,
    type: 'optimization'
  },
  {
    title: "Client Retention Risk Alert",
    description: "2 enterprise clients showing decreased engagement. Proactive outreach recommended within 48 hours.",
    impact: "$180K at risk",
    confidence: 76,
    type: 'alert'
  }
];

export const generateInsights = async (data?: unknown): Promise<AIInsight[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockInsights;
};

// Contextual response generator (fallback when API unavailable)
const generateContextualResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('losing') && (lowerMessage.includes('money') || lowerMessage.includes('client'))) {
    return `🚨 **Unprofitable Client Analysis** - Found 3 clients costing you money:

**Gupta Innovations**
• Monthly cost: $13,200 vs Revenue: $12,000
• **Loss**: $1,200/month ($14,400 annually)

**Agarwal Tech Solutions**
• Monthly cost: $2,400 (excessive support tickets: 47 last month)
• Revenue: $1,800/month
• **Loss**: $600/month ($7,200 annually)

**Singh Enterprises**
• Underpriced legacy contract from 2019
• Current cost: $1,900, charging only $1,200
• **Loss**: $700/month ($8,400 annually)

**💰 Total Recovery Potential: $30,000+ annually**
**Immediate Actions**: Renegotiate contracts, implement scope controls, update pricing`;
  }

  if (lowerMessage.includes('revenue') || lowerMessage.includes('profit')) {
    return `📊 **Revenue Analysis**: Your MSP metrics show:
• **Total Revenue**: ~$243,000/month from 10 major clients
• **Profit Margin**: Varies from -10% to +38% across clients
• **Top Performers**: Agarwal Enterprises ($45K/mo), Verma Financial ($38K/mo)

**Growth opportunities**: 
• Upsell managed security services (+$50K potential)
• Expand cloud migration services (+$28K potential)
• Target enterprise clients in Finance & Healthcare sectors`;
  }

  if (lowerMessage.includes('team') || lowerMessage.includes('performance')) {
    return `👥 **Team Performance Analysis**:
• **Top Performer**: Sneha Gupta (Security) - 96% performance score
• **Most Tickets Resolved**: Vikram Singh (Support) - 203 tickets
• **Average Team Performance**: 90%+ across all departments

**Recommendations**:
• Invest in the Technical department (3 members, high output)
• Consider adding Support staff to reduce ticket backlog
• Security team operating at optimal capacity`;
  }

  if (lowerMessage.includes('anomal') || lowerMessage.includes('alert')) {
    return `🚨 **Current Anomalies Detected**:
• **HIGH**: AWS cost spike at Sharma Technologies (+127%, $12,400)
• **MEDIUM**: Unused licenses at Patel Manufacturing (22 licenses, $8,200 waste)
• **MEDIUM**: Storage capacity warning at Mehta Healthcare

**Recommended Actions**:
1. Investigate EC2 instances left running
2. Audit Microsoft 365 license usage
3. Review backup retention policies`;
  }

  return `🎯 **MSP Intelligence Summary**: Your business shows strong fundamentals:

**Current Performance**:
• 10 active clients across multiple industries
• ~$243,000 monthly revenue
• Strong team of 6 across Technical, Operations, Security, Support

**Top Opportunities**:
1. **Address Unprofitable Clients**: Gupta Innovations losing $1,200/month
2. **License Optimization**: Potential $8,200 savings from unused licenses
3. **Expand Security Services**: High-margin opportunity

Ask me about specific clients, team performance, anomalies, or revenue optimization!`;
};

export const sendChatMessage = async (message: string): Promise<string> => {
  // Try API first
  if (USE_API && apiAvailable) {
    try {
      const response = await api.sendChatMessage(message, conversationId || undefined);
      conversationId = response.conversation_id;
      return response.response;
    } catch (error) {
      console.warn('AI API unavailable, using contextual response:', error);
      apiAvailable = false;
    }
  }

  // Fallback to contextual responses
  return generateContextualResponse(message);
};

export const getOptimizationSuggestions = () => [
  {
    title: "Consolidate SaaS Tools",
    impact: "$48K/year",
    confidence: 92
  },
  {
    title: "Rightsize Cloud Infrastructure",
    impact: "$72K/year",
    confidence: 88
  },
  {
    title: "Automate Ticket Routing",
    impact: "$31K/year",
    confidence: 85
  }
];

// Reset conversation
export const resetConversation = () => {
  conversationId = null;
};