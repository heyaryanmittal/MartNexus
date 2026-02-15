import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { useEffect } from "react";
import { setUser, setSession, setLoading } from "./store/slices/authSlice";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
import Profile from "./pages/Profile";
import MyShops from "./pages/MyShops";
import BackupExport from "./pages/BackupExport";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/Layout/AppLayout";
import api from "@/lib/api";

const queryClient = new QueryClient();

function AuthHandler({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {

          const response = await api.get('/auth/me');

          dispatch(setSession({ user: response.data, access_token: token }));
        } catch (e) {
          console.error("Auth check failed:", e);
          sessionStorage.removeItem('token');
          dispatch(setUser(null));
        }
      } else {
        dispatch(setUser(null));
      }
      dispatch(setLoading(false));
    };
    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthHandler>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute>
                <AppLayout>
                  <Inventory />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute>
                <AppLayout>
                  <Categories />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/pos" element={<ProtectedRoute>
                <AppLayout>
                  <POS />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute>
                <AppLayout>
                  <Sales />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute>
                <AppLayout>
                  <Invoices />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute>
                <AppLayout>
                  <Suppliers />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute>
                <AppLayout>
                  <Customers />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute>
                <AppLayout>
                  <UserManagement />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute>
                <AppLayout>
                  <AuditLogs />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/shops" element={<ProtectedRoute>
                <AppLayout>
                  <MyShops />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/backup-export" element={<ProtectedRoute>
                <AppLayout>
                  <BackupExport />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute>
                <AppLayout>
                  <Notifications />
                </AppLayout>
              </ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthHandler>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
