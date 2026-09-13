'use client';
import { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Loader2, ArrowUpRight, Zap, MessageCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [founderPhone, setFounderPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUrl: url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Audit check failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppAlert = () => {
    if (!result) return;
    
    // Construct pre-filled high-conversion alert copy
    const text = `🚨 *[OsureSync Alert]* Stock Desync Detected!\n\n` +
      `• *Brand:* ${result.vendor}\n` +
      `• *Product:* ${result.title}\n` +
      `• *Status:* ${result.isAllSoldOut ? '100% SOLD OUT' : 'Hero Sizes Empty: ' + result.soldOutPrimary.join(', ')}\n` +
      `• *Impact:* Active Meta ad clicks are landing on sold-out variants (0% conversion rate).\n\n` +
      `👉 Pause the ad set here: https://adsmanager.facebook.com`;

    const cleanPhone = founderPhone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
      
    window.open(waUrl, '_blank');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-neutral-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> OsureSync Autonomous Sentinel
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ghost-Ad & Stock Monitor
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto">
            Audit live Meta ad landing destinations in 0.5s. Detect out-of-stock items and prevent ad budget burn with zero store logins.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAudit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="url"
              required
              placeholder="Paste Shopify product link (e.g., https://brand.in/products/shirt)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl focus:outline-none focus:border-neutral-600 font-mono text-sm placeholder:text-neutral-500 text-neutral-100 transition"
            />
            <input
              type="tel"
              placeholder="Founder / Media Buyer WhatsApp # with Country Code (Optional: 91XXXXXXXXXX)"
              value={founderPhone}
              onChange={(e) => setFounderPhone(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl focus:outline-none focus:border-neutral-600 font-mono text-xs placeholder:text-neutral-600 text-neutral-200 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Instant Inventory Diagnostic'}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Audit Diagnostic Output Card */}
        {result && (
          <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 backdrop-blur space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800/80 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-mono text-neutral-500">Destination Audited</p>
                <h3 className="text-lg font-bold text-neutral-100">{result.title}</h3>
                <p className="text-xs text-neutral-400 font-medium">Brand: {result.vendor}</p>
              </div>

              {result.healthStatus === 'GHOST_AD_CRITICAL' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4" /> 100% Dead Ad
                </span>
              )}
              {result.healthStatus === 'HERO_SIZES_EMPTY' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Core Sizes Sold Out
                </span>
              )}
              {result.healthStatus === 'HEALTHY' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Stock Synced
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Sold-Out Core Sizes:</span>
                <span className="font-mono text-neutral-200">
                  {result.soldOutPrimary?.length > 0 ? result.soldOutPrimary.join(', ') : 'None (In Stock)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Variants Monitored:</span>
                <span className="font-mono text-neutral-200">{result.totalVariants}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Burn Assessment:</span>
                <span className={`font-medium ${result.riskLevel === 'HIGH' ? 'text-red-400' : result.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.riskLevel === 'HIGH' ? 'Pause Ad Set (Zero Conversions)' : result.riskLevel === 'MEDIUM' ? 'High Drop-off Risk' : 'Safe to Scale Budget'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row gap-3">
              {(result.healthStatus === 'GHOST_AD_CRITICAL' || result.healthStatus === 'HERO_SIZES_EMPTY') && (
                <button
                  type="button"
                  onClick={openWhatsAppAlert}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Dispatch 1-Click WhatsApp Alert
                </button>
              )}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs flex items-center justify-center gap-1.5 transition"
              >
                Inspect Target <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  );
      }
  
