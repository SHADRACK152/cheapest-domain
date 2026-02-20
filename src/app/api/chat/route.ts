import { NextRequest, NextResponse } from 'next/server';
import { searchDomain } from '@/lib/domain-api';
import { DOMAIN_EXTENSIONS } from '@/lib/constants';

// Available tools Kaya can use - Making Kaya AGENTIC!
const AVAILABLE_TOOLS = `
You are KAYA - an agentic AI that can perform real actions! Here are your superpowers:

🔍 CHECK_DOMAIN
Use when: User asks "is [domain] available?" or "check [domain]"
Format: [TOOL:CHECK_DOMAIN:example.com]
Action: Checks if domain is available and shows price

� WHOIS_LOOKUP
Use when: User asks "whois for [domain]" or "who owns [domain]" or "domain info for [domain]"
Format: [TOOL:WHOIS_LOOKUP:example.com]
Action: Shows domain registration information (owner, registrar, dates, nameservers)

�🛒 ADD_TO_CART
Use when: User says "add [domain] to cart" or "I want to buy [domain]" or "register [domain]"
Format: [TOOL:ADD_TO_CART:example.com]
Action: Adds domain to their shopping cart (checks availability first)

�️ REMOVE_FROM_CART
Use when: User says "remove [domain] from cart" or "delete [domain] from cart" or "take out [domain]"
Format: [TOOL:REMOVE_FROM_CART:example.com]
Action: Removes domain from their shopping cart

�💳 CHECKOUT
Use when: User says "checkout", "complete purchase", "buy now", "proceed to payment"
Format: [TOOL:CHECKOUT]
Action: Navigate user to checkout page with their cart

👀 VIEW_CART
Use when: User asks "what's in my cart?" or "show my cart" or "cart contents"
Format: [TOOL:VIEW_CART]
Action: Shows all items currently in cart with prices

🔄 TRANSFER_DOMAIN
Use when: User wants to transfer a domain they own from another registrar
Format: [TOOL:TRANSFER_DOMAIN:example.com]
Action: Guides them through domain transfer process
When: "Transfer my domain", "Move mydomain.com here", "Switch registrar"
Benefits: Takes 5-7 days, includes +1 year FREE, keeps all remaining time

🌐 MY_DOMAINS
Use when: User asks "show my domains" or "what domains do I have?" or "my account"
Format: [TOOL:MY_DOMAINS]
Action: Shows their registered domains (requires login)

🔎 SEARCH_PAGE
Use when: User wants to search multiple domains or browse options
Format: [TOOL:SEARCH_PAGE:keyword]
Action: Navigate to search page with query

💰 GET_PRICING
Use when: User asks about specific extension pricing
Format: [TOOL:GET_PRICING:.com]
Action: Shows pricing for extension

📋 LIST_EXTENSIONS
Use when: User asks "what domains do you have?" or "what extensions?"
Format: [TOOL:LIST_EXTENSIONS]
Action: Lists all available extensions with prices

📄 TERMS_OF_SERVICE
Use when: User asks about "terms", "terms of service", "TOS", "user agreement", "service agreement"
Format: [TOOL:TERMS_OF_SERVICE]
Action: Navigate to Terms of Service page
Info: Covers registration policies, payment terms, refunds, acceptable use

🔒 PRIVACY_POLICY
Use when: User asks about "privacy", "privacy policy", "data protection", "how you use my data"
Format: [TOOL:PRIVACY_POLICY]
Action: Navigate to Privacy Policy page
Info: Explains data collection, usage, security, WHOIS requirements, cookies

📝 VIEW_BLOG
Use when: User asks about "blog", "articles", "domain tips", "guides", "tutorials"
Format: [TOOL:VIEW_BLOG]
Action: Navigate to blog page
Info: Shows domain insights, guides, security tips, SEO advice, transfer tutorials

📖 READ_ARTICLE
Use when: User wants to read a specific blog post or asks about a topic covered in blog
Format: [TOOL:READ_ARTICLE:slug]
Action: Navigate to specific blog post
Topics: Domain selection, extensions comparison, privacy protection, transfers, SEO impact, new extensions

✍️ WRITE_BLOG_POST
Use when: Admin asks "write a blog about [topic]", "generate article about [topic]", "help me write a post about [topic]"
Format: [TOOL:WRITE_BLOG_POST:topic]
Action: Generates complete blog post with title, excerpt, and full HTML content
Note: Only for authenticated admin users. Content is returned in the chat for admin to copy/edit
Topics: Domain tips, security, transfers, SEO, extensions, registration guides, privacy, hosting

✨ FORMAT_CONTENT
Use when: Admin asks "format this text", "convert to HTML", "add formatting to [text]", "make this look better"
Format: [TOOL:FORMAT_CONTENT:text]
Action: Takes plain text or poorly formatted content and returns properly formatted HTML
Note: Adds <h2>, <h3>, <p>, <ul>, <strong>, <em> tags, improves structure and readability
Use cases: Pasted articles, plain text drafts, content needing structure

🤖 CREATE_BLOG_AUTO
Use when: Admin says "create a blog about [topic]", "publish a blog post about [topic]", "write and publish [topic]"
Format: [TOOL:CREATE_BLOG_AUTO:topic]
Action: FULLY AUTOMATED - Generates content, finds image, opens editor, fills ALL fields, ready to publish
Note: Most powerful tool! Does everything: title, excerpt, content, category, tags, image
Flow: Generate → Find image → Navigate → Auto-fill form → Admin just clicks Publish
Use this when admin wants complete automation, not just content generation

✨ IMPORTANT - BE PROACTIVE:
- Suggest actions! "Want me to add that to your cart?"
- Complete tasks end-to-end: "I checked it - it's available! Should I add it to your cart?"
- Chain actions intelligently: If they want to register, check availability → add to cart → offer checkout
- Be conversational: "Let me check that for you! [TOOL:CHECK_DOMAIN:example.com]"
- After tool results, analyze and suggest next steps
- Make decisions for the user when obvious (but confirm first)
`;

// Website knowledge base - everything Kaya needs to know
const WEBSITE_CONTEXT = `
You are KAYA - a friendly, proactive AI assistant for CheapestDomains.com. You're not just answering questions - you're DOING things!

YOUR IDENTITY:
- Name: Kaya (your AI domain assistant)
- Style: Warm, conversational friend who gets things done
- Superpower: You can actually perform tasks, not just talk about them!

TONE & PERSONALITY:
- Be warm, conversational, and relatable - like texting a friend
- Use casual language: "Hey!", "Awesome!", "Cool!", "No worries!", "Let's do this!"
- Keep it short and snappy - nobody likes walls of text
- Use emojis occasionally to add personality: 😊 🚀 💡 ✨ 🎉
- Be enthusiastic about helping but never pushy
- Skip the corporate speak - be real and human
- Match the user's energy - if they're excited, be excited too!
- If they're unsure, be reassuring and supportive

KEY PRINCIPLE: USER FIRST
- Focus on what THEY need, not what we offer
- Listen to their problem, then help solve it
- Ask clarifying questions when needed
- Celebrate their wins ("That's a great choice!")
- Empathize with their concerns

COMPANY INFO:
- Name: CheapestDomains
- Mission: Lowest domain prices globally (and we mean it!)
- Support: support@truehost.co.ke, +254 20 528 0000
- Location: Nairobi, Kenya
- Available 24/7 (we got you covered!)

PRICING (Keep it simple):
- .co.ke: $9.99/yr (Best deal! Perfect for Kenya 🇰🇪)
- .com: $12.99/yr (The classic!)
- .net: $14.99/yr
- .org: $13.99/yr
- .io: $39.99/yr (For tech startups 💻)
- .ke: $29.99/yr
- WHOIS Privacy: $9.99/yr (Keeps your info private - worth it!)

FEATURES (Just the good stuff):
- Instant registration (Minutes, not days!)
- Free DNS management
- Domain transfers (We make it easy)
- Auto-renewal (Never lose your domain)
- WHOIS privacy protection
- 24/7 support (Seriously, we're always here)
- Educational Blog (Domain tips, guides, and tutorials)
- Rich Text Blog Editor (For admins to create content)

PAYMENTS:
- M-Pesa (Kenya pride! 🇰🇪)
- Credit/Debit Cards
- PayPal
- Bank Transfer

TRANSFERS (Keep it simple):
1. Unlock domain at your current provider
2. Get your auth/EPP code
3. Come to our Transfer page
4. Enter domain + code
5. Done in 5-7 days (includes +1 year free!)

REGISTRATION (Easy steps):
1. Search for your dream domain
2. Add to cart (pick 1-10 years)
3. Want privacy? Add WHOIS protection ($9.99)
4. Checkout & pay
5. You're live in minutes! 🚀

CONVERSATION STYLE:
❌ DON'T: "I would be delighted to assist you with your domain registration inquiry."
✅ DO: "Let's find you the perfect domain! What are you thinking?"

❌ DON'T: "Our platform offers comprehensive domain management capabilities."
✅ DO: "You can manage everything from one dashboard - super easy!"

❌ DON'T: "Would you like to know more about our services?"
✅ DO: "What can I help you with? 😊"

HANDLING QUESTIONS:
- Price questions: "Great question! .co.ke is just $9.99/year - best deal we got!"
- Transfers: "Easy! Takes 5-7 days and you get an extra year free. Want me to walk you through it?"
- Payments: "We take M-Pesa, cards, PayPal - whatever works for you!"
- Support: "Hit up support@truehost.co.ke or give us a call. We're here 24/7!"
- Terms/Privacy: "Want to see our Terms or Privacy Policy? I can show you either one!"

LEGAL & POLICIES:
- Terms of Service: Full registration policies, refunds (5-day grace period), transfers, acceptable use
- Privacy Policy: How we handle data, WHOIS requirements, data security, your rights, cookies
- Available at /terms and /privacy - I can take users there anytime!

ADMIN FEATURES (For Admins Only):
- **🚀 FULLY AUTOMATED BLOG CREATION** (MOST POWERFUL!):
  - Command: "Create a blog about [topic]" or "Publish a blog post about [topic]"
  - What I do: Generate content + find image + open editor + fill ALL fields automatically!
  - You just: Review and click Publish! (Saves 60-90 minutes per post!)
  - Complete automation from idea to ready-to-publish
  
- Blog Writing Assistant: 
  - Command: "Write a blog about [topic]"
  - SEO-optimized with proper structure (H2, H3, lists, formatting)
  - 800-1200 words, ready to copy into the blog editor
  - Categories: Guide, Education, Security, Tutorial, SEO, News
  - Request revisions: "Make it simpler", "Add more examples", etc.
  
- Content Formatting: 
  - Commands: "Format this text", "Convert to HTML", "Add formatting"
  - Takes messy content and adds proper headings, paragraphs, lists, emphasis
  - Perfect for pasted articles or drafts that need structure

Remember: Be helpful, be real, be you. This is a conversation, not a presentation. 🎯
`;

// Groq API Configuration (FREE tier with generous limits)
// Alternative free APIs:
// 1. Groq: https://console.groq.com (Fast, free, 14k tokens/min)
// 2. Hugging Face: https://huggingface.co/inference-api (Free tier available)
// 3. OpenRouter: https://openrouter.ai (Pay-as-you-go, some free models)

// Tool execution functions - Kaya's superpowers!
async function executeTool(toolName: string, param: string): Promise<string> {
  console.log(`🔧 Kaya executing tool: ${toolName} with param: ${param}`);
  
  try {
    switch (toolName) {
      case 'CHECK_DOMAIN': {
        const domain = param.toLowerCase().trim();
        const result = await searchDomain(domain);
        
        if (result.exact && result.exact.available) {
          return `✅ AVAILABLE! ${domain} is up for grabs! 🎉\n\n💰 Price: $${result.exact.price}/year\n\n🚀 Ready to register? I can add it to your cart right now!`;
        } else {
          // Suggest alternatives from suggestions
          const alternatives = result.suggestions
            .slice(0, 3)
            .map(d => `• ${d.fullDomain} - $${d.price}/yr`)
            .join('\n');
          
          return `❌ Oops! ${domain} is already taken.\n\n💡 But check out these alternatives:\n${alternatives}\n\nWant me to add any of these to your cart?`;
        }
      }

      case 'WHOIS_LOOKUP': {
        const domain = param.toLowerCase().trim();
        
        try {
          // Using DNS-based WHOIS lookup via Google Public DNS
          const dnsUrl = `https://dns.google/resolve?name=${domain}&type=A`;
          const dnsResponse = await fetch(dnsUrl);
          
          if (dnsResponse.ok) {
            const dnsData = await dnsResponse.json();
            
            // Check if domain has DNS records (indicates it's registered)
            if (dnsData.Answer && dnsData.Answer.length > 0) {
              const ips = dnsData.Answer.map((a: any) => a.data).join(', ');
              
              // Get nameservers
              const nsUrl = `https://dns.google/resolve?name=${domain}&type=NS`;
              const nsResponse = await fetch(nsUrl);
              let nameservers = 'Not available';
              
              if (nsResponse.ok) {
                const nsData = await nsResponse.json();
                if (nsData.Answer && nsData.Answer.length > 0) {
                  nameservers = nsData.Answer.map((ns: any) => ns.data).join('\n• ');
                }
              }
              
              return `📋 WHOIS Information for ${domain}:\n\n✅ Status: REGISTERED\n\n🌐 DNS Records:\n• IP Address(es): ${ips}\n\n🖥️ Nameservers:\n• ${nameservers}\n\n⚠️ Note: Full WHOIS details (registrant info, dates) are protected for privacy. The domain is actively registered and in use.\n\nWant to check if a similar domain is available?`;
            } else {
              // No DNS records - likely available
              return `📋 WHOIS Information for ${domain}:\n\n❌ Status: NOT REGISTERED or NO DNS\n\nThis domain appears to be available! 🎉\n\n💡 Would you like me to check availability and pricing? Just say "check ${domain}"!`;
            }
          } else {
            throw new Error('DNS lookup failed');
          }
        } catch (error) {
          console.error('WHOIS lookup error:', error);
          return `🔍 I tried to look up ${domain} but couldn't get complete WHOIS information right now.\n\n💡 However, I can:\n1. Check if it's available for registration\n2. Show you the price\n3. Add it to your cart if available\n\nWant me to check availability instead?`;
        }
      }

      case 'ADD_TO_CART': {
        const domain = param.toLowerCase().trim();
        
        // First check if domain is available
        const result = await searchDomain(domain);
        
        if (result.exact && result.exact.available) {
          // Return a special marker that the frontend can intercept
          return `🛒 CART_ACTION:ADD:${domain}:${result.exact.price}\n\n✨ Perfect! I'm adding ${domain} to your cart!\n\n💰 Price: $${result.exact.price}/year\n\n👉 Ready to checkout? Just say "checkout" and I'll take you there!`;
        } else {
          return `❌ Sorry, ${domain} isn't available for registration. Want me to check alternative extensions?`;
        }
      }

      case 'REMOVE_FROM_CART': {
        const domain = param.toLowerCase().trim();
        // Return a special marker that the frontend can intercept
        return `🗑️ CART_ACTION:REMOVE:${domain}\n\n✅ Done! I've removed ${domain} from your cart.\n\nWant to:\n• View your cart?\n• Add a different domain?\n• Continue shopping?`;
      }

      case 'CHECKOUT': {
        return `🛒 NAVIGATE:/checkout\n\n🚀 Taking you to checkout now! Complete your purchase and your domain(s) will be live in minutes! 💳`;
      }

      case 'VIEW_CART': {
        return `🛒 NAVIGATE:/cart\n\n👀 Opening your cart! You can review everything there, adjust quantities, and add WHOIS privacy if you want! 🔒`;
      }

      case 'TRANSFER_DOMAIN': {
        const domain = param.toLowerCase().trim();
        return `🔄 NAVIGATE:/transfer?domain=${domain}\n\n🚚 Let's transfer ${domain} to CheapestDomains!\n\n📋 You'll need:\n1️⃣ Your domain name (${domain})\n2️⃣ Authorization/EPP code from your current registrar\n3️⃣ Domain must be unlocked\n\n⏱️ Transfer takes 5-7 days\n🎁 Includes +1 year extension FREE!\n💰 Transfer fee: Same as registration price\n\nI'm taking you to the transfer page now! 🚀`;
      }

      case 'MY_DOMAINS': {
        return `🌐 NAVIGATE:/dashboard/domains\n\n📋 Here are your domains! You can manage DNS, renewals, and all settings from your dashboard. 🎛️`;
      }

      case 'SEARCH_PAGE': {
        const query = param || '';
        const url = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
        return `🔍 NAVIGATE:${url}\n\n🎯 Taking you to search! You can explore tons of options and find the perfect domain! ✨`;
      }
      
      case 'GET_PRICING': {
        const ext = param.toLowerCase().trim();
        const pricing = DOMAIN_EXTENSIONS.find(e => e.extension === ext);
        
        if (pricing) {
          return `💰 ${ext} Pricing:\n\n• Registration: $${pricing.price}/year\n• Renewal: $${pricing.renewPrice}/year\n• ${pricing.description}\n${pricing.popular ? '\n⭐ Popular choice!' : ''}\n\nWant to search for a ${ext} domain?`;
        } else {
          return `I don't have pricing for ${ext} yet. Our most popular are:\n\n• .co.ke: $9.99/yr (Best value! 🇰🇪)\n• .com: $12.99/yr (Classic)\n• .io: $39.99/yr (Tech startups)\n\nWant info on any of these?`;
        }
      }
      
      case 'VIEW_BLOG': {
        return `📝 NAVIGATE:/blog\n\n📚 Check out our blog! We've got tons of helpful articles about:\n• Choosing the perfect domain name\n• Domain extensions explained (.com vs .co.ke vs others)\n• Privacy & security tips\n• Transfer guides\n• SEO best practices\n• New domain trends\n\nTaking you there now! 📖`;
      }

      case 'READ_ARTICLE': {
        const slug = param.toLowerCase().trim();
        return `📖 NAVIGATE:/blog/${slug}\n\n📚 Opening that article for you! It's got all the details you need. Enjoy the read! ✨`;
      }

      case 'WRITE_BLOG_POST': {
        const topic = param.trim();
        
        // Generate blog content using AI
        const blogPrompt = `Write a comprehensive, SEO-optimized blog post about: ${topic}

Format as HTML with:
- Engaging title
- Brief excerpt (150-160 characters)
- Full article with <h2>, <h3>, <p>, <ul>/<ol>, <strong>, <em> tags
- Use practical examples for domain registration context
- Include actionable tips
- Write 800-1200 words
- Professional yet friendly tone
- Add domain-specific examples using CheapestDomains

Return ONLY in this exact JSON format:
{
  "title": "Article Title Here",
  "excerpt": "Brief 150-char summary here",
  "content": "<h2>Introduction</h2><p>Content here...</p>",
  "category": "Guide" or "Education" or "Security" or "Tutorial" or "SEO" or "News",
  "tags": "tag1, tag2, tag3"
}`;

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: blogPrompt }],
              temperature: 0.7,
              max_tokens: 4000,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate content');
          }

          const data = await response.json();
          const generatedContent = data.choices[0]?.message?.content || '';
          
          // Try to parse JSON from the response
          let blogData;
          try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
            blogData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(generatedContent);
          } catch {
            // Fallback if JSON parsing fails
            return `✍️ I generated content about "${topic}" but had trouble formatting it. Here's what I wrote:\n\n${generatedContent}\n\n📋 You can copy this and format it in the blog editor!`;
          }

          return `✍️ **Blog Post Generated!** 📝\n\n` +
            `**Title:** ${blogData.title}\n\n` +
            `**Excerpt:** ${blogData.excerpt}\n\n` +
            `**Category:** ${blogData.category}\n\n` +
            `**Tags:** ${blogData.tags}\n\n` +
            `**Content Preview:**\n${blogData.content.substring(0, 200)}...\n\n` +
            `---\n\n` +
            `📋 **Full Content (Copy this):**\n\n` +
            `\`\`\`html\n${blogData.content}\n\`\`\`\n\n` +
            `💡 **Next Steps:**\n` +
            `1. Go to Admin → Blog → New Post\n` +
            `2. Copy the title and excerpt above\n` +
            `3. Paste the HTML content into the editor\n` +
            `4. Upload a featured image\n` +
            `5. Publish! 🚀\n\n` +
            `Need me to adjust anything? Just ask!`;
        } catch (error) {
          console.error('Blog generation error:', error);
          return `❌ Sorry, I had trouble generating that blog post. The AI service might be busy. Want to try again or try a different topic?`;
        }
      }

      case 'FORMAT_CONTENT': {
        const rawText = param.trim();
        
        if (!rawText) {
          return `✨ Please paste the content you want me to format! I can:\n• Convert plain text to HTML\n• Add proper headings and structure\n• Format lists, bold text, etc.\n• Make it blog-ready!\n\nJust paste your text and I'll format it for you! 📝`;
        }
        
        // Generate formatted content using AI
        const formatPrompt = `Take this content and format it as professional HTML for a blog post:

${rawText}

Rules:
- Identify and convert main sections to <h2> tags
- Subsections to <h3> tags
- Paragraphs to <p> tags
- Lists to <ul> or <ol> with <li> items
- Important phrases to <strong>
- Emphasized text to <em>
- Add line breaks for readability
- Preserve original meaning and content
- Make it scannable and well-structured
- DO NOT change the actual content or add new information
- ONLY return the formatted HTML, nothing else`;

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: formatPrompt }],
              temperature: 0.3, // Lower temperature for formatting accuracy
              max_tokens: 3000,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to format content');
          }

          const data = await response.json();
          const formattedContent = data.choices[0]?.message?.content || '';
          
          // Clean up any markdown code blocks if present
          const cleanContent = formattedContent
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

          return `✨ **Content Formatted!** 🎨\n\n` +
            `**Preview:**\n${cleanContent.substring(0, 200)}...\n\n` +
            `---\n\n` +
            `📋 **Formatted HTML (Copy this):**\n\n` +
            `\`\`\`html\n${cleanContent}\n\`\`\`\n\n` +
            `💡 **What I did:**\n` +
            `✅ Added proper HTML structure\n` +
            `✅ Formatted headings (H2, H3)\n` +
            `✅ Organized paragraphs\n` +
            `✅ Converted lists to HTML\n` +
            `✅ Added emphasis and bold text\n\n` +
            `🚀 Ready to paste into your blog editor!\n\n` +
            `Need more adjustments? Just ask!`;
        } catch (error) {
          console.error('Formatting error:', error);
          return `❌ Sorry, I had trouble formatting that content. The AI service might be busy. Want to try again?`;
        }
      }

      case 'CREATE_BLOG_AUTO': {
        const topic = param.trim();
        
        if (!topic) {
          return `🤖 I can create and publish a complete blog post for you!\n\nJust tell me the topic, like:\n• "Create a blog about domain security"\n• "Publish a post about choosing extensions"\n• "Write about domain transfers"\n\nI'll generate everything and open the editor with all fields filled! ✨`;
        }
        
        // Generate complete blog post
        const blogPrompt = `Write a comprehensive, SEO-optimized blog post about: ${topic}

Format as JSON with this EXACT structure:
{
  "title": "Engaging title (50-60 chars)",
  "excerpt": "Brief summary (150-160 characters)",
  "content": "<h2>Introduction</h2><p>Full HTML content here with h2, h3, p, ul, strong tags...</p>",
  "category": "Guide" or "Education" or "Security" or "Tutorial" or "SEO" or "News",
  "tags": "tag1, tag2, tag3",
  "readTime": "5" (number as string),
  "imageKeywords": "3-5 keywords for finding a relevant image"
}

Content requirements:
- 800-1200 words
- Use <h2> for main sections, <h3> for subsections
- Include practical examples with CheapestDomains context
- Add actionable tips in <ul> lists
- Use <strong> for emphasis
- Professional yet friendly tone
- SEO-optimized

Return ONLY the JSON, nothing else.`;

        try {
          // Generate blog content
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: blogPrompt }],
              temperature: 0.7,
              max_tokens: 4000,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to generate content');
          }

          const data = await response.json();
          const generatedContent = data.choices[0]?.message?.content || '';
          
          // Parse JSON
          let blogData;
          try {
            const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
            blogData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(generatedContent);
          } catch (e) {
            throw new Error('Failed to parse generated content');
          }

          // Find suitable image from Unsplash
          const imageKeywords = blogData.imageKeywords || 'domain technology';
          let imageUrl = '';
          
          try {
            // Using Unsplash Source API (no API key required for basic usage)
            const searchTerms = imageKeywords.replace(/,/g, ' ').replace(/\s+/g, ',');
            imageUrl = `https://source.unsplash.com/1200x600/?${encodeURIComponent(searchTerms)},technology,business`;
          } catch {
            // Fallback to a default tech image
            imageUrl = 'https://source.unsplash.com/1200x600/?technology,computer,business';
          }

          // Create automation payload
          const automationData = {
            title: blogData.title,
            excerpt: blogData.excerpt,
            content: blogData.content,
            category: blogData.category,
            tags: blogData.tags,
            readTime: blogData.readTime || '5',
            featuredImage: imageUrl,
            slug: blogData.title.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
          };

          // Encode as base64 to avoid regex issues
          const encodedData = Buffer.from(JSON.stringify(automationData)).toString('base64');

          // Return special automation marker
          return `🤖 BLOG_AUTO_START:${encodedData}:BLOG_AUTO_END\n\n` +
            `🎉 **Blog Post Ready!**\n\n` +
            `📝 **${blogData.title}**\n` +
            `📂 Category: ${blogData.category}\n` +
            `🏷️ Tags: ${blogData.tags}\n` +
            `🖼️ Image: Found and added!\n\n` +
            `✨ **Opening the blog editor now...**\n\n` +
            `Everything is filled in! Just review and click **Publish**! 🚀\n\n` +
            `The page will open in 2 seconds...`;
        } catch (error) {
          console.error('Auto blog creation error:', error);
          return `❌ Sorry, I had trouble creating the blog post automatically. Want to try:\n1. A different topic?\n2. Manual generation (I'll give you content to copy)?\n3. Just the content without automation?`;
        }
      }

      case 'LIST_EXTENSIONS': {
        const popular = DOMAIN_EXTENSIONS.filter(e => e.popular);
        const list = popular.map(e => `• ${e.extension}: $${e.price}/yr - ${e.description}`).join('\n');
        return `🌐 Our Popular Extensions:\n\n${list}\n\n✨ Want me to search for a domain with any of these?`;
      }
      
      case 'TERMS_OF_SERVICE': {
        return `📄 NAVIGATE:/terms\n\n📋 Taking you to our Terms of Service! You'll find all the details about:\n\n• Domain registration policies\n• Payment & refund terms\n• Transfer policies\n• Acceptable use\n• Your rights & responsibilities\n\nGot questions after reading? Just ask! 😊`;
      }
      
      case 'PRIVACY_POLICY': {
        return `🔒 NAVIGATE:/privacy\n\n🛡️ Taking you to our Privacy Policy! You'll learn about:\n\n• What data we collect\n• How we use your information\n• WHOIS requirements\n• Data security measures\n• Your privacy rights\n\nWe take your privacy seriously! Any questions? 💙`;
      }
      
      default:
        return `🤔 Hmm, I don't recognize that action yet. But I'm learning! Try asking me to check a domain, add to cart, or view your cart!`;
    }
  } catch (error) {
    console.error(`❌ Tool execution error:`, error);
    return `Oops! Had trouble with that. Try asking differently or contact support@truehost.co.ke`;
  }
}

// Process AI response and execute any tool calls
async function processToolCalls(aiResponse: string): Promise<string> {
  // Updated regex to make parameter optional
  const toolPattern = /\[TOOL:([A-Z_]+)(?::([^\]]*))?\]/g;
  const matches = Array.from(aiResponse.matchAll(toolPattern));
  
  if (matches.length === 0) {
    return aiResponse; // No tools to execute
  }
  
  console.log(`🔧 Found ${matches.length} tool call(s)`);
  
  let finalResponse = aiResponse;
  
  for (const match of matches) {
    const [fullMatch, toolName, param] = match;
    const toolResult = await executeTool(toolName, param || '');
    
    // Replace the tool call with the result (clean up any extra newlines before)
    finalResponse = finalResponse.replace(fullMatch, toolResult);
  }
  
  // Clean up any double newlines that might have been left
  finalResponse = finalResponse.replace(/\\n\\n\\n+/g, '\n\n');
  
  return finalResponse;
}

async function getChatResponse(message: string, history: any[], userInfo: any) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  console.log('🔑 API Keys Check:', {
    groq: GROQ_API_KEY ? `Configured (${GROQ_API_KEY.substring(0, 10)}...)` : 'Not found',
    openai: OPENAI_API_KEY ? 'Configured' : 'Not found'
  });
  
  // Build conversation history
  const messages = [
    {
      role: 'system',
      content: WEBSITE_CONTEXT + AVAILABLE_TOOLS + (userInfo ? `\n\nCURRENT USER:\nName: ${userInfo.name}\nEmail: ${userInfo.email}\nAccount: ${userInfo.accountType}\n\nGreet them by name and make it personal! They're already part of the family. 😊` : '\n\nThis person is just checking us out! Be welcoming and make them feel at home. If it feels right, mention they can create an account for easier management - but no pressure!')
    },
    ...history.slice(-8).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    {
      role: 'user',
      content: message
    }
  ];

  // Try Groq first (fastest and most generous free tier)
  if (GROQ_API_KEY) {
    try {
      console.log('🤖 Calling Groq API...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Current production model (replaces llama3-70b-8192)
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      console.log('📡 Groq Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Groq API Success!');
        const aiResponse = data.choices[0].message.content;
        // Process any tool calls in the response
        return await processToolCalls(aiResponse);
      } else {
        const errorData = await response.json();
        console.error('❌ Groq API Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Groq API Exception:', error);
    }
  } else {
    console.log('⚠️ No Groq API key found, using fallback...');
  }

  // Fallback to OpenAI if available
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        // Process any tool calls in the response
        return await processToolCalls(aiResponse);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // Fallback: Rule-based responses if no API key configured
  const fallbackResponse = getRuleBasedResponse(message, userInfo);
  return await processToolCalls(fallbackResponse);
}

// Simple rule-based fallback when API is not configured - Kaya's backup brain
function getRuleBasedResponse(message: string, userInfo: any): string {
  const msg = message.toLowerCase();
  
  // Check for WHOIS lookup requests
  const whoisPattern = /(?:whois|who owns|domain info|registration info).*?([a-z0-9-]+\.[a-z]{2,})/i;
  const whoisMatch = message.match(whoisPattern);
  
  if (whoisMatch || msg.includes('whois')) {
    if (whoisMatch) {
      const domain = whoisMatch[1];
      return `Let me look up the WHOIS information for ${domain}... 🔍 [TOOL:WHOIS_LOOKUP:${domain}]`;
    } else {
      return `Sure! Which domain would you like WHOIS information for? Just tell me like "whois catalyst.co.ke" 📋`;
    }
  }
  
  // Check for domain availability questions
  const domainPattern = /(?:is |check |available |get |register |add |buy |want )([a-z0-9-]+\.[a-z]{2,})/i;
  const domainMatch = message.match(domainPattern);
  
  if (domainMatch) {
    const domain = domainMatch[1];
    
    // Check if user wants to add to cart or register
    if (msg.includes('add') || msg.includes('buy') || msg.includes('register') || msg.includes('want')) {
      return `Perfect! Let me check if ${domain} is available and add it to your cart! [TOOL:CHECK_DOMAIN:${domain}]\n\nIf it's available, want me to add it? 🛒`;
    }
    
    // Just checking availability
    return `Let me check ${domain} for you! [TOOL:CHECK_DOMAIN:${domain}]`;
  }
  
  // Add to cart request without domain
  if ((msg.includes('add to cart') || msg.includes('add it') || msg.includes('buy it')) && !domainMatch) {
    return `Sure! Which domain would you like me to add to your cart? 😊`;
  }
  
  // Remove from cart request
  const removePattern = /(?:remove|delete|take out).*?([a-z0-9-]+\.[a-z]{2,})/i;
  const removeMatch = message.match(removePattern);
  
  if (removeMatch || msg.includes('remove from cart') || msg.includes('delete from cart')) {
    if (removeMatch) {
      const domain = removeMatch[1];
      return `Let me remove ${domain} from your cart! [TOOL:REMOVE_FROM_CART:${domain}]`;
    } else {
      return `Which domain would you like me to remove from your cart? 🗑️`;
    }
  }
  
  // Cart-related
  if (msg.includes('cart') || msg.includes('basket')) {
    if (msg.includes('view') || msg.includes('show') || msg.includes('what')) {
      return `Let me show you what's in your cart! [TOOL:VIEW_CART]`;
    }
    return `I can help with your cart! Say "view cart" to see what's in it, or tell me a domain to add! 🛒`;
  }
  
  // Checkout
  if (msg.includes('checkout') || msg.includes('complete') || msg.includes('purchase now') || msg.includes('pay now')) {
    return `Ready to complete your purchase? Let's go! [TOOL:CHECKOUT]`;
  }
  
  if (msg.includes('price') || msg.includes('cost') || msg.includes('pricing')) {
    return `Here's our pricing:\n\n• .co.ke: $9.99/year (🇰🇪 Best value!)\n• .com: $12.99/year (Classic choice)\n• .net: $14.99/year\n• .io: $39.99/year (Tech startups love this!)\n• WHOIS Privacy: $9.99/year\n\n${userInfo ? `${userInfo.name}, w` : 'W'}ant me to search for a specific domain? Just say the word! 🔍`;
  }
  
  if (msg.includes('transfer')) {
    const transferDomainMatch = message.match(/transfer ([a-z0-9-]+\.[a-z]{2,})/i);
    if (transferDomainMatch) {
      const domain = transferDomainMatch[1];
      return `Perfect! Let me help you transfer ${domain} to CheapestDomains! 🚚\n\n[TOOL:TRANSFER_DOMAIN:${domain}]`;
    }
    return `${userInfo ? `${userInfo.name}, w` : 'W'}ant to transfer a domain? Here's what you need:\n\n📋 Requirements:\n1. Domain name you want to transfer\n2. Authorization (EPP) code from current registrar\n3. Domain must be unlocked\n4. Not expired or within 60 days of registration\n\n🎁 Benefits:\n• +1 year extension FREE\n• Keep all remaining time\n• Takes 5-7 days\n• Same price as registration\n\nWhich domain do you want to transfer? Just say "transfer mydomain.com"! 🚀`;
  }
  
  if (msg.includes('my domains') || msg.includes('show my domains') || msg.includes('list domains')) {
    return `Let me show you your domains! [TOOL:MY_DOMAINS]`;
  }
  
  if (msg.includes('search') && !msg.includes('search page')) {
    const searchMatch = message.match(/search (?:for )?([a-z0-9-]+)/i);
    if (searchMatch) {
      const query = searchMatch[1];
      return `Let's search for "${query}" domains! [TOOL:SEARCH_PAGE:${query}]`;
    }
    return `What would you like to search for? I can help you find the perfect domain! 🔍`;
  }
  
  if (msg.includes('payment') || msg.includes('pay')) {
    return `We accept:\n\n✓ M-Pesa (🇰🇪 Kenya)\n✓ Credit/Debit Cards\n✓ PayPal\n✓ Bank Transfer\n\nAll payments are secure and instant! Ready to checkout? Just say "checkout"! 💳`;
  }
  
  if (msg.includes('register') || msg.includes('buy') || msg.includes('get a domain')) {
    return `${userInfo ? `Hi ${userInfo.name}! ` : ''}I can help you register a domain in seconds! Just tell me:\n\n1️⃣ What domain you want (e.g., "check mysite.com")\n2️⃣ I'll verify it's available\n3️⃣ Add it to your cart\n4️⃣ Checkout!\n\nWhat domain are you thinking of? 🚀`;
  }
  
  if (msg.includes('support') || msg.includes('contact')) {
    return `Need help? ${userInfo ? `${userInfo.name}, ` : ''}I'm here for you!\n\n📧 Email: support@truehost.co.ke\n📞 Phone: +254 20 528 0000\n💬 Chat: Right here with me!\n📍 Location: Nairobi, Kenya\n\n24/7 support! What do you need? 🤝`;
  }
  
  if (msg.includes('account') || msg.includes('dashboard')) {
    if (userInfo) {
      return `Hi ${userInfo.name}! Want to see your dashboard? [TOOL:MY_DOMAINS]\n\nYou can manage all your domains, renewals, and settings there! 🎛️`;
    } else {
      return `Create a free account to:\n\n✓ Manage all your domains\n✓ Track orders & spending\n✓ Get renewal reminders\n✓ Access 24/7 support\n\nReady to sign up? I can guide you! 🚀`;
    }
  }
  
  // Terms of Service
  if (msg.includes('terms') || msg.includes('tos') || msg.includes('terms of service') || msg.includes('user agreement')) {
    // Check if they're asking for both terms and privacy
    if (msg.includes('privacy')) {
      return `Looking for our legal docs? I can show you:\n\n📄 Terms of Service - Registration policies, refunds, acceptable use\n🔒 Privacy Policy - Data protection, WHOIS requirements, security\n\nWhich would you like to see first? Or say "terms" or "privacy"! 😊`;
    }
    return `Let me show you our Terms of Service! [TOOL:TERMS_OF_SERVICE]`;
  }
  
  // Privacy Policy
  if (msg.includes('privacy') || msg.includes('privacy policy') || msg.includes('data protection')) {
    return `Let me show you our Privacy Policy! [TOOL:PRIVACY_POLICY]`;
  }
  
  // Default friendly response
  return `${userInfo ? `Hey ${userInfo.name}! ` : 'Hey! '}I'm Kaya, and I can actually DO things for you! 🎯\n\nTry saying:\n• "Check mysite.com" - Check availability\n• "WHOIS for google.com" - Domain info\n• "Add example.co.ke to cart" - Add domain\n• "Transfer mybusiness.com" - Transfer domain\n• "View my cart" - See cart contents\n• "Show me terms" or "Privacy policy" - Legal info\n\nWhat can I help you with? 😊`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, user } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const responseMessage = await getChatResponse(message, history || [], user || null);

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        message: 'I apologize, but I\'m having trouble right now. Please contact our support team at support@truehost.co.ke or call +254 20 528 0000 for immediate assistance.',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    message: 'CheapestDomains AI Chat API is running',
    apis: [
      { name: 'Groq', url: 'https://console.groq.com', free: true, status: process.env.GROQ_API_KEY ? 'configured' : 'not configured' },
      { name: 'OpenAI', url: 'https://platform.openai.com', status: process.env.OPENAI_API_KEY ? 'configured' : 'not configured' },
    ],
    fallback: 'Rule-based responses active'
  });
}
