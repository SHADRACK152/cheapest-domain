'use client';

import dynamic from 'next/dynamic';

// Lazy load ChatWidget (saves ~180KB of Framer Motion on initial load)
const ChatWidget = dynamic(
  () => import('@/components/chatbot/chat-widget').then(mod => ({ default: mod.ChatWidget })),
  {
    ssr: false,
    loading: () => null,
  }
);

export function ChatWrapper() {
  return <ChatWidget />;
}
