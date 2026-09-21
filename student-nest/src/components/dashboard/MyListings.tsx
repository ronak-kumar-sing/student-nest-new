'use client';

import React, { useEffect, useState } from 'react';
import {
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit3,
  Plus,
  IndianRupee,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGetMyListings, apiDeleteListing } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Under Review', color: 'amber', icon: Clock },
  VERIFIED: { label: 'Live', color: 'emerald', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'rose', icon: XCircle },
};

export default function MyListings({ onPostNew }: { onPostNew: () => void }) {
  const { tokens } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    if (!tokens?.accessToken) return;
    setLoading(true);
    try {
      const data = await apiGetMyListings(tokens.accessToken);
      setListings(data);
    } catch { /* silent fail */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tokens?.accessToken]);

  const handleDelete = async (id: string) => {
    if (!tokens?.accessToken || !confirm('Delete this listing?')) return;
    setDeletingId(id);
    try {
      await apiDeleteListing(tokens.accessToken, id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
          <Home className="w-10 h-10 text-neutral-300" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">No listings yet</h3>
        <p className="text-sm text-neutral-500">Post your first property and start hosting students!</p>
        <button
          onClick={onPostNew}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF385C] text-white text-sm font-bold hover:bg-[#E00B41] transition-colors"
        >
          <Plus className="w-4 h-4" /> Post a Property
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-neutral-900">{listings.length} listing{listings.length !== 1 ? 's' : ''}</h3>
        <button
          onClick={onPostNew}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF385C] text-white text-xs font-bold hover:bg-[#E00B41] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Listing
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {listings.map(listing => {
          const cfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.PENDING;
          const StatusIcon = cfg.icon;
          const photo = listing.photoUrls?.[0];

          return (
            <div key={listing.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-40 bg-neutral-100">
                {photo ? (
                  <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-neutral-300" />
                  </div>
                )}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                  ${cfg.color === 'emerald' ? 'bg-emerald-500 text-white' :
                    cfg.color === 'amber' ? 'bg-amber-500 text-white' :
                    'bg-rose-500 text-white'}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h4 className="font-bold text-neutral-900 truncate">{listing.title}</h4>
                <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{listing.address}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-neutral-900 mt-2">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{listing.pricePerMonth?.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-normal text-neutral-400">/month</span>
                </div>

                {listing.status === 'REJECTED' && listing.rejectionReason && (
                  <div className="mt-2 text-xs text-rose-600 bg-rose-50 rounded-lg px-2.5 py-1.5">
                    {listing.rejectionReason}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deletingId === listing.id}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === listing.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
