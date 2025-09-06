// src/App.jsx
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

const COLLEGE_ROLL_NUMBER = "PASTE-YOUR-ROLL-NUMBER-HERE";

const createNewChat = (title) => ({
  title,
  messages: [],
  timestamp: Date.now(),
});

function App() {
  const [chats, setChats] = useState({
    'chat-1': createNewChat('First Chat'),
  });
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [theme, setTheme] = useState('light');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = createNewChat(`Chat ${Object.keys(chats).length + 1}`);
    setChats({ ...chats, [newChatId]: newChat });
    setActiveChatId(newChatId);
    setSidebarOpen(false);
  };

  const handleSwitchChat = (chatId) => {
    setActiveChatId(chatId);
    setSidebarOpen(false);
  };

  const handleClearChat = () => {
    // Clear messages only for the active chat
    setChats(prevChats => {
      const newChats = { ...prevChats };
      newChats[activeChatId].messages = [];
      return newChats;
    });
  };

  const handleSendMessage = async (userInput) => {
    if (isLoading) return;
    setIsLoading(true);

    const userMessage = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const agentPlaceholder = {
      sender: 'agent',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChats(prevChats => {
      const newChats = { ...prevChats };
      newChats[activeChatId].messages = [...newChats[activeChatId].messages, userMessage, agentPlaceholder];
      return newChats;
    });

    try {
      // API Call logic remains here
      const API_URL = "https://brief-thousands-sunset-9fcb1c78-485f-4967-ac04-2759a8fa1462.mastra.cloud/api/agents/weatherAgent/stream";
      const headers = { 'Accept': '*/*', 'Content-Type': 'application/json', 'x-mastra-dev-playground': 'true' };
      const body = { "messages": [{ "role": "user", "content": userInput }], "threadId": COLLEGE_ROLL_NUMBER };
      const response = await fetch(API_URL, { method: 'POST', headers: headers, body: JSON.stringify(body) });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setChats(prevChats => {
          const newChats = { ...prevChats };
          const activeMessages = newChats[activeChatId].messages;
          const lastMessage = activeMessages[activeMessages.length - 1];
          const updatedLastMessage = { ...lastMessage, text: lastMessage.text + chunk };
          newChats[activeChatId].messages = [...activeMessages.slice(0, -1), updatedLastMessage];
          return newChats;
        });
      }
    } catch (err) {
      console.error("API Call failed:", err);
      setChats(prevChats => {
        const newChats = { ...prevChats };
        const activeMessages = newChats[activeChatId].messages;
        const lastMessage = activeMessages[activeMessages.length - 1];
        const updatedLastMessage = { ...lastMessage, text: 'Sorry, something went wrong.' };
        newChats[activeChatId].messages = [...activeMessages.slice(0, -1), updatedLastMessage];
        return newChats;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeChat = chats[activeChatId];

  return (
    <div className={`h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-900`}>
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-700 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold dark:text-white whitespace-nowrap">
            {activeChat.title}
          </h1>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <button onClick={handleThemeToggle} className="text-sm text-gray-500 dark:text-gray-300">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          {/* Clear Chat button is now restored */}
          <button onClick={handleClearChat} className="text-sm text-gray-500 dark:text-gray-300">
            Clear Chat
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSwitchChat={handleSwitchChat}
          isVisible={isSidebarOpen}
        />
        <div className="flex-1 flex flex-col relative">
          {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"></div>}
          <ChatWindow activeChat={activeChat} onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default App;