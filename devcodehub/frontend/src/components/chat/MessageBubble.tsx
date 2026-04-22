import React from 'react';
import type { ChatMessage } from '../../store/chatStore';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, isMe }) => {
  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      {!isMe && (
        <span className="text-xs font-black text-slate-400 mb-1.5 ml-1">{message.senderNickname}</span>
      )}
      <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
          className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
            isMe 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-100 text-slate-800 rounded-tl-none'
          }`}
        >
          {message.message}
        </div>
        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap mb-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
});

export default MessageBubble;
