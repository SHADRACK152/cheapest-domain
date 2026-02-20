'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Trash2,
  Minimize2,
  User,
  Bot,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/chat-context';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const { messages, isOpen, isLoading, statusMessage, toggleChat, sendMessage, clearChat } = useChat();
  const { user, isAuthenticated } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const quickActions = [
    'Check if mysite.com is available',
    'Show me terms and privacy',
    'Transfer mybusiness.com',
    'View my cart',
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 group"
          >
            <MessageCircle className="h-6 w-6" />
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              className="hidden group-hover:inline-block whitespace-nowrap overflow-hidden"
            >
              Chat with us
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ height: isMinimized ? 'auto' : '600px', maxHeight: 'calc(100vh - 3rem)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Kaya</h3>
                  <p className="text-xs text-white/80">
                    {isAuthenticated && user?.name 
                      ? `Chatting with ${user.name}`
                      : 'Your AI Domain Assistant'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* User Info Banner (if logged in) */}
                {isAuthenticated && user && (
                  <div className="bg-primary-50 border-b border-primary-100 px-4 py-2 text-sm">
                    <p className="text-primary-900">
                      👋 Welcome back, <span className="font-semibold">{user.name}</span>!
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="bg-primary-600 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                          {message.isTyping && (
                            <span className="inline-block w-0.5 h-4 bg-primary-600 ml-0.5 animate-pulse" />
                          )}
                        </p>
                        <p className={cn(
                          'text-[10px] mt-1',
                          message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                        )}>
                          {message.timestamp.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="bg-gray-600 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="bg-primary-600 text-white rounded-full p-2 h-8 w-8 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          {statusMessage && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-sm text-gray-600"
                            >
                              {statusMessage}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t border-gray-200 bg-white">
                    <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action)}
                          disabled={isLoading}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={isLoading || !inputMessage.trim()}
                      className="flex-shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    {messages.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={clearChat}
                        disabled={isLoading}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Powered by AI • Always learning to help you better
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
