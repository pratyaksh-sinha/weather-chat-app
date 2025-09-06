// src/components/Sidebar.jsx
export default function Sidebar({ chats, activeChatId, onNewChat, onSwitchChat, isVisible }) {
    return (
      <div
        className={`absolute top-0 left-0 h-full w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:static md:translate-x-0 z-20`}
      >
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4"
          >
            + New Chat
          </button>
          <h2 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
            Conversations
          </h2>
          <div className="flex flex-col gap-2">
            {Object.keys(chats).map(chatId => (
              <button
                key={chatId}
                onClick={() => onSwitchChat(chatId)}
                className={`text-left p-2 rounded-md truncate ${
                  activeChatId === chatId
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200':
                    'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white'
                }`}
              >
                {chats[chatId].title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }