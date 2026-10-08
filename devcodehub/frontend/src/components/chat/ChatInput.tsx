import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-6 border-t border-slate-100 flex gap-4 bg-white"
    >
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="flex-1 px-6 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
      />
      <button 
        type="submit"
        disabled={!text.trim()}
        className="px-8 py-3.5 bg-blue-600 text-white border-none rounded-2xl font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        전송
      </button>
    </form>
  );
};

export default ChatInput;
