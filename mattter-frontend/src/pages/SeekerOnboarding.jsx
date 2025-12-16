import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle2,
    Users,
    Sparkles,
    Calendar,
    Heart,
    Scissors,
    User,
    Hand,
    Droplets,
    Shirt,
    Laptop,
    ChevronRight,
    ChevronLeft,
    Check, // Added Check icon
    DollarSign // Added DollarSign icon
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import LoadingSpinner from '../components/LoadingSpinner'; // Added LoadingSpinner import

const SeekerOnboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        consultation_type: [],
        service_scope: '',
        services_selected: [],
        budget_catalyst: '',
        budget_personal: ''
    });

    const totalSteps = 3;

    const handleConsultationTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            consultation_type: prev.consultation_type.includes(type)
                ? prev.consultation_type.filter(t => t !== type)
                : [...prev.consultation_type, type]
        }));
    };

    const handleServiceScopeChange = (scope) => {
        setFormData(prev => ({
            ...prev,
            service_scope: scope,
            // Auto-select all services for complete rebranding
            services_selected: scope === 'complete_rebranding'
                ? ['body_fitness', 'hair', 'skincare', 'nails', 'hygiene', 'wardrobe']
                : ['wardrobe']
        }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => ({
            ...prev,
            services_selected: prev.services_selected.includes(service)
                ? prev.services_selected.filter(s => s !== service)
                : [...prev.services_selected, service]
        }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        navigate('/seeker');
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/profiles/update_preferences/`,
                formData,
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            navigate('/seeker');
        } catch (err) {
            setError('Failed to save preferences. Please try again.');
            console.error('Error saving preferences:', err);
        } finally {
            setSaving(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.consultation_type.length > 0;
            case 2:
                return formData.service_scope !== '' && formData.services_selected.length > 0;
            case 3:
                return formData.budget_catalyst !== '' && formData.budget_personal !== '';
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-3xl w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                        Let's Personalize Your Experience
                    </h1>
                    <p className="text-text-secondary">
                        Help us match you with the perfect style catalyst
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-center">
                        {['Consultation', 'Services', 'Budget'].map((label, index) => {
                            const step = index + 1;
                            return (
                                <React.Fragment key={step}>
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 z-10 transition-colors duration-300 ${step < currentStep
                                            ? 'bg-accent-purple text-white'
                                            : step === currentStep
                                                ? 'bg-accent-pink text-white'
                                                : 'bg-dark-elevated text-text-muted'
                                            } `}>
                                            {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
                                        </div>
                                        <span className={`absolute top-full mt-3 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${step <= currentStep ? 'text-text-primary' : 'text-text-muted'
                                            } `}>
                                            {label}
                                        </span>
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-24 sm:w-32 h-1 mx-2 transition-colors duration-300 ${step < currentStep ? 'bg-accent-purple' : 'bg-dark-border'
                                            } `}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Consultation Type */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary mb-2">
                                    How would you like to meet your catalyst?
                                </h2>
                                <p className="text-text-secondary">
                                    Choose one or both options
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleConsultationTypeToggle('physical')}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.consultation_type.includes('physical')
                                        ? 'bg-accent-purple/20 border-accent-purple'
                                        : 'bg-dark-elevated border-dark-border hover:border-accent-purple/50'
                                        } `}
                                >
                                    <Users className="w-12 h-12 text-accent-purple mb-4" />
                                    <h3 className="text-xl font-bold text-text-primary mb-2">Physical (In-Person)</h3>
                                    <p className="text-text-secondary text-sm">
                                        Meet your catalyst face-to-face for hands-on styling sessions
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleConsultationTypeToggle('online')}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${formData.consultation_type.includes('online')
                                        ? 'bg-accent-blue/20 border-accent-blue'
                                        : 'bg-dark-elevated border-dark-border hover:border-accent-blue/50'
                                        } `}
                                >
                                    <Laptop className="w-12 h-12 text-accent-blue mb-4" />
                                    <h3 className="text-xl font-bold text-text-primary mb-2">Online (Virtual)</h3>
                                    <p className="text-text-secondary text-sm">
                                        Connect remotely via video calls from anywhere
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Service Scope */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary mb-2">
                                    What kind of transformation are you looking for?
                                </h2>
                                <p className="text-text-secondary">
                                    Select your desired service scope
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => handleServiceScopeChange('complete_rebranding')}
                                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${formData.service_scope === 'complete_rebranding'
                                        ? 'bg-accent-pink/20 border-accent-pink'
                                        : 'bg-dark-elevated border-dark-border hover:border-accent-pink/50'
                                        } `}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary mb-2">Complete Rebranding</h3>
                                            <p className="text-text-secondary text-sm mb-4">
                                                Full transformation including physical aspects and wardrobe
                                            </p>
                                        </div>
                                        <Sparkles className="w-8 h-8 text-accent-pink" />
                                    </div>

                                    {formData.service_scope === 'complete_rebranding' && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-border">
                                            {[
                                                { id: 'body_fitness', label: 'Body & Fitness', icon: Heart },
                                                { id: 'hair', label: 'Hair Styling', icon: Scissors },
                                                { id: 'skincare', label: 'Skincare & Face', icon: Droplets },
                                                { id: 'nails', label: 'Nails & Grooming', icon: Hand },
                                                { id: 'hygiene', label: 'Hygiene', icon: User },
                                                { id: 'wardrobe', label: 'Wardrobe & Fashion', icon: Shirt },
                                            ].map(({ id, label, icon: Icon }) => (
                                                <div
                                                    key={id}
                                                    className="flex items-center space-x-2 p-2 rounded-lg bg-accent-purple/20 text-accent-purple/70 opacity-60 pointer-events-none select-none"
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-xs font-medium">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleServiceScopeChange('wardrobe_only')}
                                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${formData.service_scope === 'wardrobe_only'
                                        ? 'bg-accent-gold/20 border-accent-gold'
                                        : 'bg-dark-elevated border-dark-border hover:border-accent-gold/50'
                                        } `}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary mb-2">Wardrobe & Fashion Only</h3>
                                            <p className="text-text-secondary text-sm">
                                                Focus on clothing, shoes, and accessories styling
                                            </p>
                                        </div>
                                        <Shirt className="w-8 h-8 text-accent-gold" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Budget */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary mb-2">
                                    What's your budget?
                                </h2>
                                <p className="text-text-secondary">
                                    Help us find catalysts within your price range
                                </p>
                            </div>

                            {/* Catalyst Budget */}
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-3">
                                    Budget for Catalyst Fees
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['free', '200-500', '500-1000', '1000-2000', '2000-5000', '5000+'].map((range) => (
                                        <button
                                            key={range}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, budget_catalyst: range }))}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.budget_catalyst === range
                                                ? 'bg-accent-purple/20 border-accent-purple text-accent-purple'
                                                : 'bg-dark-elevated border-dark-border text-text-secondary hover:border-accent-purple/50'
                                                } `}
                                        >
                                            <div className="font-semibold">
                                                {range === 'free' ? 'Free' : `₹${range} `}
                                            </div>
                                            {range === 'free' && (
                                                <div className="text-xs mt-1 opacity-75">Pro-bono</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Personal Budget */}
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary mb-3">
                                    Budget for Personal Transformation
                                </h3>
                                <p className="text-sm text-text-muted mb-3">
                                    Products, services, and lifestyle changes
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['200-1000', '1000-3000', '3000-5000', '5000-10000', '10000+'].map((range) => (
                                        <button
                                            key={range}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, budget_personal: range }))}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.budget_personal === range
                                                ? 'bg-accent-pink/20 border-accent-pink text-accent-pink'
                                                : 'bg-dark-elevated border-dark-border text-text-secondary hover:border-accent-pink/50'
                                                } `}
                                        >
                                            <div className="font-semibold">₹{range}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-dark-border">
                        <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                            {currentStep === 1 && (
                                <button
                                    onClick={handleSkip}
                                    className="text-text-muted hover:text-text-secondary transition-colors text-sm py-2 sm:py-0"
                                >
                                    Skip for now
                                </button>
                            )}
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary hover:bg-dark-surface transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Back</span>
                                </button>
                            )}
                        </div>

                        <div className="w-full sm:w-auto">
                            {currentStep < totalSteps ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${isStepValid()
                                        ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white hover:shadow-lg hover:shadow-accent-purple/50'
                                        : 'bg-dark-elevated text-text-muted cursor-not-allowed'
                                        } `}
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStepValid() || saving}
                                    className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${isStepValid() && !saving
                                        ? 'bg-gradient-to-r from-accent-purple to-accent-pink text-white hover:shadow-lg hover:shadow-accent-purple/50'
                                        : 'bg-dark-elevated text-text-muted cursor-not-allowed'
                                        } `}
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <LoadingSpinner size="sm" color="text-white" />
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Complete Setup</span>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeekerOnboarding;
