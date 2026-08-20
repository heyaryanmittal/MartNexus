import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, User, ShieldCheck, FileText, Shield, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser, setSession } from "@/store/slices/authSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ─────────────────────────────────────────
   Shared Input Field
───────────────────────────────────────── */
function AuthInput({ icon: Icon, type = "text", placeholder, value, onChange, required, disabled, autoComplete, rightEl }) {
  return (
    <div className="auth-input-wrap">
      <Icon size={16} className="auth-input-icon" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="auth-input"
      />
      {rightEl}
    </div>
  );
}

/* ─────────────────────────────────────────
   Password Input (with show/hide)
───────────────────────────────────────── */
function PasswordInput({ placeholder, value, onChange, required, disabled, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <AuthInput
      icon={Lock}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      rightEl={
        <button type="button" className="auth-pw-toggle" onClick={() => setShow((s) => !s)} tabIndex={-1}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
}

/* ─────────────────────────────────────────
   Login Form
───────────────────────────────────────── */
function LoginForm({ onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [fpMode, setFpMode] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpStep, setFpStep] = useState(1); // 1=enter email, 2=enter otp+new pw

  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      sessionStorage.setItem("token", data.token);
      const user = { id: data.userId, email, name: data.name };
      dispatch(setUser(user));
      dispatch(setSession({ user, access_token: data.token }));
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Login Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: fpEmail });
      setFpStep(2);
      toast({ title: "OTP Sent", description: "Check your email for the reset code." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: fpEmail, otp: fpOtp, newPassword: fpNewPw });
      toast({ title: "Password Reset", description: "You can now log in with your new password." });
      setFpMode(false); setFpStep(1); setFpEmail(""); setFpOtp(""); setFpNewPw("");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot Password UI ── */
  if (fpMode) {
    return (
      <div className="auth-form-inner">
        <button type="button" className="auth-back-btn" onClick={() => { setFpMode(false); setFpStep(1); }}>
          <ArrowLeft size={14} /> Back to login
        </button>
        <h2 className="auth-form-title">Reset your password</h2>
        <p className="auth-form-sub">
          {fpStep === 1 ? "Enter your registered email and we'll send a reset code." : "Enter the OTP from your email and set a new password."}
        </p>

        {fpStep === 1 ? (
          <form onSubmit={handleSendOtp} className="auth-form-fields">
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <AuthInput icon={Mail} type="email" placeholder="you@example.com" value={fpEmail}
                onChange={e => setFpEmail(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : "Send OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPw} className="auth-form-fields">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <AuthInput icon={Mail} type="email" value={fpEmail} disabled />
            </div>
            <div className="auth-field">
              <label className="auth-label">OTP Code</label>
              <AuthInput icon={ShieldCheck} placeholder="6-digit code" value={fpOtp}
                onChange={e => setFpOtp(e.target.value)} required disabled={loading} />
            </div>
            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <PasswordInput placeholder="New password" value={fpNewPw}
                onChange={e => setFpNewPw(e.target.value)} required disabled={loading} autoComplete="new-password" />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : "Reset Password →"}
            </button>
          </form>
        )}
      </div>
    );
  }

  /* ── Normal Login UI ── */
  return (
    <div className="auth-form-inner">
      <h2 className="auth-form-title">Welcome back</h2>
      <p className="auth-form-sub">Sign in to your MartNexus account</p>

      <form onSubmit={handleLogin} className="auth-form-fields">
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">Email address</label>
          <AuthInput icon={Mail} type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} autoComplete="email" />
        </div>
        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="login-password" className="auth-label">Password</label>
            <button type="button" className="auth-forgot-link" onClick={() => setFpMode(true)}>
              Forgot password?
            </button>
          </div>
          <PasswordInput placeholder="Your password" value={password}
            onChange={e => setPassword(e.target.value)} required disabled={loading} autoComplete="current-password" />
        </div>
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : "Sign In →"}
        </button>
      </form>

      <p className="auth-switch-text">
        Don't have an account?{" "}
        <button type="button" className="auth-switch-link" onClick={onSwitchToSignup}>
          Create one free
        </button>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Signup Form
───────────────────────────────────────── */
function SignupForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "terms" | "privacy" | null
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      setShowOtp(true);
      toast({ title: "OTP Sent", description: "Check your email for the verification code." });
    } catch (err) {
      toast({ title: "Registration Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      
      // Auto-login logic after verification
      sessionStorage.setItem("token", data.token);
      const user = { id: data.userId, email, name: data.name, role: data.role };
      dispatch(setUser(user));
      dispatch(setSession({ user, access_token: data.token }));
      
      toast({ title: "Verified!", description: "Welcome to MartNexus!" });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Verification Failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div className="auth-form-inner">
        <button type="button" className="auth-back-btn" onClick={() => setShowOtp(false)}>
          <ArrowLeft size={14} /> Go back
        </button>
        <div className="auth-otp-icon">📬</div>
        <h2 className="auth-form-title">Check your inbox</h2>
        <p className="auth-form-sub">We sent a 6-digit code to <strong>{email}</strong></p>

        <form onSubmit={handleVerify} className="auth-form-fields">
          <div className="auth-field">
            <label className="auth-label">Verification Code</label>
            <AuthInput icon={ShieldCheck} placeholder="6-digit OTP" value={otp}
              onChange={e => setOtp(e.target.value)} maxLength={6} required disabled={loading} />
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : "Verify & Activate →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-form-inner">
      <h2 className="auth-form-title">Create your account</h2>
      <p className="auth-form-sub">Start managing your inventory for free today</p>

      <form onSubmit={handleSignup} className="auth-form-fields">
        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">Email address</label>
          <AuthInput icon={Mail} type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} autoComplete="email" />
        </div>
        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">Password</label>
          <PasswordInput placeholder="Create a strong password" value={password}
            onChange={e => setPassword(e.target.value)} required disabled={loading} autoComplete="new-password" />
        </div>

        <p className="auth-terms">
          By signing up you agree to our{" "}
          <button type="button" onClick={() => setActiveModal("terms")} className="auth-terms-link">
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" onClick={() => setActiveModal("privacy")} className="auth-terms-link">
            Privacy Policy
          </button>.
        </p>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : "Create Account →"}
        </button>
      </form>

      <p className="auth-switch-text">
        Already have an account?{" "}
        <button type="button" className="auth-switch-link" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>

      {/* ── Terms of Service & Privacy Policy Popups ── */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {activeModal === "terms" && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">Terms of Service</DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                      Last updated: August 20, 2026 • Please read carefully before using MartNexus
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed max-h-[60vh]">
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-xs">01.</span> Acceptance of Terms
                  </h4>
                  <p>
                    By creating an account or accessing MartNexus, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-xs">02.</span> Account Registration & Security
                  </h4>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and passwords. You agree to accept responsibility for all activities that occur under your account. Promptly notify us of any unauthorized use.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-xs">03.</span> Store & Inventory Data Ownership
                  </h4>
                  <p>
                    You retain full ownership of all data, inventory logs, product lists, pricing, and customer records uploaded to MartNexus. MartNexus will never sell or claim ownership of your business data.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-xs">04.</span> Acceptable Use Policy
                  </h4>
                  <p>
                    You agree not to misuse the platform, perform reverse engineering, upload malicious scripts, or attempt unauthorized access to system infrastructure or other users&apos; accounts.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-xs">05.</span> Service Availability & SLA
                  </h4>
                  <p>
                    While MartNexus strives for 99.9% service uptime, the service is provided &quot;as is&quot;. We reserve the right to modify or discontinue features with reasonable notice.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-xs">06.</span> Limitation of Liability
                  </h4>
                  <p>
                    MartNexus and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the service.
                  </p>
                </section>
              </div>

              <DialogFooter className="p-4 border-t border-slate-800 bg-slate-900/80 sm:justify-between items-center gap-2">
                <p className="text-xs text-slate-400">Questions? Contact support@martnexus.com</p>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> I Understand & Accept
                </button>
              </DialogFooter>
            </>
          )}

          {activeModal === "privacy" && (
            <>
              <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">Privacy Policy</DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-1">
                      Last updated: August 20, 2026 • How MartNexus handles and protects your data
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed max-h-[60vh]">
                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">01.</span> Information We Collect
                  </h4>
                  <p>
                    We collect essential information to provide our services, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
                    <li>Account details: Email address, user name, and encrypted password hashes.</li>
                    <li>Business data: Product inventory, store names, transactions, and sales invoices.</li>
                    <li>Technical telemetry: Device metadata, browser type, and authentication logs.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">02.</span> How Information Is Used
                  </h4>
                  <p>
                    Your information is strictly used to authenticate logins, maintain inventory tracking, process POS orders, issue PDF receipts, and send security alerts (such as OTP verification).
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">03.</span> Data Security & Encryption
                  </h4>
                  <p>
                    MartNexus employs industry-standard encryption protocols (TLS 1.3 in transit and AES-256 at rest) to safeguard your store and user data against unauthorized access or data breaches.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">04.</span> Data Sharing Policy
                  </h4>
                  <p>
                    We do not sell, trade, or rent personal or business data to third parties. Data is shared only with trusted infrastructure providers (e.g. database hosting, email delivery) bound by strict confidentiality terms.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">05.</span> Your Rights & Data Export
                  </h4>
                  <p>
                    You maintain the right to view, update, export, or permanently delete your account and store data. Backup exports can be generated at any time via the Backup &amp; Export dashboard.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono text-xs">06.</span> Cookies & Local Storage
                  </h4>
                  <p>
                    We utilize session tokens in browser local storage exclusively for keeping you authenticated and preserving your UI preferences.
                  </p>
                </section>
              </div>

              <DialogFooter className="p-4 border-t border-slate-800 bg-slate-900/80 sm:justify-between items-center gap-2">
                <p className="text-xs text-slate-400">Privacy concerns? Contact privacy@martnexus.com</p>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Close Privacy Policy
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Auth Page
───────────────────────────────────────── */
export default function Auth() {
  const [view, setView] = useState("login"); // "login" | "signup"
  const navigate = useNavigate();

  const perks = [
    { icon: "📦", text: "Real-time inventory tracking" },
    { icon: "🏪", text: "Multi-branch POS system" },
    { icon: "📊", text: "Advanced sales analytics" },
    { icon: "🔐", text: "Role-based access control" },
    { icon: "🧾", text: "Instant PDF invoicing" },
    { icon: "🔔", text: "Smart stock alerts" },
  ];

  return (
    <>
      <style>{`
        /* Reset */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        /* ── Page Shell ── */
        .auth-page {
          min-height: 100vh; display: flex;
          background: #030712;
          font-family: 'Inter', sans-serif;
        }

        /* ── Left Panel ── */
        .auth-left {
          flex: 0 0 42%; background: linear-gradient(145deg, #0f172a 0%, #0a0f1f 100%);
          border-right: 1px solid rgba(99,102,241,0.15);
          display: flex; flex-direction: column;
          padding: 3rem;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 80%, rgba(34,211,238,0.07) 0%, transparent 60%);
          pointer-events: none;
        }
        .auth-left-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem; font-weight: 800;
          cursor: pointer; position: relative; z-index: 1;
          display: flex; align-items: center; gap: 0.85rem;
        }
        .auth-left-logo span {
          background: linear-gradient(135deg, #6366f1, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .auth-logo-img {
          width: 38px; height: 38px; object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.3));
        }
        .auth-left-hero {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; position: relative; z-index: 1;
        }
        .auth-left-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc; padding: 0.3rem 0.85rem; border-radius: 100px;
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 1.5rem; width: fit-content;
        }
        .auth-left-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.7rem, 3vw, 2.4rem); font-weight: 800;
          color: #f1f5f9; line-height: 1.15; margin-bottom: 1rem;
        }
        .auth-left-title span {
          background: linear-gradient(135deg, #6366f1, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .auth-left-sub { color: #64748b; font-size: 0.925rem; line-height: 1.7; margin-bottom: 2.5rem; }
        .auth-perks { display: flex; flex-direction: column; gap: 0.7rem; }
        .auth-perk {
          display: flex; align-items: center; gap: 0.75rem;
          color: #94a3b8; font-size: 0.875rem;
        }
        .auth-perk-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        .auth-left-footer { position: relative; z-index: 1; }
        .auth-left-footer-text { font-size: 0.75rem; color: #334155; }

        /* ── Right Panel ── */
        .auth-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2rem; position: relative;
        }
        .auth-right::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 60% 30%, rgba(99,102,241,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Form Box ── */
        .auth-form-box {
          width: 100%; max-width: 420px; position: relative; z-index: 1;
        }
        .auth-form-inner { display: flex; flex-direction: column; gap: 0; }
        .auth-form-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.75rem; font-weight: 800; color: #f1f5f9;
          margin-bottom: 0.4rem;
        }
        .auth-form-sub { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }

        /* ── Fields ── */
        .auth-form-fields { display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 1.5rem; }
        .auth-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .auth-label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; letter-spacing: 0.02em; }
        .auth-label-row { display: flex; align-items: center; justify-content: space-between; }
        .auth-input-wrap {
          position: relative; display: flex; align-items: center;
          background: rgba(15,23,42,0.8); border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input-wrap:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .auth-input-icon {
          position: absolute; left: 14px; color: #475569; pointer-events: none;
        }
        .auth-input {
          width: 100%; background: transparent; border: none; outline: none;
          padding: 0.8rem 2.75rem 0.8rem 2.75rem;
          color: #f1f5f9; font-size: 0.9rem; font-family: inherit;
        }
        .auth-input::placeholder { color: #334155; }
        .auth-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-pw-toggle {
          position: absolute; right: 12px; background: none; border: none;
          color: #475569; cursor: pointer; padding: 0; display: flex;
          transition: color 0.2s;
        }
        .auth-pw-toggle:hover { color: #94a3b8; }
        .auth-forgot-link {
          background: none; border: none; color: #6366f1; font-size: 0.78rem;
          cursor: pointer; padding: 0; font-family: inherit; font-weight: 500;
          transition: color 0.2s;
        }
        .auth-forgot-link:hover { color: #818cf8; }

        /* ── Submit Button ── */
        .auth-submit-btn {
          width: 100%; padding: 0.85rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 10px; color: #fff;
          font-size: 0.95rem; font-weight: 700; font-family: inherit;
          cursor: pointer; transition: all 0.25s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: 0 6px 20px rgba(99,102,241,0.3);
        }
        .auth-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(99,102,241,0.45); }
        .auth-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        /* ── Back Button ── */
        .auth-back-btn {
          background: none; border: none; color: #64748b; font-size: 0.82rem;
          cursor: pointer; padding: 0; font-family: inherit; font-weight: 500;
          display: inline-flex; align-items: center; gap: 0.35rem;
          margin-bottom: 1.75rem; transition: color 0.2s;
        }
        .auth-back-btn:hover { color: #a5b4fc; }

        /* ── OTP Icon ── */
        .auth-otp-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        /* ── Switch Link ── */
        .auth-switch-text { text-align: center; font-size: 0.85rem; color: #475569; }
        .auth-switch-link {
          background: none; border: none; color: #6366f1; font-weight: 600;
          cursor: pointer; font-family: inherit; font-size: inherit;
          padding: 0; transition: color 0.2s;
        }
        .auth-switch-link:hover { color: #818cf8; }

        /* ── Terms ── */
        .auth-terms { font-size: 0.78rem; color: #475569; line-height: 1.6; }
        .auth-terms-link {
          color: #6366f1; text-decoration: none; background: none; border: none;
          font-family: inherit; font-size: inherit; cursor: pointer; padding: 0; display: inline;
        }
        .auth-terms-link:hover { text-decoration: underline; color: #818cf8; }

        /* ── Divider (tab switcher) ── */
        .auth-tabs {
          display: flex; gap: 0; margin-bottom: 2rem;
          background: rgba(15,23,42,0.8); border: 1px solid rgba(99,102,241,0.15);
          border-radius: 10px; padding: 4px;
        }
        .auth-tab {
          flex: 1; padding: 0.6rem; border: none; border-radius: 7px;
          background: transparent; color: #64748b; font-size: 0.875rem;
          font-weight: 600; cursor: pointer; font-family: inherit;
          transition: all 0.2s;
        }
        .auth-tab.active {
          background: rgba(99,102,241,0.2); color: #a5b4fc;
          box-shadow: inset 0 1px 1px rgba(99,102,241,0.1);
        }

        /* ── Spin ── */
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { padding: 2rem 1.25rem; }
          .auth-form-box { max-width: 100%; }
        }
        @media (max-width: 360px) {
          .auth-right { padding: 1.5rem 1rem; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── Left Panel ── */}
        <div className="auth-left">
          <div className="auth-left-logo" onClick={() => navigate("/")}>
            <img src="/martnexus.png" alt="MartNexus Logo" className="auth-logo-img" />
            <span>MartNexus</span>
          </div>

          <div className="auth-left-hero">
            <h1 className="auth-left-title">
              Manage smarter.<br />
              <span>Grow faster.</span>
            </h1>
            <p className="auth-left-sub">
              MartNexus gives your business real-time visibility into every
              product, sale, and supplier — all from one elegant platform.
            </p>

            <div className="auth-perks">
              {perks.map((p) => (
                <div className="auth-perk" key={p.text}>
                  <div className="auth-perk-icon">{p.icon}</div>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-left-footer">
            <p className="auth-left-footer-text">© 2025 MartNexus · Built for modern retail</p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="auth-right">
          <div className="auth-form-box">
            {/* Mobile logo */}
            <div
              className="auth-left-logo"
              style={{ display: "none", marginBottom: "1.75rem", fontSize: "1.3rem" }}
              id="auth-mobile-logo"
              onClick={() => navigate("/")}
            >
              <img src="/martnexus.png" alt="MartNexus Logo" className="auth-logo-img" style={{ width: "32px", height: "32px" }} />
              <span>MartNexus</span>
            </div>

            {/* Tab Switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${view === "login" ? "active" : ""}`}
                onClick={() => setView("login")}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${view === "signup" ? "active" : ""}`}
                onClick={() => setView("signup")}
              >
                Sign Up
              </button>
            </div>

            {view === "login" ? (
              <LoginForm onSwitchToSignup={() => setView("signup")} />
            ) : (
              <SignupForm onSwitchToLogin={() => setView("login")} />
            )}
          </div>
        </div>
      </div>

      {/* Show mobile logo via CSS trick */}
      <style>{`
        @media (max-width: 768px) {
          #auth-mobile-logo { display: block !important; }
        }
      `}</style>
    </>
  );
}
