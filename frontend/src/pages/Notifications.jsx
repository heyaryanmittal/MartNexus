import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Mail, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Send, BarChart3, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Notifications = () => {
    const { activeShop } = useStore();
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);
    const [filter, setFilter] = useState({
        type: '',
        status: ''
    });
    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [activeShop, filter]);

    const fetchNotifications = async () => {
        try {
            const params = new URLSearchParams();
            if (activeShop) params.append('shopId', activeShop.id);
            if (filter.type) params.append('type', filter.type);
            if (filter.status) params.append('status', filter.status);
            params.append('limit', '50');

            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/notifications/logs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            if (activeShop) params.append('shopId', activeShop.id);

            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/notifications/stats?${params}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleRetry = async (notificationId) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/notifications/retry/${notificationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Notification resent successfully');
                fetchNotifications();
                fetchStats();
            } else {
                toast.error(data.message || 'Failed to resend notification');
            }
        } catch (error) {
            toast.error('Failed to resend notification');
        }
    };

    const handleDelete = (notification) => {
        setNotificationToDelete(notification);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (notificationToDelete) {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/notifications/${notificationToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    toast.success('Notification deleted');
                    fetchNotifications();
                    fetchStats();
                } else {
                    toast.error(data.message || 'Failed to delete notification');
                }
                setDeleteDialogOpen(false);
                setNotificationToDelete(null);
            } catch (error) {
                toast.error('Failed to delete notification');
            }
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Please enter an email address');
            return;
        }

        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/notifications/test-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ testEmail })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Test email sent successfully!');
                setTestEmail('');
            } else {
                toast.error(data.message || 'Failed to send test email');
            }
        } catch (error) {
            toast.error('Failed to send test email');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SENT':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'FAILED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'RETRYING':
                return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'LOW_STOCK_ALERT':
                return 'bg-red-100 text-red-800';
            case 'BACKUP_SUCCESS':
                return 'bg-green-100 text-green-800';
            case 'BACKUP_FAILURE':
                return 'bg-orange-100 text-orange-800';
            case 'OTP_VERIFICATION':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                { }
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">📧 Notifications</h1>
                    <p className="text-gray-600">Manage email notifications and view logs</p>
                </div>

                { }
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm font-medium">Total Sent</span>
                                <Mail className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm font-medium">Successful</span>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm font-medium">Failed</span>
                                <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600 text-sm font-medium">Success Rate</span>
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold text-purple-600">{stats.successRate}%</p>
                        </div>
                    </div>
                )}

                { }
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Send className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Test Email Configuration</h3>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Enter email address to test"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleTestEmail}
                            disabled={loading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Test Email
                                </>
                            )}
                        </button>
                    </div>
                </div>

                { }
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={filter.type}
                                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="LOW_STOCK_ALERT">Low Stock Alert</option>
                                <option value="BACKUP_SUCCESS">Backup Success</option>
                                <option value="BACKUP_FAILURE">Backup Failure</option>
                                <option value="OTP_VERIFICATION">OTP Verification</option>
                                <option value="GENERAL">General</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="SENT">Sent</option>
                                <option value="FAILED">Failed</option>
                                <option value="PENDING">Pending</option>
                                <option value="RETRYING">Retrying</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchNotifications}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                { }
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notification Logs</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No notifications found
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((notification) => (
                                        <tr key={notification.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                                                    {notification.type.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">{notification.recipient}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">{notification.subject}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(notification.status)}
                                                    <span className="text-sm text-gray-900">{notification.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">
                                                    {notification.sentAt
                                                        ? new Date(notification.sentAt).toLocaleString('en-IN')
                                                        : 'Not sent'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {notification.status === 'FAILED' && (
                                                        <button
                                                            onClick={() => handleRetry(notification.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Retry"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                { }
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">📌 Notification Information</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Low Stock Alerts:</strong> Sent daily at 9:00 AM for products below reorder level</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Backup Notifications:</strong> Sent after automatic weekly backups (Sunday 2:00 AM)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Email Configuration:</strong> Configure EMAIL_* variables in backend .env file</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Failed Notifications:</strong> Can be retried manually from this page</span>
                        </li>
                    </ul>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Notification
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this notification?
                            <br />
                            <strong>Type:</strong> {notificationToDelete?.type.replace(/_/g, ' ')}
                            <br />
                            <strong>Recipient:</strong> {notificationToDelete?.recipient}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Notifications;
