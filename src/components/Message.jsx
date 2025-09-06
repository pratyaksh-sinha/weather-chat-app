// src/Message.jsx

function Message({ text, sender, timestamp }) {
  const isUser = sender === 'user';

  const alignmentClass = isUser ? 'self-end' : 'self-start';
  
  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white'
    : 'bg-gray-200 text-gray-800';

  return (
    <div className={`flex flex-col ${alignmentClass} mb-4`}>
      <div 
        // The `break-words` class is added here
        className={`max-w-xs md:max-w-md p-3 rounded-lg break-words ${bubbleClasses}`}
      >
        {text}
      </div>
      {timestamp && (
        <span className="text-xs text-gray-400 mt-1 px-1">
          {timestamp}
        </span>
      )}
    </div>
  );
}

export default Message;