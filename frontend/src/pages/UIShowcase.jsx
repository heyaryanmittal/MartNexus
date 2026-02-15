import React, { useState } from 'react';
import {
    Package, ShoppingCart, TrendingUp, AlertTriangle,
    CheckCircle, Info, Plus, RefreshCw
} from 'lucide-react';
import {
    LoadingSpinner,
    LoadingSkeleton,
    CardSkeleton,
    TableSkeleton,
    EmptyState,
    ErrorMessage,
    SuccessMessage,
    WarningMessage,
    InfoMessage,
    LargeActionButton,
    ProgressBar,
    Badge,
    StatCard
} from '@/components/ui/enhanced-ui';
import {
    Container,
    ResponsiveGrid,
    Stack,
    ResponsiveCard,
    Section,
    ResponsiveModal,
    ResponsiveTabs
} from '@/components/ui/responsive-layout';
import {
    ThemeToggle,
    ThemedCard,
    ThemedText
} from '@/components/ui/theme-provider';
import {
    MobileBottomNav,
    MobileFAB,
    MobileCardItem
} from '@/components/ui/mobile-navigation';
import { toast } from 'sonner';


export default function UIShowcase() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('components');
    const [modalOpen, setModalOpen] = useState(false);

    const handleLoadingDemo = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Loading complete!');
        }, 2000);
    };

    const tabs = [
        { value: 'components', label: 'Components' },
        { value: 'layouts', label: 'Layouts' },
        { value: 'messages', label: 'Messages' },
        { value: 'mobile', label: 'Mobile' }
    ];

    const navItems = [
        { icon: Package, label: 'Products', to: '/products' },
        { icon: ShoppingCart, label: 'POS', to: '/pos' },
        { icon: TrendingUp, label: 'Reports', to: '/reports' },
        { icon: AlertTriangle, label: 'Alerts', to: '/alerts' },
        { icon: Info, label: 'Info', to: '/info' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Container>
                {}
                <Section
                    title="UI/UX Showcase"
                    description="Explore all available UI components and patterns"
                    action={<ThemeToggle />}
                >
                    {}
                    <ResponsiveTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                    {}
                    {activeTab === 'components' && (
                        <Stack spacing={8} className="mt-8">
                            {}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Loading Indicators
                                </h3>
                                <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap={6}>
                                    <ResponsiveCard>
                                        <h4 className="font-semibold mb-4">Loading Spinner</h4>
                                        <LoadingSpinner size="lg" text="Loading data..." />
                                    </ResponsiveCard>

                                    <ResponsiveCard>
                                        <h4 className="font-semibold mb-4">Skeleton Loader</h4>
                                        <LoadingSkeleton count={3} height="h-4" />
                                    </ResponsiveCard>

                                    <ResponsiveCard>
                                        <h4 className="font-semibold mb-4">Card Skeleton</h4>
                                        <CardSkeleton />
                                    </ResponsiveCard>
                                </ResponsiveGrid>
                            </div>

                            {}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Stat Cards
                                </h3>
                                <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 4 }} gap={6}>
                                    <StatCard
                                        icon={ShoppingCart}
                                        label="Today's Sales"
                                        value="45"
                                        change={12.5}
                                        trend="up"
                                    />
                                    <StatCard
                                        icon={Package}
                                        label="Products"
                                        value="1,234"
                                        change={-5.2}
                                        trend="down"
                                    />
                                    <StatCard
                                        icon={TrendingUp}
                                        label="Revenue"
                                        value="₹45,000"
                                        change={8.3}
                                        trend="up"
                                    />
                                    <StatCard
                                        icon={AlertTriangle}
                                        label="Low Stock"
                                        value="12"
                                        trend="neutral"
                                    />
                                </ResponsiveGrid>
                            </div>

                            {}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Badges
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    <Badge variant="default">Default</Badge>
                                    <Badge variant="primary">Primary</Badge>
                                    <Badge variant="success">Success</Badge>
                                    <Badge variant="danger">Danger</Badge>
                                    <Badge variant="warning">Warning</Badge>
                                    <Badge variant="info">Info</Badge>
                                    <Badge variant="primary" size="sm">Small</Badge>
                                    <Badge variant="success" size="lg">Large</Badge>
                                </div>
                            </div>

                            {}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Progress Bars
                                </h3>
                                <Stack spacing={4}>
                                    <ProgressBar value={25} max={100} label="25% Complete" />
                                    <ProgressBar value={50} max={100} label="50% Complete" />
                                    <ProgressBar value={75} max={100} label="75% Complete" />
                                    <ProgressBar value={100} max={100} label="100% Complete" />
                                </Stack>
                            </div>

                            {}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Large Action Buttons
                                </h3>
                                <ResponsiveGrid cols={{ xs: 1, sm: 2 }} gap={4}>
                                    <LargeActionButton
                                        icon={ShoppingCart}
                                        label="New Sale"
                                        variant="primary"
                                        onClick={() => toast.success('New Sale clicked!')}
                                    />
                                    <LargeActionButton
                                        icon={Package}
                                        label="Add Product"
                                        variant="success"
                                        onClick={() => toast.success('Add Product clicked!')}
                                    />
                                    <LargeActionButton
                                        icon={RefreshCw}
                                        label="Refresh Data"
                                        variant="secondary"
                                        onClick={handleLoadingDemo}
                                        loading={loading}
                                    />
                                    <LargeActionButton
                                        icon={AlertTriangle}
                                        label="Delete Item"
                                        variant="danger"
                                        onClick={() => toast.error('Delete clicked!')}
                                    />
                                </ResponsiveGrid>
                            </div>
                        </Stack>
                    )}

                    {}
                    {activeTab === 'layouts' && (
                        <Stack spacing={8} className="mt-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Responsive Grids
                                </h3>
                                <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <ResponsiveCard key={i} hover>
                                            <div className="h-32 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-400">
                                                    {i}
                                                </span>
                                            </div>
                                        </ResponsiveCard>
                                    ))}
                                </ResponsiveGrid>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Themed Cards
                                </h3>
                                <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap={6}>
                                    <ThemedCard className="p-6">
                                        <ThemedText variant="h4">Card Title</ThemedText>
                                        <ThemedText variant="body" className="mt-2">
                                            This card adapts to the current theme automatically.
                                        </ThemedText>
                                    </ThemedCard>
                                    <ThemedCard className="p-6">
                                        <ThemedText variant="h4">Another Card</ThemedText>
                                        <ThemedText variant="body" className="mt-2">
                                            Try toggling the theme to see the effect!
                                        </ThemedText>
                                    </ThemedCard>
                                    <ThemedCard className="p-6">
                                        <ThemedText variant="h4">Third Card</ThemedText>
                                        <ThemedText variant="body" className="mt-2">
                                            All text and backgrounds update automatically.
                                        </ThemedText>
                                    </ThemedCard>
                                </ResponsiveGrid>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Modal Example
                                </h3>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Open Modal
                                </button>

                                <ResponsiveModal
                                    isOpen={modalOpen}
                                    onClose={() => setModalOpen(false)}
                                    title="Example Modal"
                                    size="default"
                                    footer={
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setModalOpen(false)}
                                                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setModalOpen(false);
                                                    toast.success('Confirmed!');
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    }
                                >
                                    <p className="text-gray-700 dark:text-gray-300">
                                        This is a responsive modal that adapts to different screen sizes.
                                        It includes a header, content area, and footer with actions.
                                    </p>
                                </ResponsiveModal>
                            </div>
                        </Stack>
                    )}

                    {}
                    {activeTab === 'messages' && (
                        <Stack spacing={6} className="mt-8">
                            <SuccessMessage
                                title="Success!"
                                message="Your operation completed successfully."
                            />

                            <ErrorMessage
                                title="Error Occurred"
                                message="Something went wrong. Please try again."
                                onRetry={() => toast.info('Retrying...')}
                            />

                            <WarningMessage
                                title="Warning"
                                message="This action may have unintended consequences."
                            />

                            <InfoMessage
                                title="Information"
                                message="Here's some helpful information for you."
                            />

                            <EmptyState
                                icon={Package}
                                title="No Products Found"
                                description="You haven't added any products yet. Start by adding your first product."
                                action={() => toast.success('Add Product clicked!')}
                                actionLabel="Add Product"
                            />
                        </Stack>
                    )}

                    {}
                    {activeTab === 'mobile' && (
                        <Stack spacing={8} className="mt-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Mobile Card Items
                                </h3>
                                <Stack spacing={3}>
                                    <MobileCardItem
                                        icon={Package}
                                        title="Product Name"
                                        subtitle="SKU: PRD-001"
                                        value="₹500"
                                        badge="5"
                                        onClick={() => toast.info('Card clicked!')}
                                    />
                                    <MobileCardItem
                                        icon={ShoppingCart}
                                        title="Recent Sale"
                                        subtitle="2 hours ago"
                                        value="₹1,250"
                                        onClick={() => toast.info('Sale clicked!')}
                                    />
                                    <MobileCardItem
                                        icon={TrendingUp}
                                        title="Monthly Revenue"
                                        subtitle="This month"
                                        value="₹45,000"
                                        badge="New"
                                    />
                                </Stack>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Bottom Navigation (Mobile Only)
                                </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                        The bottom navigation is visible only on mobile devices (below 1024px).
                                        Resize your browser to see it in action.
                                    </p>
                                    <MobileBottomNav items={navItems} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Floating Action Button (Mobile Only)
                                </h3>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        The FAB appears in the bottom-right corner on mobile devices.
                                    </p>
                                </div>
                                <MobileFAB
                                    icon={Plus}
                                    label="Add Item"
                                    onClick={() => toast.success('FAB clicked!')}
                                    variant="primary"
                                />
                            </div>
                        </Stack>
                    )}
                </Section>
            </Container>
        </div>
    );
}
