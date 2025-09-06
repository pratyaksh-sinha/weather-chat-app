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
    setChats(prevChats => {
      const newChats = { ...prevChats };
      newChats[activeChatId].messages = [];
      return newChats;
    });
  };

  // --- This function was missing and is now restored ---
  const handleDeleteChat = (chatIdToDelete) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) {
      return;
    }
    const newChats = { ...chats };
    delete newChats[chatIdToDelete];
    setChats(newChats);

    if (activeChatId === chatIdToDelete) {
      const remainingChatIds = Object.keys(newChats);
      if (remainingChatIds.length > 0) {
        setActiveChatId(remainingChatIds[0]);
      } else {
        handleNewChat();
      }
    }
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
      const API_URL = "https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream";
      const headers = {
        'x-mastra-dev-playground': 'true',
        'Content-Type': 'application/json',
      };
      const body = {
        "messages": [{ "role": "user", "content": userInput }],
        "runId": "weatherAgent", "maxRetries": 2, "maxSteps": 5, "temperature": 0.5,
        "topP": 1, "runtimeContext": {}, "threadId": 2, "resourceId": "weatherAgent"
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const textData = JSON.parse(line.substring(2));
              setChats(prevChats => {
                const newChats = { ...prevChats };
                if (newChats[activeChatId]) {
                  const activeMessages = newChats[activeChatId].messages;
                  const lastMessage = activeMessages[activeMessages.length - 1];
                  const updatedLastMessage = { ...lastMessage, text: lastMessage.text + textData };
                  newChats[activeChatId].messages = [...activeMessages.slice(0, -1), updatedLastMessage];
                }
                return newChats;
              });
            } catch (e) {
              console.error("Failed to parse JSON chunk from stream:", line);
            }
          }
        }
      }
    } catch (err) {
      console.error("API Call failed:", err);
      setChats(prevChats => {
        const newChats = { ...prevChats };
        if (newChats[activeChatId]) {
          const activeMessages = newChats[activeChatId].messages;
          const lastMessage = activeMessages[activeMessages.length - 1];
          const updatedLastMessage = { ...lastMessage, text: 'Sorry, something went wrong.' };
          newChats[activeChatId].messages = [...activeMessages.slice(0, -1), updatedLastMessage];
        }
        return newChats;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const activeChat = chats[activeChatId];
  if (!activeChat) {
    return <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <div className={`h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-900`}>
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-700 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold dark:text-white whitespace-nowrap">{activeChat.title}</h1>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <button onClick={handleThemeToggle} className="text-sm text-gray-500 dark:text-gray-300">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
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
          onDeleteChat={handleDeleteChat}
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