import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Send, Phone, Video, Info, User, Loader, MessageSquare } from 'lucide-react';
import api from '../api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatWindow = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const stateRef = useRef({ activeChat, chats });

  const [searchParams] = useSearchParams();
  const queryChatId = searchParams.get('chatId');

  // Keep stateRef in sync to avoid stale closures in WebSocket event listeners
  useEffect(() => {
    stateRef.current = { activeChat, chats };
  }, [activeChat, chats]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch active chats list on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const res = await api.get('/chat/my-chats');
        const chatList = res.data || [];
        setChats(chatList);

        // Determine which chat to activate
        let targetChat = null;
        if (queryChatId) {
          targetChat = chatList.find((c) => c.id === parseInt(queryChatId, 10));
        }
        if (!targetChat && chatList.length > 0) {
          targetChat = chatList[0];
        }
        if (targetChat) {
          setActiveChat(targetChat);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load conversations. Please try again.');
      } finally {
        setLoadingChats(false);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user, queryChatId]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await api.get(`/chat/${activeChat.id}/messages`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeChat]);

  // Establish WebSocket connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = 'http://localhost:8080/ws';
    const socket = new SockJS(socketUrl);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => {
        // Console log debug output if needed
      },
      onConnect: () => {
        console.log('Connected to WebSocket server');
        client.subscribe(`/user/${user.id}/queue/messages`, (msg) => {
          if (msg.body) {
            const receivedMsg = JSON.parse(msg.body);
            handleIncomingMessage(receivedMsg);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message']);
        console.error('Details:', frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [user]);

  // Handle real-time incoming messages
  const handleIncomingMessage = (newMsg) => {
    const { activeChat: currentActive, chats: currentChats } = stateRef.current;

    // 1. If message belongs to active chat, append it to messages
    if (currentActive && newMsg.chatId === currentActive.id) {
      setMessages((prev) => [...prev, newMsg]);
    }

    // 2. Update last message in the chat sidebar list
    setChats((prevChats) =>
      prevChats.map((c) => {
        if (c.id === newMsg.chatId) {
          return {
            ...c,
            lastMessage: newMsg.content,
            lastMessageTime: newMsg.createdAt,
          };
        }
        return c;
      })
    );
  };

  // Send message handler
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeChat || !user) return;

    const chatMessageDto = {
      chatId: activeChat.id,
      senderId: user.id,
      receiverId: activeChat.recipientId,
      content: messageText.trim(),
    };

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessageDto),
      });

      // Optimistically append the sent message locally
      const optimisticMsg = {
        id: Date.now(),
        chatId: activeChat.id,
        sender: { id: user.id, email: user.email },
        content: messageText.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Update last message in the chat list
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === activeChat.id) {
            return {
              ...c,
              lastMessage: messageText.trim(),
              lastMessageTime: new Date().toISOString(),
            };
          }
          return c;
        })
      );

      setMessageText('');
    } else {
      console.warn('STOMP client not connected. Retrying send...');
    }
  };

  // Timestamp formatting helper
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (loadingChats && chats.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 text-matrimony-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading your conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-100px)]">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex h-full">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-grow p-3 space-y-2">
            {chats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium">No conversations yet.</p>
                <p className="text-xs text-gray-400 mt-1">Connect with matches to start a chat!</p>
              </div>
            ) : (
              chats.map((c) => {
                const isActive = activeChat && activeChat.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChat(c)}
                    className={`flex items-center p-3 rounded-2xl cursor-pointer transition ${
                      isActive ? 'bg-matrimony-50 border border-matrimony-100 shadow-sm' : 'hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {c.recipientAvatar ? (
                        <img
                          src={c.recipientAvatar}
                          alt={c.recipientName}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-grow min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 truncate">{c.recipientName}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTime(c.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">{c.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area - Active Chat */}
        <div className="hidden md:flex flex-grow flex-1 flex-col bg-white">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center">
                  <div className="relative">
                    {activeChat.recipientAvatar ? (
                      <img
                        src={activeChat.recipientAvatar}
                        alt={activeChat.recipientName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-gray-900">{activeChat.recipientName}</h3>
                    <p className="text-xs text-green-500 font-medium">Online</p>
                  </div>
                </div>
                <div className="flex space-x-3 text-gray-400">
                  <button className="p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 hover:text-gray-600 transition">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader className="w-8 h-8 text-matrimony-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="text-sm font-medium">This is the start of your message history.</p>
                    <p className="text-xs">Say hello to {activeChat.recipientName}!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOutgoing = msg.sender && msg.sender.id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOutgoing && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                            {activeChat.recipientAvatar ? (
                              <img
                                src={activeChat.recipientAvatar}
                                alt={activeChat.recipientName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl shadow-sm max-w-[70%] ${
                            isOutgoing
                              ? 'bg-matrimony-600 text-white rounded-tr-none shadow-md'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                          <span
                            className={`text-[9px] mt-1.5 block text-right ${
                              isOutgoing ? 'text-matrimony-200' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center bg-gray-100 rounded-full p-1.5 pr-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 text-sm"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-matrimony-600 text-white rounded-full hover:bg-matrimony-700 transition shadow-sm transform hover:scale-105 active:scale-95 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-200" />
              <h3 className="text-lg font-bold text-gray-700">No Chat Selected</h3>
              <p className="text-sm mt-1 text-center max-w-sm">
                Choose a conversation from the sidebar or click Connect on someone's profile to start messaging!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
