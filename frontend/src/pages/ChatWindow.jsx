import React, { useState } from 'react';
import { Send, Phone, Video, Info, User } from 'lucide-react';

const ChatWindow = () => {
  const [message, setMessage] = useState('');
  
  // Mock active user
  const activeChat = { name: 'Priya Sharma', online: true };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-100px)]">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex h-full">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-1/3 border-r border-gray-100 hidden md:flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-grow p-3 space-y-2">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`flex items-center p-3 rounded-2xl cursor-pointer transition ${i === 0 ? 'bg-matrimony-50 border border-matrimony-100' : 'hover:bg-gray-100'}`}>
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  {i === 0 && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">{i === 0 ? 'Priya Sharma' : 'User ' + i}</h3>
                    <span className="text-xs text-gray-500">10:42 AM</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">Hey, how are you doing?</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area - Active Chat */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                   <User className="w-5 h-5 text-gray-500" />
                </div>
                {activeChat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
              </div>
              <div className="ml-3">
                <h3 className="font-bold text-gray-900">{activeChat.name}</h3>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>
            <div className="flex space-x-3 text-gray-400">
              <button className="p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition"><Phone className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition"><Video className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-gray-100 hover:text-gray-600 transition"><Info className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50">
            {/* Incoming Message */}
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div className="bg-white border border-gray-200 text-gray-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm max-w-[70%]">
                <p>Hello! I saw your profile and we seem to have a lot in common. Would love to connect.</p>
                <span className="text-[10px] text-gray-400 mt-2 block text-right">10:40 AM</span>
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex items-start justify-end">
              <div className="bg-matrimony-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-md max-w-[70%]">
                <p>Hi Priya! Yes, I noticed that too. How is your day going?</p>
                <span className="text-[10px] text-matrimony-200 mt-2 block text-right">10:42 AM</span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center bg-gray-100 rounded-full p-1.5 pr-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setMessage('')}
              />
              <button 
                className="p-2.5 bg-matrimony-600 text-white rounded-full hover:bg-matrimony-700 transition shadow-sm transform hover:scale-105 active:scale-95"
                onClick={() => setMessage('')}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
