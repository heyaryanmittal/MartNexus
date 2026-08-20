import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Shield, Check } from "lucide-react";

export function LegalModal({ activeModal, onClose }) {
  return (
    <Dialog open={activeModal !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl z-[100]">
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
                onClick={onClose}
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
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Close Privacy Policy
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
