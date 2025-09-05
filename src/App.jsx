// src/App.jsx

import { useState, useRef, useEffect } from 'react';
import Message from './Message';

async function mockApiStream(userInput) {
  const responseText = `Of course! The weather in London is currently 15°C with light clouds. The forecast for the rest of the week looks pleasant.`;
  const chunks = responseText.split(' ');

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const encodedChunk = new TextEncoder().encode(chunk + ' ');
        controller.enqueue(encodedChunk);
      }
      controller.close();
    }
  });

  return new Response(stream);
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    const userMessage = { 
      sender: 'user', 
      text: input, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    const agentMessage = {
      sender: 'agent',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prevMessages => [...prevMessages, userMessage, agentMessage]);
    
    const currentInput = input;
    setInput('');

    try {
      const response = await mockApiStream(currentInput);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunk };
          return [...prevMessages.slice(0, -1), updatedLastMessage];
        });
      }
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
       setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedLastMessage = { ...lastMessage, text: 'Sorry, something went wrong. Please try again.' };
          return [...prevMessages.slice(0, -1), updatedLastMessage];
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Weather Agent</h1>
        <button 
          onClick={handleClearChat}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Chat
        </button>
      </header>

      {/* Message List */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col max-w-2xl mx-auto">
          {messages.map((message, index) => (
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

      {/* Input Form */}
      <footer className="bg-white border-t border-gray-200 p-4">
        {/* ... (The footer code remains exactly the same) ... */}
         <div className="max-w-2xl mx-auto flex">
          <textarea
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <button
            className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleSend}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;