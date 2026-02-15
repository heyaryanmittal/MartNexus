import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Download, Database, FileSpreadsheet, FileText, History, Trash2, RefreshCw, Calendar, HardDrive, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
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

const BackupExport = () => {
    const { activeShop } = useStore();
    const [backupHistory, setBackupHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [backupToDelete, setBackupToDelete] = useState(null);
    const [exportLoading, setExportLoading] = useState({
        inventory: false,
        bills: false,
        reports: false
    });
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (activeShop) {
            fetchBackupHistory();
        }
    }, [activeShop]);

    const fetchBackupHistory = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/backup/history?shopId=${activeShop.id}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setBackupHistory(data.backups);
            }
        } catch (error) {
            console.error('Failed to fetch backup history:', error);
        }
    };

    const handleManualBackup = async () => {
        if (!activeShop) {
            toast.error('Please select a shop first');
            return;
        }

        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/backup/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    shopId: activeShop.id,
                    type: 'FULL_DATABASE'
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Backup created successfully!');
                fetchBackupHistory();
            } else {
                toast.error(data.message || 'Failed to create backup');
            }
        } catch (error) {
            toast.error('Failed to create backup');
            console.error('Backup error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportInventory = async () => {
        if (!activeShop) {
            toast.error('Please select a shop first');
            return;
        }

        setExportLoading({ ...exportLoading, inventory: true });
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/backup/export/inventory?shopId=${activeShop.id}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Inventory exported successfully!');


                const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                window.open(`${API_ROOT}${data.file.downloadUrl}`, '_blank');
                fetchBackupHistory();
            } else {
                toast.error(data.message || 'Failed to export inventory');
            }
        } catch (error) {
            toast.error('Failed to export inventory');
            console.error('Export error:', error);
        } finally {
            setExportLoading({ ...exportLoading, inventory: false });
        }
    };

    const handleExportBills = async () => {
        if (!activeShop) {
            toast.error('Please select a shop first');
            return;
        }

        setExportLoading({ ...exportLoading, bills: true });
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const url = new URL(`${API_BASE_URL}/backup/export/bills`);
            url.searchParams.append('shopId', activeShop.id);
            if (dateRange.startDate) url.searchParams.append('startDate', dateRange.startDate);
            if (dateRange.endDate) url.searchParams.append('endDate', dateRange.endDate);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Bills exported successfully!');

                const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                window.open(`${API_ROOT}${data.file.downloadUrl}`, '_blank');
                fetchBackupHistory();
            } else {
                toast.error(data.message || 'Failed to export bills');
            }
        } catch (error) {
            toast.error('Failed to export bills');
            console.error('Export error:', error);
        } finally {
            setExportLoading({ ...exportLoading, bills: false });
        }
    };

    const handleExportReports = async () => {
        if (!activeShop) {
            toast.error('Please select a shop first');
            return;
        }

        setExportLoading({ ...exportLoading, reports: true });
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const url = new URL(`${API_BASE_URL}/backup/export/reports`);
            url.searchParams.append('shopId', activeShop.id);
            if (dateRange.startDate) url.searchParams.append('startDate', dateRange.startDate);
            if (dateRange.endDate) url.searchParams.append('endDate', dateRange.endDate);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Reports exported successfully!');

                const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
                window.open(`${API_ROOT}${data.file.downloadUrl}`, '_blank');
                fetchBackupHistory();
            } else {
                toast.error(data.message || 'Failed to export reports');
            }
        } catch (error) {
            toast.error('Failed to export reports');
            console.error('Export error:', error);
        } finally {
            setExportLoading({ ...exportLoading, reports: false });
        }
    };

    const handleDeleteBackup = (backup) => {
        setBackupToDelete(backup);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (backupToDelete) {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/backup/${backupToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    toast.success('Backup deleted successfully');
                    fetchBackupHistory();
                } else {
                    toast.error(data.message || 'Failed to delete backup');
                }
                setDeleteDialogOpen(false);
                setBackupToDelete(null);
            } catch (error) {
                toast.error('Failed to delete backup');
                console.error('Delete error:', error);
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'FAILED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'IN_PROGRESS':
                return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'INVENTORY':
                return <HardDrive className="w-5 h-5 text-blue-500" />;
            case 'BILLS':
                return <FileText className="w-5 h-5 text-green-500" />;
            case 'REPORTS':
                return <FileSpreadsheet className="w-5 h-5 text-purple-500" />;
            default:
                return <Database className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                { }
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Backup & Export</h1>
                    <p className="text-gray-600">Manage your data backups and export reports</p>
                </div>

                { }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    { }
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Backup</h3>
                        <p className="text-sm text-gray-600 mb-4">Create complete database backup</p>
                        <button
                            onClick={handleManualBackup}
                            disabled={loading || !activeShop}
                            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Create Backup
                                </>
                            )}
                        </button>
                    </div>

                    { }
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                <HardDrive className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Inventory</h3>
                        <p className="text-sm text-gray-600 mb-4">Download inventory as Excel</p>
                        <button
                            onClick={handleExportInventory}
                            disabled={exportLoading.inventory || !activeShop}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {exportLoading.inventory ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Export Excel
                                </>
                            )}
                        </button>
                    </div>

                    { }
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Bills</h3>
                        <p className="text-sm text-gray-600 mb-4">Download bills as Excel</p>
                        <button
                            onClick={handleExportBills}
                            disabled={exportLoading.bills || !activeShop}
                            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {exportLoading.bills ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Export Excel
                                </>
                            )}
                        </button>
                    </div>

                    { }
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                <FileSpreadsheet className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Reports</h3>
                        <p className="text-sm text-gray-600 mb-4">Download reports as Excel</p>
                        <button
                            onClick={handleExportReports}
                            disabled={exportLoading.reports || !activeShop}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {exportLoading.reports ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Export Excel
                                </>
                            )}
                        </button>
                    </div>
                </div>

                { }
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Date Range Filter</h3>
                        <span className="text-sm text-gray-500">(for Bills & Reports export)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                { }
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
                            </div>
                            <button
                                onClick={fetchBackupHistory}
                                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {backupHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No backups found. Create your first backup!
                                        </td>
                                    </tr>
                                ) : (
                                    backupHistory.map((backup) => (
                                        <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(backup.type)}
                                                    <span className="text-sm font-medium text-gray-900">{backup.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900 font-mono">{backup.fileName}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">{formatFileSize(backup.fileSize)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(backup.status)}
                                                    <span className={`text-sm font-medium ${backup.status === 'COMPLETED' ? 'text-green-600' :
                                                        backup.status === 'FAILED' ? 'text-red-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                        {backup.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(backup.createdAt).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${backup.isAutomatic
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {backup.isAutomatic ? 'Auto' : 'Manual'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {backup.status === 'COMPLETED' && (
                                                        <a
                                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/api/backup/download/${backup.fileName}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteBackup(backup)}
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
                <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">📌 Backup Information</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Automatic Backups:</strong> System creates automatic backups every Sunday at 2:00 AM</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Email Notifications:</strong> You'll receive email alerts for backup completion</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Retention:</strong> Last 10 backups are kept, older ones are automatically deleted</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Excel Exports:</strong> Inventory, Bills, and Reports can be exported to Excel format</span>
                        </li>
                    </ul>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Backup
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this backup?
                            <br />
                            <strong>File:</strong> {backupToDelete?.fileName}
                            <br />
                            <strong>Type:</strong> {backupToDelete?.type}
                            <br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Backup
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BackupExport;
