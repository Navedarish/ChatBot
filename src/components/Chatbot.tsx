import React, { useState, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import axios from 'axios';

interface Message {
  text: string;
  isUser: boolean;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMessages([{ text: "Hello! I'm HeartGuard AI. How can I assist you today? You can ask about your heart failure risk, blood pressure, heart rate, or update your health information.", isUser: false }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessage: Message = { text: input, isUser: true };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput('');

      try {
        const response = await axios.post('http://localhost:5000/api/chat', { message: input }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const botResponse: Message = { text: response.data.message, isUser: false };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      } catch (error) {
        console.error('Error getting bot response:', error);
        const errorMessage: Message = { text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.", isUser: false };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-500 p-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Bot className="mr-2" />
          HeartGuard AI Assistant
        </h2>
      </div>
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;