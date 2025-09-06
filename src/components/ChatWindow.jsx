// src/components/ChatWindow.jsx
import { useState } from 'react';
import Message from './Message';
import useAutoScroll from '../hooks/useAutoScroll';

// It MUST accept 'isLoading' in this list of props
export default function ChatWindow({ activeChat, onSendMessage, isLoading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useAutoScroll(activeChat.messages);

  const handleSend = () => {
    // It MUST check for 'isLoading' here to prevent double sends
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col max-w-2xl mx-auto">
          {activeChat.messages.map((message, index) => (
            <Message
              key={index}
              sender={message.sender}
              text={message.text}
              timestamp={message.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-2xl mx-auto flex">
          <textarea
            className="flex-1 p-2 border rounded-l-md bg-white dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading} // It MUST use the disabled prop here
          />
          <button
            className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleSend}
            disabled={isLoading} // And here
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}