'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Send, User, Bot, Loader2, Plus, Trash2, MessageSquare } from 'lucide-react';
import { apiRequest, getConversations, getConversationMessages, deleteConversation, type Conversation, type ConversationMessage } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const availableModels = [
        { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversations on mount
    useEffect(() => {
        if (session?.user?.id) {
            loadConversations();
        }
    }, [session?.user?.id]);

    const loadConversations = async () => {
        if (!session?.user?.id) return;

        try {
            setIsLoadingConversations(true);
            const convs = await getConversations(session.user.id);
            setConversations(convs);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const loadConversationMessages = async (conversationId: string) => {
        if (!session?.user?.id) return;

        try {
            setIsLoading(true);
            const msgs = await getConversationMessages(session.user.id, conversationId);
            setMessages(msgs.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.created_at)
            })));
            setActiveConversationId(conversationId);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewConversation = () => {
        setActiveConversationId(null);
        setMessages([]);
    };

    const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!session?.user?.id) return;

        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await deleteConversation(session.user.id, conversationId);
            if (activeConversationId === conversationId) {
                handleNewConversation();
            }
            await loadConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim() || !session?.user?.id) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await apiRequest<{ response: string; success: boolean; conversation_id: string }>(
                `/api/${session.user.id}/chat`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        message: userMessage.content,
                        conversation_id: activeConversationId,
                        model: selectedModel
                    }),
                }
            );

            if (response.success) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);

                // Update active conversation ID if it's a new conversation
                if (!activeConversationId && response.conversation_id) {
                    setActiveConversationId(response.conversation_id);
                }

                // Reload conversations to update the list
                await loadConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error processing your request.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 p-2">
            {/* Conversations Sidebar */}
            <div className="w-85 glass-panel-neon flex flex-col overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-[0.2em] text-xs opacity-50">Memory Logs</h2>
                        <button
                            onClick={handleNewConversation}
                            className="p-2 hover:bg-neon-cyan/20 rounded-xl transition-all duration-300 border border-transparent hover:border-neon-cyan/30 active:scale-95 group"
                            title="Initialize New Stream"
                        >
                            <Plus className="w-6 h-6 text-neon-cyan group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {isLoadingConversations ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500 px-6">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-full mb-4">
                                <MessageSquare className="w-10 h-10 opacity-20" />
                            </div>
                            <p className="text-sm font-semibold text-center uppercase tracking-widest text-[10px]">No Neural Streams</p>
                            <p className="text-[10px] text-center mt-2 opacity-60">Initialize your first objective.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => loadConversationMessages(conv.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${activeConversationId === conv.id
                                        ? 'bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_20px_rgba(0,243,255,0.1)]'
                                        : 'hover:bg-white/5 border border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold truncate text-sm tracking-tight ${activeConversationId === conv.id ? 'text-white' : 'text-gray-400'}`}>
                                                {conv.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[10px] px-2 py-0.5 bg-white/5 text-neon-cyan rounded-md font-bold uppercase tracking-wider border border-white/5">
                                                    {conv.message_count} Nodes
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                                                    {new Date(conv.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-neon-pink/20 rounded-lg transition-all duration-300 border border-transparent hover:border-neon-pink/30"
                                            title="Purge Stream"
                                        >
                                            <Trash2 className="w-4 h-4 text-neon-pink" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic"><span className="text-neon-cyan">Neural</span> Interface</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1 ml-1">Predictive Analytics Platform</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neon-purple outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all cursor-pointer hover:bg-white/10"
                        >
                            {availableModels.map(model => (
                                <option key={model.id} value={model.id} className="bg-dark-bg">{model.name}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                            <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse shadow-[0_0_8px_rgba(0,243,255,1)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 glass-panel flex flex-col overflow-hidden relative border-white/5">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] -z-10 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '1000ms' }} />

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <div className="w-24 h-24 glass-panel border-neon-cyan/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,243,255,0.1)] rotate-3 animate-float transition-all hover:rotate-0 hover:scale-110">
                                    <Bot className="w-12 h-12 text-neon-cyan" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">System Ready</h3>
                                <p className="text-center max-w-xs text-xs font-bold uppercase tracking-[0.15em] opacity-40">Awaiting user command input. Standing by for task allocation.</p>
                                <div className="mt-12 grid grid-cols-1 gap-4 w-full max-w-md">
                                    <div className="p-4 glass-panel border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.1em] text-neon-cyan hover:bg-neon-cyan/5 transition-all cursor-pointer flex items-center gap-3 group">
                                        <div className="w-2 h-2 rounded-full bg-neon-cyan/30 group-hover:bg-neon-cyan transition-colors" />
                                        "Synchronize pending objectives"
                                    </div>
                                    <div className="p-4 glass-panel border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.1em] text-neon-purple hover:bg-neon-purple/5 transition-all cursor-pointer flex items-center gap-3 group">
                                        <div className="w-2 h-2 rounded-full bg-neon-purple/30 group-hover:bg-neon-purple transition-colors" />
                                        "Generate productivity analytics"
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                                        } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border transition-all duration-300 ${msg.role === 'user'
                                            ? 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                                            : 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.2)]'
                                            }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <User className="w-6 h-6" />
                                        ) : (
                                            <Bot className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div
                                        className={`max-w-[80%] p-5 rounded-2xl relative border transition-all duration-500 ${msg.role === 'user'
                                            ? 'bg-neon-cyan/5 border-neon-cyan/20 text-white rounded-tr-none shadow-[0_0_30px_rgba(0,243,255,0.05)]'
                                            : 'bg-white/5 backdrop-blur-xl text-gray-100 border-white/10 rounded-tl-none shadow-[0_0_30px_rgba(255,255,255,0.02)] hover:border-neon-purple/30'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                        <div className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] opacity-40 ${msg.role === 'user' ? 'text-neon-cyan' : 'text-neon-purple'}`}>
                                            {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-start gap-5 animate-pulse">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl rounded-tl-none border border-white/10 min-w-[100px] flex items-center justify-center">
                                    <div className="flex gap-2">
                                        <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce shadow-[0_0_8px_rgba(188,19,254,1)]" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce shadow-[0_0_8px_rgba(188,19,254,1)]" style={{ animationDelay: '200ms' }} />
                                        <div className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce shadow-[0_0_8px_rgba(188,19,254,1)]" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-black/40 backdrop-blur-2xl border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex gap-4 max-w-5xl mx-auto items-center">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Execute neural command..."
                                    className="input-neon pr-16 text-sm font-semibold h-14"
                                    disabled={isLoading}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-neon-cyan transition-all duration-300">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="w-14 h-14 bg-neon-cyan text-black rounded-xl flex items-center justify-center disabled:opacity-30 disabled:grayscale disabled:transform-none transition-all duration-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] active:scale-95"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Send className="w-6 h-6" />
                                )}
                            </button>
                        </form>
                        <p className="text-[9px] text-center mt-4 text-gray-600 font-bold uppercase tracking-[0.4em]">
                            System Status: <span className="text-neon-cyan">Optimal</span> • Integrity: <span className="text-neon-purple">100%</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
