'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building,
  User,
  MapPin,
  IndianRupee,
  Search,
  Filter,
  Check,
  X,
  FileText,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Users,
  Shield,
  Loader2,
  RefreshCw,
  Sparkles,
  Home,
  Award,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  apiGetAdminDashboard,
  apiGetAdminVerifications,
  apiVerifyListing,
  apiRejectListing,
  AdminDashboardSummary,
  AdminVerificationListing,
} from '@/lib/api';
import { subscribeToAdminModeration, broadcastModerationUpdate } from '@/lib/firebase';

const REJECTION_PRESETS = [
  'Incomplete electricity bill / property ownership deed',
  'Host government identity / Aadhaar verification pending',
  'Insufficient bedroom lighting or photo resolution',
  'Room amenities do not match description (Study desk/WiFi missing)',
  'Security deposit exceeds maximum platform scholar guidelines',
];

export default function AdminPortalView() {
  const { user, tokens, loginAsDemoAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardSummary | null>(null);
  const [listings, setListings] = useState<AdminVerificationListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'all' | 'analytics'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');

  // Rejection modal state
  const [rejectItem, setRejectItem] = useState<AdminVerificationListing | null>(null);
  const [rejectionPreset, setRejectionPreset] = useState(REJECTION_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Document inspection modal state
  const [inspectedDoc, setInspectedDoc] = useState<{
    doc: { type: string; status: 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED' };
    listing: AdminVerificationListing;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleResetQueue = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studentnest_admin_verifications_queue');
      setRefreshing(true);
      loadData();
      showToast('Queue reset to standard demonstration properties.');
    }
  };

  const handleUpdateDocStatus = (listingId: string, docType: string, newStatus: 'VERIFIED' | 'FLAGGED') => {
    setListings((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== listingId) return item;
        const docs = (item.documents || []).map((d) =>
          d.type === docType ? { ...d, status: newStatus } : d,
        );
        return { ...item, documents: docs };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('studentnest_admin_verifications_queue', JSON.stringify(updated));
      }
      return updated;
    });
    if (inspectedDoc) {
      setInspectedDoc({
        ...inspectedDoc,
        doc: { ...inspectedDoc.doc, status: newStatus },
      });
    }
    showToast(`Document marked as ${newStatus}`);
  };

  const loadData = async () => {
    try {
      const token = tokens?.accessToken || 'demo-admin-token';
      const [dash, verifs] = await Promise.all([
        apiGetAdminDashboard(token),
        apiGetAdminVerifications(token),
      ]);
      setDashboardData(dash);
      setListings(verifs.listings);
    } catch (err: any) {
      console.warn('Admin load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tokens?.accessToken]);

  // Real-time listener for admin moderation updates
  useEffect(() => {
    const unsubscribe = subscribeToAdminModeration((updated) => {
      setListings((prev) => {
        const idx = prev.findIndex((l) => l.id === updated.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return prev;
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleApprove = async (listingId: string) => {
    setActionLoadingId(listingId);
    try {
      const token = tokens?.accessToken || 'demo-admin-token';
      await apiVerifyListing(token, listingId);
      setListings((prev) =>
        prev.map((item) => (item.id === listingId ? { ...item, status: 'VERIFIED' } : item)),
      );
      broadcastModerationUpdate({ id: listingId, status: 'VERIFIED' });
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          metrics: {
            ...dashboardData.metrics,
            pendingVerifications: Math.max(0, dashboardData.metrics.pendingVerifications - 1),
            verifiedListings: dashboardData.metrics.verifiedListings + 1,
          },
        });
      }
      showToast('Property verified and published to live search catalog!');
    } catch (err: any) {
      showToast(err.message || 'Failed to verify property', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    const finalReason = customReason.trim() ? customReason.trim() : rejectionPreset;
    setActionLoadingId(rejectItem.id);
    try {
      const token = tokens?.accessToken || 'demo-admin-token';
      await apiRejectListing(token, rejectItem.id, finalReason);
      setListings((prev) =>
        prev.map((item) =>
          item.id === rejectItem.id
            ? { ...item, status: 'REJECTED', rejectionReason: finalReason }
            : item,
        ),
      );
      broadcastModerationUpdate({
        id: rejectItem.id,
        status: 'REJECTED',
        rejectionReason: finalReason,
      });
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          metrics: {
            ...dashboardData.metrics,
            pendingVerifications: Math.max(0, dashboardData.metrics.pendingVerifications - 1),
          },
        });
      }
      showToast('Property flagged as rejected with feedback sent to owner.');
      setRejectItem(null);
      setCustomReason('');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject listing', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((item) => {
    if (activeTab === 'queue' && item.status !== 'PENDING') return false;
    if (activeTab === 'all' && statusFilter !== 'ALL' && item.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCity = item.city.toLowerCase().includes(q);
      const matchOwner = item.owner.fullName?.toLowerCase().includes(q) || item.owner.email.toLowerCase().includes(q);
      const matchAddress = item.address.toLowerCase().includes(q);
      return matchTitle || matchCity || matchOwner || matchAddress;
    }
    return true;
  });

  const pendingCount = listings.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-neutral-900 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-4 duration-200 border ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-neutral-900 text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight">Trust & Moderation Portal</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Staff Moderator
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Firebase Realtime Sync
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Inspect student housing verification documents, approve listings, and protect escrow deposits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetQueue}
                title="Restore standard pending demonstration listings"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition border border-neutral-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Queue</span>
              </button>

              <button
                onClick={() => {
                  setRefreshing(true);
                  loadData();
                }}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition border border-neutral-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Live Queue</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF385C] hover:bg-[#E00B41] text-xs font-bold text-white transition shadow-sm"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Public App</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-neutral-800/60 backdrop-blur-xs border border-neutral-700/60 rounded-2xl p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Pending Verification</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {dashboardData?.metrics.pendingVerifications ?? pendingCount}
              </div>
              <div className="text-[11px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
                <span>Requires human audit</span>
              </div>
            </div>

            <div className="bg-neutral-800/60 backdrop-blur-xs border border-neutral-700/60 rounded-2xl p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Verified Active Rooms</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {dashboardData?.metrics.verifiedListings ?? 142}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">100% Search Indexed</div>
            </div>

            <div className="bg-neutral-800/60 backdrop-blur-xs border border-neutral-700/60 rounded-2xl p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Protected Escrow GMV</span>
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <IndianRupee className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                ₹{((dashboardData?.metrics.totalGMV ?? 2480000) / 100000).toFixed(1)}L
              </div>
              <div className="text-[11px] text-purple-300 font-medium mt-1">Held until Move-in</div>
            </div>

            <div className="bg-neutral-800/60 backdrop-blur-xs border border-neutral-700/60 rounded-2xl p-4.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">Verified Students</span>
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {dashboardData?.metrics.totalStudents ?? 1420}
              </div>
              <div className="text-[11px] text-neutral-400 font-medium mt-1">From 48+ Universities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Navigation Tabs and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-neutral-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Queue</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-neutral-900">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>All Properties</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Escrow & Safety Audit</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          {activeTab !== 'analytics' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, host, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              {activeTab === 'all' && (
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-bold bg-white border border-neutral-200 rounded-xl text-neutral-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="VERIFIED">Verified Active</option>
                  <option value="REJECTED">Declined / Flagged</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Tab 1 & 2: Listings List */}
        {(activeTab === 'queue' || activeTab === 'all') && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs text-neutral-500 font-medium">Loading verification queue...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-lg mx-auto my-12">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">Queue is completely clear!</h3>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  All submitted student accommodations have been verified. Newly registered host rooms will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((item) => {
                  const isPending = item.status === 'PENDING';
                  const isVerified = item.status === 'VERIFIED';
                  const isRejected = item.status === 'REJECTED';
                  const isCurrentAction = actionLoadingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Photo Showcase (Left) */}
                        <div className="lg:w-72 h-48 lg:h-auto shrink-0 bg-neutral-100 relative group">
                          {item.photoUrls?.[0] ? (
                            <img
                              src={item.photoUrls[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="w-8 h-8 text-neutral-300" />
                            </div>
                          )}

                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending Review
                              </span>
                            )}
                            {isVerified && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified Active
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content (Middle & Right) */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                              <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">
                                  {item.accommodationType} • {item.roomType}
                                </span>
                                <h3 className="text-lg font-bold text-neutral-900 mt-0.5">{item.title}</h3>
                              </div>

                              <div className="text-right">
                                <div className="text-base font-black text-neutral-900">
                                  ₹{item.pricePerMonth.toLocaleString('en-IN')}{' '}
                                  <span className="text-xs font-normal text-neutral-500">/mo</span>
                                </div>
                                <div className="text-[11px] text-neutral-400">
                                  Deposit: ₹{item.securityDeposit.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span>{item.address} ({item.city})</span>
                            </div>

                            {/* Host Information & Verification Badges */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs mb-4">
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                                  Property Host KYC
                                </div>
                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>{item.owner.fullName || 'Registered Host'}</span>
                                  {item.owner.isAadhaarVerified && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                                      <Check className="w-2.5 h-2.5" /> Aadhaar Verified
                                    </span>
                                  )}
                                </div>
                                <div className="text-neutral-500 text-[11px] mt-0.5">
                                  {item.owner.email} • {item.owner.phone}
                                </div>
                              </div>

                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                                  Attached Proofs
                                </div>
                                <div className="space-y-1">
                                  {(item.documents || []).map((doc, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setInspectedDoc({ doc, listing: item })}
                                      title="Click to inspect verification document"
                                      className="flex items-center justify-between text-[11px] w-full p-1.5 rounded-lg hover:bg-neutral-100/90 transition text-left group border border-transparent hover:border-neutral-200"
                                    >
                                      <span className="text-neutral-700 truncate group-hover:text-purple-700 font-medium flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-neutral-400 group-hover:text-purple-600 shrink-0" />
                                        <span>{doc.type}</span>
                                      </span>
                                      <span
                                        className={`font-bold px-1.5 py-0.2 rounded text-[9px] shrink-0 ${
                                          doc.status === 'VERIFIED'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : doc.status === 'FLAGGED'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}
                                      >
                                        {doc.status.replace('_', ' ')}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {item.rejectionReason && (
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 mb-3 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">Rejection Note: </span>
                                  <span>{item.rejectionReason}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 flex-wrap gap-2">
                            <span className="text-[11px] text-neutral-400">
                              Submitted {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>

                            <div className="flex items-center gap-2">
                              <Link
                                href="/rooms/nest-101"
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition"
                              >
                                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Preview Room</span>
                              </Link>

                              {isPending && (
                                <>
                                  <button
                                    onClick={() => setRejectItem(item)}
                                    disabled={isCurrentAction}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold transition disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Decline / Revision
                                  </button>

                                  <button
                                    onClick={() => handleApprove(item.id)}
                                    disabled={isCurrentAction}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                                  >
                                    {isCurrentAction ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                    Approve & Publish
                                  </button>
                                </>
                              )}

                              {isVerified && (
                                <button
                                  onClick={() => setRejectItem(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-semibold transition"
                                >
                                  Revoke Verification
                                </button>
                              )}

                              {isRejected && (
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
                                >
                                  Re-Approve Property
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Analytics & Safety Audit */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Escrow Protection Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-2xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-base">Escrow Vault Health</h3>
                    <p className="text-xs text-neutral-500">Student security deposit guarantee system</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Total Funds in Vault</span>
                    <span className="font-bold text-neutral-900">₹24,80,000 (100% Reserve)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Dispute Settlement Time</span>
                    <span className="font-bold text-emerald-600">Under 24 Hours (Guaranteed)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Automated Host Release</span>
                    <span className="font-bold text-neutral-900">24h After Student Check-in Confirmation</span>
                  </div>
                </div>
              </div>

              {/* KYC & Identity Architecture Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-2xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-base">DigiLocker & KYC Engine</h3>
                    <p className="text-xs text-neutral-500">Aadhaar and phone verification gateways</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Aadhaar UIDAI Gateway</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Operational (DigiLocker Demo)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">SendGrid Email Dispatch</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active (OTP delivery)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="text-neutral-600">Twilio SMS Gateway</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active (Phone verification)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Audit */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-2xs">
              <h3 className="font-bold text-neutral-900 text-base mb-4">Recent Escrow Stays & Bookings</h3>
              <div className="space-y-3">
                {(dashboardData?.recentBookings || []).map((bk, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl text-xs flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-neutral-900">{bk.listing?.title || 'Student Accommodation'}</span>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Student: {bk.student?.studentProfile?.fullName || 'Verified Scholar'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-neutral-900">₹{bk.totalAmount?.toLocaleString('en-IN')}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {bk.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Decline Property Listing</span>
              </div>
              <button
                onClick={() => setRejectItem(null)}
                className="p-1 rounded-full hover:bg-neutral-200 text-neutral-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">{rejectItem.title}</h4>
                <p className="text-xs text-neutral-500">
                  Select or specify why this property does not meet StudentNest verification standards. The host will be notified to revise details.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Standard Compliance Reason
                </label>
                <div className="space-y-2">
                  {REJECTION_PRESETS.map((preset, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        rejectionPreset === preset
                          ? 'border-purple-600 bg-purple-50/50 text-purple-950 font-semibold'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejection_preset"
                        checked={rejectionPreset === preset}
                        onChange={() => setRejectionPreset(preset)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>{preset}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Custom Feedback Note to Owner (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="e.g. Please upload clear photo of study desk and electricity bill showing your name..."
                  className="w-full p-3 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoadingId === rejectItem.id}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  {actionLoadingId === rejectItem.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Proof Inspection Modal */}
      {inspectedDoc && (
        <div
          onClick={() => setInspectedDoc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-purple-50/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">{inspectedDoc.doc.type}</h4>
                  <p className="text-[11px] text-neutral-500">
                    Verification audit for {inspectedDoc.listing.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedDoc(null)}
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Body Preview */}
            <div className="p-6 space-y-5">
              {/* Document Certificate Frame */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-black text-neutral-900 uppercase tracking-wide">
                        {inspectedDoc.doc.type.includes('Aadhaar')
                          ? 'DigiLocker UIDAI e-KYC Verification'
                          : inspectedDoc.doc.type.includes('Electricity')
                          ? 'State Electricity Board Ownership Record'
                          : 'Student Housing Safety Compliance Report'}
                      </div>
                      <div className="text-[10px] text-neutral-500">Government of India / Local Municipal Corporation</div>
                    </div>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      inspectedDoc.doc.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inspectedDoc.doc.status === 'FLAGGED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inspectedDoc.doc.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Registered Host</span>
                    <div className="font-bold text-neutral-900 mt-0.5">{inspectedDoc.listing.owner.fullName}</div>
                    <div className="text-[11px] text-neutral-500">{inspectedDoc.listing.owner.email}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Record ID / Ref</span>
                    <div className="font-mono text-xs font-bold text-purple-900 mt-0.5">
                      {inspectedDoc.doc.type.includes('Aadhaar')
                        ? 'UIDAI-XXXX-XXXX-9012'
                        : inspectedDoc.doc.type.includes('Electricity')
                        ? 'CA-8492019348-DEL'
                        : 'SAFE-AUD-2026-99'}
                    </div>
                    <div className="text-[11px] text-neutral-500">Verified with official database</div>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-neutral-200/60">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Premises Location On Record</span>
                    <div className="font-semibold text-neutral-800 text-[11px] mt-0.5">
                      {inspectedDoc.listing.address}, {inspectedDoc.listing.city}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Address matches listing declaration (100% geo-match)
                    </div>
                  </div>
                </div>
              </div>

              {/* Moderator Decision Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectedDoc(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold hover:bg-neutral-50 text-neutral-700 transition"
                >
                  Close Viewer
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateDocStatus(inspectedDoc.listing.id, inspectedDoc.doc.type, 'FLAGGED')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Flag Discrepancy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateDocStatus(inspectedDoc.listing.id, inspectedDoc.doc.type, 'VERIFIED')}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify Document</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
