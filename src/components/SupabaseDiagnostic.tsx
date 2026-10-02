import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Database, Shield, Radio, Key } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface DiagnosticResult {
  timestamp: string;
  isConfigured: boolean;
  urlConfigured: boolean;
  anonKeyConfigured: boolean;
  maskedUrl: string;
  connectionStatus: 'connected' | 'unconfigured' | 'error';
  authStatus: 'active' | 'unconfigured' | 'error';
  latencyMs: number;
  message: string;
  backendDbStatus: 'connected' | 'error';
  backendDbProductCount: number;
  details?: string;
}

interface SupabaseDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDiagnostic: React.FC<SupabaseDiagnosticProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const startTime = performance.now();
    const envConfigured = isSupabaseConfigured();

    // Check env vars via Vite or fallback
    const rawUrl =
      (import.meta as any).env?.VITE_SUPABASE_URL ||
      (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') ||
      '';
    const rawKey =
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      (typeof process !== 'undefined'
        ? process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY
        : '') ||
      '';

    let connectionStatus: 'connected' | 'unconfigured' | 'error' = 'unconfigured';
    let authStatus: 'active' | 'unconfigured' | 'error' = 'unconfigured';
    let message = 'Supabase environment variables not configured. Operating on embedded persistent database.';
    let details = '';

    if (envConfigured) {
      try {
        // 1. Attempt simple query against Supabase database
        const { error: dbError, count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (dbError) {
          connectionStatus = 'error';
          message = `Query failed: ${dbError.message}`;
          details = dbError.details || dbError.hint || '';
        } else {
          connectionStatus = 'connected';
          message = `Successfully queried Supabase database (${count ?? 0} products verified).`;
        }

        // 2. Verify authentication service
        const { error: authError } = await supabase.auth.getSession();
        if (authError) {
          authStatus = 'error';
        } else {
          authStatus = 'active';
        }
      } catch (err: unknown) {
        connectionStatus = 'error';
        authStatus = 'error';
        message = err instanceof Error ? err.message : 'Connection attempt failed.';
      }
    }

    // Also verify backend database connection & catalogue count
    let backendDbStatus: 'connected' | 'error' = 'error';
    let backendDbProductCount = 0;
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        backendDbStatus = 'connected';
        backendDbProductCount = Array.isArray(data.products)
          ? data.products.length
          : Array.isArray(data)
          ? data.length
          : 0;
      }
    } catch {
      backendDbStatus = 'error';
    }

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    const masked = rawUrl
      ? rawUrl.replace(/(https?:\/\/)([^.]+)(\..+)/, '$1$2$3')
      : 'Not configured';

    setResult({
      timestamp: new Date().toLocaleTimeString(),
      isConfigured: envConfigured,
      urlConfigured: Boolean(rawUrl && rawUrl.length > 5),
      anonKeyConfigured: Boolean(rawKey && rawKey.length > 20),
      maskedUrl: masked,
      connectionStatus,
      authStatus,
      latencyMs: latency,
      message,
      backendDbStatus,
      backendDbProductCount,
      details,
    });
    setTesting(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161514]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-xl bg-[#FAF8F5] border border-[#161514] p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#161514]/15 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-[#161514]" />
            <div>
              <h2 className="font-editorial text-[22px] text-[#161514] leading-tight">
                Database &amp; Supabase Diagnostics
              </h2>
              <p className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
                Connection &amp; Authentication Verifier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#5A4638] hover:text-[#161514] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {testing ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#161514]" />
            <p className="text-[12px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              Executing query against database...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-6 text-[#161514]">
            {/* Primary Status Card */}
            <div
              className={`p-4 border ${
                result.connectionStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : result.connectionStatus === 'unconfigured'
                  ? 'bg-[#EFECE5] border-[#161514]/20 text-[#3E3027]'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.connectionStatus === 'connected' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : result.connectionStatus === 'unconfigured' ? (
                  <Radio className="w-5 h-5 text-[#5A4638] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-editorial text-[18px] font-medium leading-snug">
                    {result.connectionStatus === 'connected'
                      ? 'Supabase Connection Active'
                      : result.connectionStatus === 'unconfigured'
                      ? 'Embedded Database Active (Zero-Config)'
                      : 'Supabase Query Notice'}
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-[11px] font-mono-num text-rose-800">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Parameter & Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono-num">
              <div className="p-3 bg-[#F7F5F0] border border-[#161514]/10">
                <span className="text-[#8D7F73] uppercase tracking-[0.14em] block text-[9px]">
                  ACTIVE STORAGE ENGINE
                </span>
                <span className="font-medium mt-1 block">
                  {result.isConfigured ? 'Supabase PostgreSQL' : 'Embedded Relational (SQLite)'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#161514]/10">
                <span className="text-[#8D7F73] uppercase tracking-[0.14em] block text-[9px]">
                  QUERY LATENCY
                </span>
                <span className="font-medium mt-1 block">
                  {result.latencyMs} ms
                </span>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#161514]/10">
                <span className="text-[#8D7F73] uppercase tracking-[0.14em] block text-[9px]">
                  SUPABASE_URL
                </span>
                <span className="font-medium mt-1 block truncate">
                  {result.urlConfigured ? 'Configured ✓' : 'Not set (Optional)'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#161514]/10">
                <span className="text-[#8D7F73] uppercase tracking-[0.14em] block text-[9px]">
                  SUPABASE_ANON_KEY
                </span>
                <span className="font-medium mt-1 block truncate">
                  {result.anonKeyConfigured ? 'Configured ✓' : 'Not set (Optional)'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#161514]/10">
                <span className="text-[#8D7F73] uppercase tracking-[0.14em] block text-[9px]">
                  BACKEND DATABASE API
                </span>
                <span className="font-medium mt-1 block text-emerald-800">
                  {result.backendDbStatus === 'connected' ? 'Operational (200 OK)' : 'Offline'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F5F0] border border-[#161514]/10">
                <span className="text-[#8D7F73] uppercase tracking-[0.14em] block text-[9px]">
                  CATALOGUE PRODUCTS COUNT
                </span>
                <span className="font-medium mt-1 block">
                  {result.backendDbProductCount} products verified
                </span>
              </div>
            </div>

            {/* Informational Guidance */}
            <div className="text-[12px] text-[#5A4638] leading-relaxed border-t border-[#161514]/10 pt-4 space-y-2">
              <p>
                <strong>Architecture Note:</strong> When external credentials (<code className="bg-[#EFECE5] px-1 py-0.5">VITE_SUPABASE_URL</code> &amp; <code className="bg-[#EFECE5] px-1 py-0.5">VITE_SUPABASE_ANON_KEY</code>) are placed in the environment, the store communicates directly with your remote cloud PostgreSQL tables.
              </p>
              <p>
                In their absence, the store automatically and persistently manages all 14 seasonal silhouettes, orders, live cart, customer profiles, and newsletter subscriptions via the full-stack database engine without failing.
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-[#161514]/15 flex items-center justify-between">
          <span className="text-[10px] font-mono-num text-[#8D7F73]">
            Checked at {result?.timestamp || 'just now'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runDiagnostics}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#161514] text-[11px] font-mono-num uppercase tracking-[0.16em] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>Test Again</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#161514] text-[#F7F5F0] text-[11px] font-mono-num uppercase tracking-[0.16em] hover:bg-[#3E3027] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
