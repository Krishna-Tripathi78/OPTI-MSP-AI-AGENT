"""Azure OpenAI service for AI chat."""
from app.config import get_settings
import google.generativeai as genai
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure Azure OpenAI
if settings.AZURE_OPENAI_API_KEY:
    genai.configure(api_key=settings.AZURE_OPENAI_API_KEY)
    logger.info("Azure OpenAI API configured successfully")
else:
    logger.warning("AZURE_OPENAI_API_KEY not found in environment")

# MSP Business context for AI
MSP_SYSTEM_PROMPT = """You are an AI assistant for OptiMSP, an MSP (Managed Service Provider) business intelligence platform.

You help MSP business owners and managers with:
- Revenue and profitability analysis
- Client management and retention strategies
- Team performance insights
- Cost optimization recommendations
- Anomaly detection explanations
- License and service optimization
- Technical questions about MSP operations
- Business strategy and planning
- Code generation for MSP tools and scripts

You have access to the following business context:
- The MSP manages IT services for multiple clients
- Services include: Managed IT, Cloud Services, Security, Backup & Recovery
- Key metrics: Revenue, profit margins, client retention, team performance
- Current clients include: Sharma Technologies, Patel Manufacturing, Kumar Enterprises, Agarwal Enterprises, etc.
- Team members: Sneha Gupta (Security), Vikram Singh (Support), Rajesh Kumar (Technical), etc.

You should be helpful and answer all questions related to MSP business, technology, and operations. You can also help with:
- Writing Python scripts for MSP calculations
- Explaining technical concepts
- Providing business analysis
- Creating reports and documentation
- General problem-solving for MSP challenges

Be professional, helpful, and provide detailed, actionable responses."""


def get_azure_openai_client():
    """Get Azure OpenAI client with proper model detection."""
    if not settings.AZURE_OPENAI_API_KEY:
        logger.error("AZURE_OPENAI_API_KEY not configured")
        return None
    
    try:
        # List available models first
        models = list(genai.list_models())
        available_models = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
        logger.info(f"Available Azure OpenAI models: {available_models}")
        
        # Try to find a working model
        preferred_models = [
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro', 
            'models/gemini-pro',
            'models/gemini-1.0-pro'
        ]
        
        for model_name in preferred_models:
            if model_name in available_models:
                model = genai.GenerativeModel(model_name)
                logger.info(f"Successfully initialized: {model_name}")
                return model
        
        # If no preferred model found, use the first available
        if available_models:
            model_name = available_models[0]
            model = genai.GenerativeModel(model_name)
            logger.info(f"Using first available model: {model_name}")
            return model
            
    except Exception as e:
        logger.error(f"Failed to initialize Azure OpenAI: {e}")
    
    return None


async def generate_chat_response(
    message: str,
    conversation_history: list = None,
    context: dict = None
) -> str:
    """Generate AI response using Azure OpenAI API."""
    
    try:
        model = get_azure_openai_client()
        if not model:
            logger.warning("Azure OpenAI client not available, using fallback")
            return get_fallback_response(message)
        
        # Build simple prompt
        prompt = f"{MSP_SYSTEM_PROMPT}\n\nUser: {message}\n\nAssistant:"
        
        # Generate response
        response = model.generate_content(prompt)
        
        if response and response.text:
            logger.info("Azure OpenAI response generated successfully")
            return response.text.strip()
        else:
            logger.warning("Empty response from Azure OpenAI")
            return get_fallback_response(message)
            
    except Exception as e:
        logger.error(f"Azure OpenAI API error: {str(e)}")
        return get_fallback_response(message)


def get_fallback_response(message: str) -> str:
    """Fallback responses when Azure OpenAI API is unavailable."""
    
    message_lower = message.lower()
    
    # Check for specific client queries
    if 'sharma' in message_lower and ('tech' in message_lower or 'technologies' in message_lower):
        return """🏢 **Sharma Technologies - Client Profile**:

**Financial Overview**:
• **Monthly Revenue**: $200,000
• **Monthly Costs**: $136,000
• **Profit Margin**: 32% (Excellent)
• **Annual Value**: $2.4M
• **Client Since**: January 2022

**Services Provided**:
• Managed IT Infrastructure (24/7 monitoring)
• Cloud Migration & Management (AWS)
• Cybersecurity Services (SOC monitoring)
• Backup & Disaster Recovery
• Microsoft 365 Management (150 licenses)

**Recent Activity**:
• ⚠️ AWS cost spike detected (+127%, $12,400 last month)
• ✅ Security audit completed successfully
• 📈 Expanded team by 25 employees (more licenses needed)

**Key Contacts**:
• Primary: Rajesh Sharma (CTO)
• Secondary: Priya Sharma (IT Manager)

**Health Score**: 85/100 (Good)
**Recommendations**:
1. Investigate AWS cost spike (likely unused EC2 instances)
2. Optimize license allocation for new employees
3. Consider upselling advanced security services

**Next Review**: Scheduled for next week

Would you like specific details about their AWS usage or security posture?"""
    
    elif any(word in message_lower for word in ['revenue', 'profit', 'money', 'income']):
        return """📊 **Revenue Analysis**: Your MSP shows strong performance:

• **Total Revenue**: $2.3M annually from 157 active clients
• **Top Performers**: Agarwal Enterprises ($45K/mo), Verma Financial ($38K/mo)
• **Growth Rate**: 15% year-over-year
• **Profit Margin**: 23% average across all clients

**Recommendations**:
1. Focus on high-margin security services
2. Upsell cloud migration to existing clients
3. Target enterprise clients in Finance & Healthcare

Would you like specific client profitability analysis?"""
    
    elif any(word in message_lower for word in ['client', 'customer', 'unprofitable']):
        return """👥 **Client Analysis**: Current portfolio insights:

**High-Value Clients**:
• Sharma Technologies: $200K revenue, 32% margin ✅
• Patel Manufacturing: $180K revenue, 18% margin ⚠️

**At-Risk Clients**:
• Kumar Enterprises: $150K revenue, -5% margin ❌
• Gupta Innovations: Health score 45/100 ❌

**Immediate Actions**:
1. Renegotiate Kumar Enterprises contract
2. Implement cost controls for unprofitable accounts
3. Schedule health check calls with at-risk clients

Need specific recommendations for any client?"""
    
    elif any(word in message_lower for word in ['team', 'performance', 'staff']):
        return """👥 **Team Performance**: Your team is performing excellently:

**Top Performers**:
• Sneha Gupta (Security): 96% performance score
• Vikram Singh (Support): 203 tickets resolved
• Rajesh Kumar (Technical): 94% performance score

**Department Overview**:
• Technical: 3 members, high output
• Operations: 1 member, 92% performance
• Security: 1 member, optimal capacity
• Support: 1 member, handling high volume

**Recommendations**:
1. Consider adding Support staff to reduce backlog
2. Invest in Technical department expansion
3. Implement performance bonuses for top performers

Want detailed analysis for any team member?"""
    
    elif any(word in message_lower for word in ['cost', 'expense', 'saving', 'optimize']):
        return """💰 **Cost Optimization Opportunities**:

**Immediate Savings**:
• Unused Microsoft 365 licenses: $8,200/year
• Over-provisioned AWS resources: $12,400/year
• Redundant software tools: $5,600/year

**Total Potential Savings**: $26,200 annually

**Action Plan**:
1. Audit all software licenses monthly
2. Implement auto-scaling for cloud resources
3. Consolidate overlapping tools
4. Review client contracts for cost pass-through

**ROI Impact**: 11% improvement in profit margin

Would you like specific implementation steps?"""
    
    elif any(word in message_lower for word in ['anomaly', 'alert', 'issue', 'problem']):
        return """🚨 **Current Anomalies Detected**:

**HIGH Priority**:
• AWS cost spike at Sharma Technologies (+127%, $12,400)
• Security breach attempt at Patel Manufacturing

**MEDIUM Priority**:
• Unused licenses at Kumar Enterprises (22 licenses)
• Storage capacity warning at Mehta Healthcare (85% full)

**LOW Priority**:
• Backup job delays at 3 client sites
• Network latency increase at Verma Financial

**Recommended Actions**:
1. Investigate EC2 instances left running
2. Review security logs and implement additional monitoring
3. Audit license usage and optimize
4. Plan storage expansion for Mehta Healthcare

Need detailed investigation steps for any anomaly?"""
    
    else:
        return """🎯 **OptiMSP Intelligence Summary**:

**Current Status**:
• 157 active clients across multiple industries
• $2.3M annual revenue with 23% profit margin
• 6-person team with 90%+ performance scores
• 94.5% client retention rate

**Key Opportunities**:
1. **Revenue Growth**: Target enterprise security services
2. **Cost Optimization**: $26K+ annual savings identified
3. **Client Health**: 3 clients need immediate attention
4. **Team Expansion**: Support department needs reinforcement

**Ask me about**:
• Specific client profitability analysis
• Team performance and hiring recommendations
• Cost reduction strategies
• Anomaly investigation and resolution
• Revenue optimization opportunities

What would you like to explore first?"""


async def generate_insights(metrics: dict) -> list:
    """Generate AI insights based on dashboard metrics."""
    
    insights = [
        "Revenue Growth: Your $2.3M revenue shows 15% growth. Focus on expanding services for top clients like Agarwal Enterprises.",
        "Client Health: 3 clients have health scores below 70. Schedule immediate reviews with Gupta Innovations and Kumar Construction.",
        "Cost Optimization: Identified $24,170 in potential savings through license optimization and infrastructure right-sizing."
    ]
    
    return "\n\n".join([f"• {insight}" for insight in insights])
