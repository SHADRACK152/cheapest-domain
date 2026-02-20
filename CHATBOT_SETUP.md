# CheapestDomains AI Chatbot Setup

## 🤖 AI API Integration

The chatbot supports multiple free AI APIs. Choose one:

### Option 1: Groq (Recommended - Fastest & Most Generous Free Tier)
1. Visit: https://console.groq.com
2. Sign up for free account
3. Generate API key
4. Add to `.env.local`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

**Benefits:**
- ⚡ Extremely fast responses (< 1 second)
- 🎁 Generous free tier (14,400 requests/min)
- 🤖 Multiple models available (Mixtral, Llama)
- 💯 No credit card required

### Option 2: OpenAI (Backup)
1. Visit: https://platform.openai.com
2. Sign up and get API key
3. Add to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Option 3: Hugging Face (Alternative Free)
1. Visit: https://huggingface.co
2. Sign up for free
3. Generate access token
4. Use Inference API (free tier available)

## 🎯 Chatbot Features

### ✅ Implemented Features:
- **Website Knowledge**: Knows all domain pricing, features, and processes
- **User Personalization**: Recognizes logged-in users by name and account type
- **Chat History**: Saves conversations in localStorage
- **Quick Actions**: Pre-defined questions for easy interaction
- **Context Awareness**: Remembers last 10 messages for context
- **Multi-API Support**: Groq → OpenAI → Rule-based fallback
- **Responsive Design**: Works on desktop and mobile
- **Real-time Typing**: Shows typing indicator
- **Message Timestamps**: All messages timestamped
- **Chat Management**: Clear chat history, minimize/maximize

### 📚 Chatbot Knowledge Base:
- All domain pricing (.com, .co.ke, .io, etc.)
- WHOIS privacy protection pricing
- Registration process (step-by-step)
- Domain transfer process
- Payment methods accepted
- Account features and dashboard
- Support contact information
- Company details

### 🎨 UI Features:
- Floating chat button with hover animation
- Slide-in chat window
- User/bot avatars with colors
- Message bubbles with timestamps
- Quick action buttons
- Minimize/maximize toggle
- Clear chat functionality
- Loading states and animations

## 🔧 Configuration

### Environment Variables (.env.local):
```env
# Choose one or both (Groq is primary, OpenAI is fallback)
GROQ_API_KEY=gsk_your_key_here
OPENAI_API_KEY=sk-your_key_here
```

### Without API Keys:
The chatbot will use rule-based responses as a fallback. It can still answer:
- Pricing questions
- Transfer process
- Payment methods
- Registration process
- Support information

## 🚀 Usage

1. **Visitors (Not Logged In)**:
   - Get general help about domains, pricing, and processes
   - Encouraged to create account for better service
   - Access to all information

2. **Logged-In Users**:
   - Personalized greetings with name
   - Account-specific information
   - Dashboard guidance
   - Better context for questions

## 📊 API Rate Limits

### Groq (Free Tier):
- 14,400 requests per minute
- 30 requests per second
- Mixtral-8x7b model
- No credit card required

### OpenAI (Paid):
- Varies by plan
- GPT-3.5-turbo recommended
- Pay per token

### Fallback (No API):
- Unlimited (rule-based)
- Good for basic questions
- No external dependencies

## 🎯 Customization

### Add More Knowledge:
Edit `src/app/api/chat/route.ts` and update the `WEBSITE_CONTEXT` constant.

### Change AI Model:
In the same file, modify the `model` parameter in the API call:
```typescript
model: 'mixtral-8x7b-32768', // Groq models
// or
model: 'gpt-3.5-turbo', // OpenAI models
```

### Add Custom Rules:
Update `getRuleBasedResponse()` function for fallback responses.

## 🐛 Troubleshooting

1. **Chat not responding**: Check API key in `.env.local`
2. **Slow responses**: Try Groq instead of OpenAI
3. **Generic responses**: API key not configured, using fallback
4. **Error messages**: Check API rate limits or quota

## 🌟 Future Enhancements

Potential improvements:
- [ ] Admin chat monitoring dashboard
- [ ] Chat analytics and insights
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] File attachment support
- [ ] Integration with support ticket system
- [ ] Sentiment analysis
- [ ] Suggested responses

## 📱 Mobile Experience

The chatbot is fully responsive:
- Fixed positioning on mobile
- Touch-friendly interface
- Proper z-index layering
- Smooth animations
- Keyboard-aware scrolling
