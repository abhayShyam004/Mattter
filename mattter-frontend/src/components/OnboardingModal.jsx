import React from 'react';
import { X, CheckCircle, ArrowRight, User, Bell, Users } from 'lucide-react';

const OnboardingModal = ({ onClose, onStartProfile }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-dark-surface border border-dark-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
                {/* Header with decorative background */}
                <div className="relative p-6 md:p-8 overflow-hidden bg-gradient-to-br from-dark-elevated to-dark-surface border-b border-dark-border">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-pink/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 pr-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent leading-tight">
                            Welcome to Mattter!
                        </h2>
                        <p className="text-text-secondary text-base md:text-lg">
                            Let's get your profile ready to attract seekers.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-dark-elevated rounded-full text-text-secondary hover:text-white hover:bg-dark-border transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 md:p-8 space-y-4 md:space-y-8">
                    {/* Step 1: Complete Profile */}
                    <div className="flex flex-col md:flex-row gap-4 items-start bg-dark-elevated/30 md:bg-transparent p-4 md:p-0 rounded-2xl border border-dark-border/50 md:border-none">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent-purple/20 flex items-center justify-center text-accent-purple">
                            <User className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="w-full">
                            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2">1. Complete Your Profile</h3>
                            <p className="text-text-secondary mb-3 leading-relaxed text-sm md:text-base">
                                A complete profile builds trust. To get started:
                            </p>
                            <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm">
                                <span className="px-2 py-1 md:px-3 md:py-1 rounded-lg bg-dark-elevated border border-dark-border font-medium text-text-primary whitespace-nowrap">View Details</span>
                                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-text-muted" />
                                <span className="px-2 py-1 md:px-3 md:py-1 rounded-lg bg-dark-elevated border border-dark-border font-medium text-text-primary whitespace-nowrap">Edit Details</span>
                                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-text-muted" />
                                <span className="px-2 py-1 md:px-3 md:py-1 rounded-lg bg-green-500/20 border border-green-500/30 font-medium text-green-400 whitespace-nowrap">Save</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Requests Workflow */}
                    <div className="flex flex-col md:flex-row gap-4 items-start bg-dark-elevated/30 md:bg-transparent p-4 md:p-0 rounded-2xl border border-dark-border/50 md:border-none">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent-gold/20 flex items-center justify-center text-accent-gold">
                            <Bell className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2">2. Manage Requests</h3>
                            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                                Seekers will send you booking requests. You'll see them in the <span className="font-semibold text-text-primary">"Incoming Requests"</span> section. You can review their notes and accept or reject them.
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Matches */}
                    <div className="flex flex-col md:flex-row gap-4 items-start bg-dark-elevated/30 md:bg-transparent p-4 md:p-0 rounded-2xl border border-dark-border/50 md:border-none">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent-pink/20 flex items-center justify-center text-accent-pink">
                            <Users className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2">3. Connect with Seekers</h3>
                            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                                Once you accept a request, the seeker moves to your <span className="font-semibold text-text-primary">"Matched Seekers"</span> list. This is where you can view their contact details and start your styling journey!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 md:p-6 bg-dark-elevated border-t border-dark-border flex md:justify-end">
                    <button
                        onClick={onStartProfile}
                        className="w-full md:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl text-white font-bold text-base md:text-lg hover:shadow-lg hover:shadow-accent-purple/50 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        Start Editing Profile
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
