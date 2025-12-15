import React, { useState } from 'react';
import axios from 'axios';
import { X, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ReportModal = ({ isOpen, onClose, reportedUser }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/reports/`, {
                reported_user_id: reportedUser.id,
                reason: reason
            }, {
                headers: { Authorization: `Token ${token}` }
            });
            onClose();
            alert('Report submitted successfully.');
            setReason(''); // Reset form
        } catch (err) {
            console.error(err);
            setError('Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-dark-surface border border-dark-border rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Report User</h3>
                </div>

                <p className="text-text-secondary mb-4">
                    Reporting <span className="font-bold text-white">{reportedUser?.username}</span>.
                    Please describe the issue in detail.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 min-h-[120px]"
                        placeholder="Why are you reporting this user?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
