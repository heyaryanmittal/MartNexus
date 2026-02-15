import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser, setSession } from "@/store/slices/authSlice";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();

  
  const isLoggedIn = !!sessionStorage.getItem('token');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      sessionStorage.setItem('token', data.token);
      
      const user = { id: data.userId, email: email, name: data.name };
      dispatch(setUser(user));
      dispatch(setSession({ user, access_token: data.token }));
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      setShowOtp(true);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast({
        title: "Verified!",
        description: "Your account is verified. You can now login.",
      });
      setShowOtp(false);
      setOtp("");
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setResetPasswordMode(true);
      toast({
        title: "OTP Sent",
        description: "Check email for password reset OTP.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast({
        title: "Success",
        description: "Password reset successfully. Please login.",
      });
      setResetPasswordMode(false);
      setForgotPasswordMode(false);
      setOtp("");
      setNewPassword("");
      setActiveTab("login");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-gray-950 p-4 relative overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-20 w-32 h-32 border-4 border-blue-400/40 rounded-lg animate-float" />
      <div className="absolute top-40 right-32 w-24 h-24 border-4 border-sky-400/40 rounded-lg animate-float animation-delay-1000" />
      <div className="absolute bottom-32 left-40 w-28 h-28 border-4 border-violet-400/40 rounded-lg animate-float animation-delay-2000" />
      <div className="absolute bottom-40 right-20 w-36 h-36 border-4 border-blue-300/40 rounded-lg animate-float animation-delay-3000" />
      <div className="absolute top-1/2 left-10 w-20 h-20 border-4 border-sky-300/40 rounded-lg animate-float animation-delay-1500" />
      <div className="absolute top-1/3 right-10 w-24 h-24 border-4 border-violet-300/40 rounded-lg animate-float animation-delay-2500" />
    </div>

    <Card className="w-full max-w-md relative z-10 shadow-2xl border-2">
      <CardHeader className="text-center space-y-3 pb-6">
        <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-600 to-violet-600 bg-clip-text text-transparent">
          MartNexus
        </CardTitle>
        <CardDescription className="text-base">Inventory Management System</CardDescription>
        {isLoggedIn && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
              You are currently logged in.
            </p>
            <Button variant="link" className="h-auto p-0 text-xs text-blue-600 dark:text-blue-500" onClick={() => { sessionStorage.removeItem('token'); window.location.reload(); }}>
              Click here to Sign Out
            </Button>
            <span className="mx-2 text-gray-300">|</span>
            <Button variant="link" className="h-auto p-0 text-xs text-blue-600 dark:text-blue-500" onClick={() => navigate("/dashboard")}>
              Continue to Dashboard
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
            <TabsTrigger value="login" className="text-base font-semibold">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-base font-semibold">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {forgotPasswordMode ? (
              resetPasswordMode ? (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} disabled className="bg-gray-100" />
                  </div>
                  <div className="space-y-2">
                    <Label>OTP</Label>
                    <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Reset Password</Button>
                  <Button variant="ghost" className="w-full" onClick={() => { setResetPasswordMode(false); setForgotPasswordMode(false); }}>Cancel</Button>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Email for Password Reset</Label>
                    <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Send OTP</Button>
                  <Button variant="ghost" className="w-full" onClick={() => setForgotPasswordMode(false)}>Back to Login</Button>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-semibold">Email</Label>
                  <Input id="login-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 text-base" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-semibold">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 text-base" required />
                  <div className="text-right">
                    <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => setForgotPasswordMode(true)}>Forgot Password?</span>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="signup">
            {showOtp ? (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center text-sm text-gray-600 mb-2">OTP sent to {email}</div>
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>Verify & Register</Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowOtp(false)}>Back</Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-semibold">Email</Label>
                  <Input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 text-base" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 text-base" required />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-lg hover:shadow-xl transition-all duration-300" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-3deg); } 100% { transform: translateY(0px) rotate(0deg); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2500 { animation-delay: 2.5s; }
        .animation-delay-3000 { animation-delay: 3s; }
      `}</style>
  </div>);
}
