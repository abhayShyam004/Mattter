import React from 'react';
import { Loader, Loader2 } from 'lucide-react';

const SpinnerShowroom = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-text-primary p-8">
            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                Spinner Comparison Showroom
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1. The Standard Tailwind CSS Spinner (Current "New" One) */}
                <div className="bg-dark-surface border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-semibold text-accent-purple">1. Current (Tailwind Ring)</h2>
                    <p className="text-text-secondary text-sm text-center">Standard CSS border spinner</p>
                    <div className="p-8 bg-dark-elevated rounded-lg">
                        <div className="w-12 h-12 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
                    </div>
                </div>

                {/* 2. Lucide Loader (Possible "Old" One) */}
                <div className="bg-dark-surface border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-semibold text-accent-purple">2. Lucide Icon Loader</h2>
                    <p className="text-text-secondary text-sm text-center">SVG Icon with rotation</p>
                    <div className="p-8 bg-dark-elevated rounded-lg">
                        <Loader className="w-12 h-12 text-accent-purple animate-spin" />
                    </div>
                </div>

                {/* 3. Lucide Loader 2 */}
                <div className="bg-dark-surface border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-semibold text-accent-purple">3. Lucide Loader 2</h2>
                    <p className="text-text-secondary text-sm text-center">Use for some buttons previously</p>
                    <div className="p-8 bg-dark-elevated rounded-lg">
                        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
                    </div>
                </div>

                {/* 4. Modern Glass/Pulse (Premium Alternative) */}
                <div className="bg-dark-surface border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-semibold text-accent-purple">4. Premium Pulse</h2>
                    <p className="text-text-secondary text-sm text-center">Pulsing double ring</p>
                    <div className="p-8 bg-dark-elevated rounded-lg flex items-center justify-center">
                        <span className="relative flex h-12 w-12">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-12 w-12 bg-accent-purple/50 border-2 border-white/50"></span>
                        </span>
                    </div>
                </div>

                {/* 5. Minimal Dots (Another Alternative) */}
                <div className="bg-dark-surface border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-semibold text-accent-purple">5. Minimal Dots</h2>
                    <p className="text-text-secondary text-sm text-center">Subtle loading state</p>
                    <div className="p-8 bg-dark-elevated rounded-lg flex space-x-2">
                        <div className="w-3 h-3 bg-accent-purple rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-accent-pink rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-accent-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpinnerShowroom;
