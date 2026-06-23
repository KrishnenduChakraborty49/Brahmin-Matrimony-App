import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Send, Phone, Video, Info, User, Loader, MessageSquare, 
  ArrowLeft, X, Palette, Lock, Crown, CheckCheck, 
  Mic, MicOff, Volume2, VolumeX, PhoneOff, 
  Briefcase, MapPin, Sparkles, Heart 
} from 'lucide-react';
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

  const navigate = useNavigate();

  // Premium Features State
  const [profiles, setProfiles] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTheme, setActiveTheme] = useState('default');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Call Simulation State
  const [callType, setCallType] = useState(null); // 'voice' | 'video' | null
  const [callState, setCallState] = useState('idle'); // 'idle' | 'ringing' | 'connecting' | 'active' | 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const themes = [
    { id: 'default', name: 'Slate Light', class: 'bg-slate-50', primary: 'bg-gray-100', text: 'text-gray-800' },
    { id: 'rose', name: 'Rose Petal', class: 'bg-gradient-to-tr from-rose-50 to-pink-100/70', primary: 'bg-pink-50 border-pink-100', text: 'text-pink-900' },
    { id: 'lavender', name: 'Lavender Mist', class: 'bg-gradient-to-br from-violet-50 to-purple-100/60', primary: 'bg-purple-50 border-purple-100', text: 'text-purple-900' },
    { id: 'gold', name: 'Warm Gold', class: 'bg-gradient-to-tr from-amber-50 to-yellow-100/50', primary: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-900' }
  ];

  const quickReplies = [
    "Namaste 🙏",
    "Hello! Nice to connect with you.",
    "Would love to connect over a call.",
    "Tell me more about your hobbies!",
    "How has your matchmaking journey been?"
  ];

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

  // Fetch matches and user plan stats on mount
  useEffect(() => {
    const fetchMatchesAndStats = async () => {
      try {
        const matchesRes = await api.get('/profiles');
        setProfiles(matchesRes.data || []);
      } catch (err) {
        console.error('Error fetching profiles for side drawer:', err);
      }

      try {
        const statsRes = await api.get('/profiles/me/dashboard-stats');
        setUserStats(statsRes.data);
      } catch (err) {
        console.error('Error fetching user dashboard stats:', err);
      }
    };

    if (user) {
      fetchMatchesAndStats();
    }
  }, [user]);

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

  // Call duration timer
  useEffect(() => {
    let timer;
    if (callState === 'active') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Handle call connecting sequence simulation
  useEffect(() => {
    let timeout;
    if (callState === 'ringing') {
      timeout = setTimeout(() => {
        setCallState('connecting');
        timeout = setTimeout(() => {
          setCallState('active');
        }, 1200);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [callState]);

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

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateCall = (type) => {
    const isPremium = userStats?.plan === 'PREMIUM' || userStats?.plan === 'GOLD';
    if (!isPremium) {
      setShowUpgradeModal(true);
    } else {
      setCallType(type);
      setCallState('ringing');
    }
  };

  const handleQuickReply = (reply) => {
    setMessageText(reply);
  };

  const selectedThemeObj = themes.find((t) => t.id === activeTheme) || themes[0];
  const activeRecipientProfile = activeChat
    ? profiles.find((p) => p.userId === activeChat.recipientId)
    : null;

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
        <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            {userStats?.plan && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                userStats.plan === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                userStats.plan === 'PREMIUM' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {userStats.plan} Plan
              </span>
            )}
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
                    onClick={() => {
                      setActiveChat(c);
                      setShowDrawer(false);
                    }}
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
        <div className={`w-full md:flex flex-grow flex-1 flex-col bg-white ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="mr-3 md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    {activeChat.recipientAvatar ? (
                      <img
                        src={activeChat.recipientAvatar}
                        alt={activeChat.recipientName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 animate-in fade-in zoom-in-75 duration-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-gray-900">{activeChat.recipientName}</h3>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 text-gray-400 items-center">
                  {/* Theme Selector Button */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowThemePicker(!showThemePicker)}
                      className={`p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition ${showThemePicker ? 'bg-gray-100 text-matrimony-600' : ''}`}
                      title="Choose chat theme"
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                    {showThemePicker && (
                      <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-30 w-48 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Select Theme</h4>
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setActiveTheme(t.id);
                              setShowThemePicker(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${activeTheme === t.id ? 'bg-matrimony-50 text-matrimony-600 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                          >
                            <span className="flex items-center space-x-2">
                              <span className={`w-3.5 h-3.5 rounded-full border border-gray-200 ${
                                t.id === 'rose' ? 'bg-pink-200' :
                                t.id === 'lavender' ? 'bg-purple-200' :
                                t.id === 'gold' ? 'bg-yellow-200' : 'bg-gray-200'
                              }`} />
                              <span>{t.name}</span>
                            </span>
                            {activeTheme === t.id && <span className="w-1.5 h-1.5 rounded-full bg-matrimony-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => initiateCall('voice')}
                    className="p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition"
                    title="Start Voice Call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => initiateCall('video')}
                    className="p-2 rounded-full hover:bg-gray-100 hover:text-matrimony-600 transition"
                    title="Start Video Call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowDrawer(!showDrawer)}
                    className={`p-2 rounded-full hover:bg-gray-100 hover:text-gray-600 transition ${showDrawer ? 'bg-gray-100 text-gray-600' : ''}`}
                    title="View Profile Details"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Body - Flex Row for Messages & Sliding Drawer */}
              <div className="flex-1 flex overflow-hidden relative">
                
                {/* Messages Panel Container */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  
                  {/* Messages Area */}
                  <div 
                    className={`flex-1 overflow-y-auto p-6 space-y-4 relative ${selectedThemeObj.class} transition-all duration-300`}
                    style={{
                      backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 0)',
                      backgroundSize: '16px 16px'
                    }}
                  >
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
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center mr-3 mt-1 shadow-sm">
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
                              className={`p-3.5 rounded-2xl max-w-[70%] transition-shadow ${
                                isOutgoing
                                  ? 'bg-matrimony-600 text-white rounded-tr-none shadow-md'
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                              }`}
                            >
                              <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                              <div className="flex items-center justify-end space-x-1 mt-1.5">
                                <span
                                  className={`text-[9px] block ${
                                    isOutgoing ? 'text-matrimony-200' : 'text-gray-400'
                                  }`}
                                >
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isOutgoing && (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                    
                    {/* Quick Reply Chips */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-gray-50 hover:bg-matrimony-50 hover:text-matrimony-600 border border-gray-200 hover:border-matrimony-100 text-gray-600 px-3.5 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-semibold shadow-sm active:scale-95 shrink-0"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>

                    {/* Chat Text Input Form */}
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
                </div>

                {/* Right Profile Side Drawer */}
                {showDrawer && (
                  <div className="w-full md:w-80 border-l border-gray-100 bg-white flex flex-col h-full absolute right-0 top-0 md:relative z-20 shadow-xl md:shadow-none animate-in slide-in-from-right duration-300">
                    {/* Drawer Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Member Profile</h3>
                      <button 
                        onClick={() => setShowDrawer(false)}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                      {/* Avatar and Match Score */}
                      <div className="text-center space-y-3">
                        <div className="relative inline-block">
                          {activeChat.recipientAvatar ? (
                            <img
                              src={activeChat.recipientAvatar}
                              alt={activeChat.recipientName}
                              className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-rose-500/20 border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto border border-gray-200 shadow-inner">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          {activeRecipientProfile?.matchScore && (
                            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                              {activeRecipientProfile.matchScore}% Match
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <h4 className="font-extrabold text-gray-900 text-lg">{activeChat.recipientName}</h4>
                          <p className="text-xs text-green-500 font-bold flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Online
                          </p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="space-y-4">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About & Details</h5>
                        
                        {activeRecipientProfile ? (
                          <div className="space-y-3.5">
                            {activeRecipientProfile.aboutMe && (
                              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-600 italic">"{activeRecipientProfile.aboutMe}"</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/30">
                                <span className="text-gray-400 block mb-0.5">Sub-caste</span>
                                <span className="font-semibold text-gray-800">{activeRecipientProfile.subCaste || 'Brahmin'}</span>
                              </div>
                              <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/30">
                                <span className="text-gray-400 block mb-0.5">Location</span>
                                <span className="font-semibold text-gray-800 truncate block">{activeRecipientProfile.location || 'West Bengal'}</span>
                              </div>
                              <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/30 col-span-2">
                                <span className="text-gray-400 block mb-0.5">Education</span>
                                <span className="font-semibold text-gray-800 truncate block">{activeRecipientProfile.education || 'Not specified'}</span>
                              </div>
                              <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/30 col-span-2">
                                <span className="text-gray-400 block mb-0.5">Occupation</span>
                                <span className="font-semibold text-gray-800 truncate block">{activeRecipientProfile.occupation || 'Not specified'}</span>
                              </div>
                              <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/30">
                                <span className="text-gray-400 block mb-0.5">Marital Status</span>
                                <span className="font-semibold text-gray-800">{activeRecipientProfile.maritalStatus?.replace('_', ' ') || 'Never Married'}</span>
                              </div>
                              <div className="bg-rose-50/30 rounded-xl p-2.5 border border-rose-100/30">
                                <span className="text-gray-400 block mb-0.5">Mother Tongue</span>
                                <span className="font-semibold text-gray-800">{activeRecipientProfile.motherTongue || 'Bengali'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Sparkles className="w-6 h-6 text-rose-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Connecting details...</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Full profile is loading</p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => navigate('/search')}
                        className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-xs text-gray-700 transition flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        View Similar Matches
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-200 animate-pulse" />
              <h3 className="text-lg font-bold text-gray-700">No Chat Selected</h3>
              <p className="text-sm mt-1 text-center max-w-sm">
                Choose a conversation from the sidebar or click Connect on someone's profile to start messaging!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Call Simulation Modal */}
      {callType && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white">
          <div className="w-full max-w-md p-6 text-center flex flex-col h-[600px] justify-between">
            {/* Top Info */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 inline-block">
                Secure BrahminMilan Call
              </span>
              <p className="text-sm text-gray-400 pt-2">{callType === 'video' ? 'Video Connection' : 'Voice Connection'}</p>
            </div>

            {/* Profile Frame with Ringing Animation */}
            <div className="flex flex-col items-center justify-center space-y-6 my-auto">
              <div className="relative">
                {/* Ringing waves */}
                {callState === 'ringing' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
                    <div className="absolute -inset-4 rounded-full border-2 border-rose-500/20 animate-pulse" />
                  </>
                )}
                {callState === 'active' && (
                  <div className="absolute -inset-2 rounded-full border-2 border-green-500/50 animate-pulse" />
                )}
                
                {activeChat.recipientAvatar ? (
                  <img
                    src={activeChat.recipientAvatar}
                    alt={activeChat.recipientName}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-white/10 relative z-10 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center ring-4 ring-white/10 relative z-10 shadow-2xl">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-extrabold">{activeChat.recipientName}</h2>
                <div className="mt-2 text-sm font-semibold flex items-center justify-center gap-1.5">
                  {callState === 'ringing' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                      Ringing...
                    </span>
                  )}
                  {callState === 'connecting' && (
                    <span className="text-yellow-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      Connecting...
                    </span>
                  )}
                  {callState === 'active' && (
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping mr-1" />
                      {formatCallDuration(callDuration)}
                    </span>
                  )}
                  {callState === 'ended' && (
                    <span className="text-rose-500 flex items-center gap-1">
                      Call Ended
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Video Call Simulation Overlay */}
            {callType === 'video' && callState === 'active' && (
              <div className="absolute inset-x-4 top-20 bottom-36 bg-gray-800 rounded-3xl overflow-hidden border border-white/10 shadow-inner z-0 flex items-center justify-center">
                {/* Remote Video (Mocked by recipient image filling the box) */}
                {activeChat.recipientAvatar ? (
                  <img
                    src={activeChat.recipientAvatar}
                    alt={activeChat.recipientName}
                    className="w-full h-full object-cover filter brightness-75"
                  />
                ) : (
                  <div className="text-gray-500 text-xs">Remote Feed Loading...</div>
                )}
                
                {/* Local Video Picture-in-Picture */}
                <div className="absolute right-4 bottom-4 w-28 h-40 bg-gray-950 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg z-10">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[9px] bg-black/40 px-1 rounded text-white font-bold">You</div>
                </div>

                {/* Video Info Label */}
                <div className="absolute left-4 top-4 bg-black/50 text-[10px] px-2.5 py-1 rounded-full text-white font-semibold flex items-center gap-1 backdrop-blur-sm z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  HD 1080p Simulated Connection
                </div>
              </div>
            )}

            {/* Call Controls */}
            <div className="relative z-10 flex justify-center items-center space-x-6">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                disabled={callState !== 'active'}
                className={`p-4 rounded-full border transition-all ${
                  isMuted 
                    ? 'bg-rose-500 border-rose-400 text-white' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20 text-white disabled:opacity-30'
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button 
                onClick={() => {
                  setCallState('ended');
                  setTimeout(() => {
                    setCallType(null);
                    setCallState('idle');
                  }, 800);
                }}
                className="p-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transform hover:scale-105 transition duration-150"
                title="End Call"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              <button 
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                disabled={callState !== 'active'}
                className={`p-4 rounded-full border transition-all ${
                  isSpeakerOn 
                    ? 'bg-green-600 border-green-500 text-white' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20 text-white disabled:opacity-30'
                }`}
                title="Speakerphone"
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Premium Lock Screen Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-rose-500 to-rose-700 px-6 py-8 text-center text-white relative">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-14 h-14 bg-yellow-400 text-yellow-950 rounded-full flex items-center justify-center mx-auto border-4 border-white/30 shadow-lg mb-4 animate-bounce">
                <Crown className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-extrabold">Unlock Calls with Premium</h3>
              <p className="text-xs text-rose-100 mt-1">Experience direct, seamless connections with your matches</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Upgrade your subscription plan to unlock secure voice and video calls directly from the chat screen. Verify compatibility instantly.
              </p>

              {/* Benefits list */}
              <div className="space-y-2.5 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 text-xs text-gray-700">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mr-2.5" />
                  Unlimited secure voice & video calling
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mr-2.5" />
                  View match contact numbers instantly
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mr-2.5" />
                  Send unlimited match interests
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mr-2.5" />
                  Highlight profile badge to get 5x more views
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setShowUpgradeModal(false);
                    navigate('/upgrade');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-md transition duration-150 text-center block text-sm"
                >
                  Explore Premium Plans
                </button>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
