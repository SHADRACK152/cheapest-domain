'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { useCart } from './cart-context';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  statusMessage: string;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { addItem, removeItem } = useCart();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Generate a unique session ID for anonymous users
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get storage key for current user
  const getChatStorageKey = useCallback(() => {
    if (isAuthenticated && user?.id) {
      return `chatHistory_user_${user.id}`;
    }
    return `chatHistory_${getSessionId()}`;
  }, [isAuthenticated, user?.id, getSessionId]);

  // Initialize welcome message
  const initializeWelcomeMessage = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: isAuthenticated && user?.name 
        ? `Hey ${user.name}! 👋 I'm Kaya, your AI domain assistant. I can help you search, register, and manage domains - just ask me anything! 😊`
        : 'Hey there! 👋 I\'m Kaya, your AI domain assistant. I can help you search, register, and manage domains - just ask me anything! 😊',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [isAuthenticated, user?.name]);

  // Load chat history from localStorage for current user
  useEffect(() => {
    const storageKey = getChatStorageKey();
    const savedMessages = localStorage.getItem(storageKey);
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load chat history:', e);
        // If corrupted, start fresh
        initializeWelcomeMessage();
      }
    } else {
      // Welcome message for new user/session
      initializeWelcomeMessage();
    }
  }, [getChatStorageKey, initializeWelcomeMessage]); // Reload when user changes

  // Save chat history to localStorage (user-specific)
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = getChatStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, getChatStorageKey]);

  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Detect what the user is asking for and show relevant status
    const msg = message.toLowerCase();
    const domainPattern = /[a-z0-9-]+\.[a-z]{2,}/i;
    const hasDomain = domainPattern.test(message);
    
    if (hasDomain && (msg.includes('check') || msg.includes('available') || msg.includes('is ') || msg.includes('register') || msg.includes('buy'))) {
      const domain = message.match(domainPattern)?.[0];
      setStatusMessage(`🔍 Checking ${domain}...`);
    } else if (msg.includes('whois') && hasDomain) {
      const domain = message.match(domainPattern)?.[0];
      setStatusMessage(`📋 Looking up ${domain}...`);
    } else if (msg.includes('transfer')) {
      setStatusMessage('🔄 Processing transfer request...');
    } else if (msg.includes('cart')) {
      setStatusMessage('🛒 Loading cart...');
    } else if (msg.includes('price') || msg.includes('pricing') || msg.includes('cost')) {
      setStatusMessage('💰 Fetching pricing...');
    } else if (msg.includes('domain') || hasDomain) {
      setStatusMessage('🔍 Scanning domain...');
    } else {
      setStatusMessage('💭 Thinking...');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: messages.slice(-10), // Last 10 messages for context
          user: isAuthenticated ? {
            name: user?.name,
            email: user?.email,
            accountType: user?.accountType,
          } : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      let responseContent = data.message;
      
      setStatusMessage('✍️ Typing response...');

      // Process agentic actions from Kaya's response
      // Handle CART_ACTION:ADD marker
      const cartAddMatch = responseContent.match(/🛒 CART_ACTION:ADD:([^:]+):([0-9.]+)/);
      if (cartAddMatch) {
        const [, domainName, price] = cartAddMatch;
        const domain = {
          name: domainName.split('.')[0],
          extension: '.' + domainName.split('.').slice(1).join('.'),
          fullDomain: domainName,
          price: parseFloat(price),
          renewPrice: parseFloat(price) + 4, // Estimate
          available: true,
          premium: false,
        };
        
        // Add to cart
        addItem(domain);
        
        // Remove the marker from display
        responseContent = responseContent.replace(/🛒 CART_ACTION:ADD:[^\n]+\n+/, '');
      }

      // Handle CART_ACTION:REMOVE marker
      const cartRemoveMatch = responseContent.match(/🗑️ CART_ACTION:REMOVE:([^\n]+)/);
      if (cartRemoveMatch) {
        const [, domainName] = cartRemoveMatch;
        
        // Remove from cart
        removeItem(domainName.trim());
        
        // Remove the marker from display
        responseContent = responseContent.replace(/🗑️ CART_ACTION:REMOVE:[^\n]+\n+/, '');
      }

      // Handle BLOG_AUTOMATION marker
      const blogAutoMatch = responseContent.match(/🤖 BLOG_AUTO_START:([A-Za-z0-9+/=]+):BLOG_AUTO_END/);
      if (blogAutoMatch) {
        try {
          // Decode base64 data
          const decodedData = atob(blogAutoMatch[1]);
          const blogData = JSON.parse(decodedData);
          
          console.log('Blog automation detected:', blogData);
          
          // Store blog data in localStorage for the blog creation page to pick up
          localStorage.setItem('kaya_blog_automation', JSON.stringify(blogData));
          
          // Navigate to blog creation page after a short delay
          setTimeout(() => {
            console.log('Navigating to blog editor...');
            router.push('/admin/blog/new');
            setIsOpen(false);
          }, 2000);
          
          // Remove the marker from display
          responseContent = responseContent.replace(/🤖 BLOG_AUTO_START:[A-Za-z0-9+/=]+:BLOG_AUTO_END\n+/, '');
        } catch (e) {
          console.error('Failed to parse blog automation data:', e);
        }
      }

      // Handle NAVIGATE marker
      const navigateMatch = responseContent.match(/🔍 NAVIGATE:([^\n]+)|🛒 NAVIGATE:([^\n]+)|🌐 NAVIGATE:([^\n]+)|🔄 NAVIGATE:([^\n]+)|📝 NAVIGATE:([^\n]+)|📚 NAVIGATE:([^\n]+)|📖 NAVIGATE:([^\n]+)/);
      if (navigateMatch) {
        const path = navigateMatch[1] || navigateMatch[2] || navigateMatch[3] || navigateMatch[4] || navigateMatch[5] || navigateMatch[6] || navigateMatch[7];
        
        // Close chat and navigate after a short delay
        setTimeout(() => {
          router.push(path);
          setIsOpen(false);
        }, 2000);
        
        // Remove the marker from display
        responseContent = responseContent.replace(/[🔍🛒🌐🔄📝📚📖] NAVIGATE:[^\n]+\n+/, '');
      }

      // Add typing animation for the response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStatusMessage('');

      // Animate the text appearing character by character
      const words = responseContent.split(' ');
      let currentText = '';
      
      // Adjust typing speed based on response length
      const baseDelay = words.length > 50 ? 20 : 40; // Faster for long responses
      const variance = words.length > 50 ? 20 : 40;
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.id === assistantMessage.id) {
            lastMsg.content = currentText;
          }
          return newMessages;
        });
        
        // Dynamic delay for natural typing feel
        await new Promise(resolve => setTimeout(resolve, Math.random() * variance + baseDelay));
      }
      
      // Mark typing as complete
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.id === assistantMessage.id) {
          lastMsg.isTyping = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again or contact support at support@truehost.co.ke',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [messages, isAuthenticated, user, addItem, removeItem, router]);

  const clearChat = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: isAuthenticated && user?.name
        ? `Hey ${user.name}! 👋 I\'m Kaya! Fresh start - let\'s find you the perfect domain or help you with any task! 😊`
        : 'Hey there! 👋 I\'m Kaya! Fresh start - let\'s find you the perfect domain or help you with any task! 😊',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    // Remove only this user's chat history
    const storageKey = getChatStorageKey();
    localStorage.removeItem(storageKey);
  }, [isAuthenticated, user?.name, getChatStorageKey]);

  const value = useMemo(() => ({
    messages,
    isOpen,
    isLoading,
    statusMessage,
    toggleChat,
    sendMessage,
    clearChat,
  }), [messages, isOpen, isLoading, statusMessage, toggleChat, sendMessage, clearChat]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
