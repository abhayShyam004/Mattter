import React, { useState, useEffect, useRef } from 'react';
import { XCircle, Send, MessageCircle, Loader, Info } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const MessagingModal = ({ booking, onClose, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const otherUser = booking.seeker.id === currentUser.id ? booking.catalyst : booking.seeker;

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/messages/?booking_id=${booking.id}`);
            setMessages(response.data);
            setLoading(false);

            // Mark messages as read
            await axios.post(`${API_BASE_URL}/api/messages/mark_as_read/`, {
                booking_id: booking.id
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await axios.post(`${API_BASE_URL}/api/messages/`, {
                booking: booking.id,
                content: newMessage.trim()
            });
            setNewMessage('');
            fetchMessages(); // Refresh messages
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch messages on mount
    useEffect(() => {
        fetchMessages();
    }, []);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-dark-surface border border-dark-border rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-border">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-accent-purple" />
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">
                                Chat with {otherUser.username}
                            </h2>
                            <p className="text-sm text-text-secondary">Messages refresh every 5 seconds</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Auto-delete notice */}
                <div className="px-6 pt-4 pb-2">
                    <div className="flex items-start gap-2 bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-3">
                        <Info className="w-4 h-4 text-accent-purple mt-0.5" />
                        <p className="text-xs text-text-secondary">
                            Messages automatically delete after 1 week for privacy
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="w-6 h-6 text-accent-purple animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-text-secondary">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isCurrentUser = message.sender.id === currentUser.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${isCurrentUser
                                            ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white'
                                            : 'bg-dark-elevated text-text-primary'
                                            }`}
                                    >
                                        <p className="text-sm mb-1">{message.content}</p>
                                        <p className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-text-muted'}`}>
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-6 border-t border-dark-border">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 bg-dark-elevated border border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl text-white font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {sending ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessagingModal;
