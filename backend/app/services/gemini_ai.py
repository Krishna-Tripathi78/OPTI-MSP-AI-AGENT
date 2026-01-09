"""Azure AI service for AI chat."""
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()

# Configure Azure AI
api_key = settings.AZURE_OPENAI_API_KEY or settings.AZURE_API_KEY
genai.configure(api_key=api_key)

# MSP Business context for AI
MSP_SYSTEM_PROMPT = """You are an AI assistant for OptiMSP, an MSP (Managed Service Provider) business intelligence platform.

You help MSP business owners and managers with:
- Revenue and profitability analysis
- Client management and retention strategies
- Team performance insights
- Cost optimization recommendations
- Anomaly detection explanations
- License and service optimization

You have access to the following business context:
- The MSP manages IT services for multiple clients
- Services include: Managed IT, Cloud Services, Security, Backup & Recovery
- Key metrics: Revenue, profit margins, client retention, team performance

Be helpful, concise, and provide actionable insights. Use specific numbers when available.
Always be professional but friendly."""


async def generate_chat_response(
    message: str,
    conversation_history: list = None,
    context: dict = None
) -> str:
    """Generate a response from Azure OpenAI."""
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Build prompt with context
        full_prompt = MSP_SYSTEM_PROMPT + "\n\n"
        
        # Add context if provided
        if context:
            full_prompt += f"Current business context:\n{context}\n\n"
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-6:]:  # Last 6 messages
                role = "Human" if msg["role"] == "user" else "Assistant"
                full_prompt += f"{role}: {msg['content']}\n"
        
        # Add current message
        full_prompt += f"Human: {message}\nAssistant:"
        
        response = model.generate_content(full_prompt)
        return response.text
        
    except Exception as e:
        print(f"Azure OpenAI error: {e}")
        return "I'm having trouble connecting to the AI service. Please try again later."


async def generate_insights(metrics: dict) -> str:
    """Generate AI insights based on dashboard metrics."""
    
    prompt = f"""Based on the following MSP business metrics, provide 3 actionable insights:
    
Revenue: ${metrics.get('total_revenue', 0):,.2f}
Clients: {metrics.get('total_clients', 0)}
Retention Rate: {metrics.get('retention_rate', 0)}%
Profit Margin: {metrics.get('profit_margin', 0)}%
Open Tickets: {metrics.get('open_tickets', 0)}
Anomalies: {metrics.get('anomalies_count', 0)}

Format each insight as:
- Title: Brief title
- Description: 1-2 sentences explaining the insight
- Action: What to do about it"""

    response = await generate_chat_response(prompt)
    return response