'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  X,
  Plus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MapPin,
  IndianRupee,
  Wifi,
  Car,
  Zap,
  Droplets,
  Wind,
  Utensils,
  Tv,
  Shield,
  BookOpen,
  Dumbbell,
  Loader2,
} from 'lucide-react';
import {
  apiGetCloudinarySignature,
  apiCreateListing,
  type CreateListingPayload,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { broadcastModerationUpdate } from '@/lib/firebase';

interface UploadedPhoto {
  url: string;
  publicId: string;
  name: string;
}

const AMENITIES = [
  { id: 'WiFi', label: 'High-Speed WiFi', icon: Wifi },
  { id: 'AC', label: 'Air Conditioning', icon: Wind },
  { id: 'Parking', label: 'Parking', icon: Car },
  { id: 'Electricity', label: '24h Electricity', icon: Zap },
  { id: 'Water', label: '24h Water', icon: Droplets },
  { id: 'Kitchen', label: 'Shared Kitchen', icon: Utensils },
  { id: 'TV', label: 'Cable TV', icon: Tv },
  { id: 'Security', label: 'CCTV Security', icon: Shield },
  { id: 'Study', label: 'Study Room', icon: BookOpen },
  { id: 'Gym', label: 'Gym Access', icon: Dumbbell },
];

const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single Room', desc: 'Private room for one student' },
  { value: 'DOUBLE', label: 'Double Sharing', desc: '2 students share a room' },
  { value: 'TRIPLE', label: 'Triple Sharing', desc: '3 students share a room' },
  { value: 'APARTMENT', label: 'Full Apartment', desc: 'Entire flat / apartment' },
];

const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];

const CITY_COORDS: Record<string, [number, number]> = {
  Pune: [18.5204, 73.8567], Mumbai: [19.0760, 72.8777], Delhi: [28.7041, 77.1025],
  Bangalore: [12.9716, 77.5946], Hyderabad: [17.3850, 78.4867], Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639], Ahmedabad: [23.0225, 72.5714], Jaipur: [26.9124, 75.7873], Surat: [21.1702, 72.8311],
};

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

function Step1Basic({ form, setForm }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Property Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Cozy 2BHK near Pune University"
          className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C] transition"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Description *</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={4}
          placeholder="Describe the property, surroundings, nearby colleges, rules..."
          className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C] transition resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Room Type *</label>
        <div className="grid grid-cols-2 gap-3">
          {ROOM_TYPES.map(rt => (
            <button
              key={rt.value}
              type="button"
              onClick={() => setForm({ ...form, roomType: rt.value })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                form.roomType === rt.value
                  ? 'border-[#FF385C] bg-[#FF385C]/5'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <div className="text-sm font-bold text-neutral-900">{rt.label}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{rt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">City *</label>
        <select
          value={form.city}
          onChange={e => setForm({ ...form, city: e.target.value })}
          className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C] transition bg-white"
        >
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Full Address *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Building, Street, Area, City"
            className="w-full border border-neutral-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C] transition"
          />
        </div>
      </div>
    </div>
  );
}

function Step2Pricing({ form, setForm }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Monthly Rent (₹) *</label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
          <input
            type="number"
            value={form.pricePerMonth || ''}
            onChange={e => setForm({ ...form, pricePerMonth: Number(e.target.value) })}
            placeholder="e.g. 8000"
            min={500}
            className="w-full border border-neutral-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C] transition"
          />
        </div>
        <p className="text-xs text-neutral-400 mt-1">Minimum ₹500/month</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Security Deposit (₹)</label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
          <input
            type="number"
            value={form.securityDeposit || ''}
            onChange={e => setForm({ ...form, securityDeposit: Number(e.target.value) })}
            placeholder="e.g. 16000 (usually 2 months rent)"
            min={0}
            className="w-full border border-neutral-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 focus:border-[#FF385C] transition"
          />
        </div>
      </div>
      {form.pricePerMonth > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pricing Summary</div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Monthly Rent</span>
            <span className="font-bold text-neutral-900">₹{form.pricePerMonth.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Security Deposit</span>
            <span className="font-bold text-neutral-900">₹{(form.securityDeposit || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="h-px bg-emerald-100" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-neutral-700">First Payment</span>
            <span className="text-emerald-700">₹{(form.pricePerMonth + (form.securityDeposit || 0)).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3Amenities({ form, setForm }: StepProps) {
  const toggle = (id: string) => {
    const current: string[] = form.amenities || [];
    setForm({
      ...form,
      amenities: current.includes(id) ? current.filter((a: string) => a !== id) : [...current, id],
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">Select all amenities available at your property</p>
      <div className="grid grid-cols-2 gap-3">
        {AMENITIES.map(({ id, label, icon: Icon }) => {
          const isSelected = (form.amenities || []).includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step4Photos({ form, setForm, token }: StepProps & { token: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const photos: UploadedPhoto[] = form.photos || [];

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');

    try {
      // Get Cloudinary signature from backend
      const sig = await apiGetCloudinarySignature(token, 'student-nest/listings');

      const uploaded: UploadedPhoto[] = [...photos];
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', sig.uploadPreset);
        fd.append('folder', sig.folder);
        fd.append('timestamp', String(sig.timestamp));
        fd.append('api_key', sig.apiKey);
        fd.append('signature', sig.signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          { method: 'POST', body: fd }
        );

        if (res.ok) {
          const data = await res.json();
          uploaded.push({
            url: data.secure_url,
            publicId: data.public_id,
            name: file.name,
          });
        } else {
          // Fallback: use object URL for demo if Cloudinary isn't configured
          const objectUrl = URL.createObjectURL(file);
          uploaded.push({
            url: objectUrl,
            publicId: `demo-${Date.now()}-${file.name}`,
            name: file.name,
          });
        }
      }

      setForm({ ...form, photos: uploaded, photoUrls: uploaded.map((p: UploadedPhoto) => p.url) });
    } catch {
      // Demo mode: use object URLs when Cloudinary isn't configured
      const uploaded: UploadedPhoto[] = [...photos];
      for (const file of Array.from(files)) {
        const objectUrl = URL.createObjectURL(file);
        uploaded.push({ url: objectUrl, publicId: `demo-${Date.now()}`, name: file.name });
      }
      setForm({ ...form, photos: uploaded, photoUrls: uploaded.map((p: UploadedPhoto) => p.url) });
    } finally {
      setUploading(false);
    }
  }, [photos, form, setForm, token]);

  const removePhoto = (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx);
    setForm({ ...form, photos: updated, photoUrls: updated.map(p => p.url) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">Upload high-quality photos of your property (max 10MB each)</p>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border-2 border-dashed border-neutral-300 hover:border-[#FF385C] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#FF385C]/3 group"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#FF385C] animate-spin" />
            <p className="text-sm text-neutral-500">Uploading to Cloudinary...</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-neutral-300 group-hover:text-[#FF385C] mx-auto mb-3 transition-colors" />
            <p className="text-sm font-semibold text-neutral-700">Drag & drop photos here</p>
            <p className="text-xs text-neutral-400 mt-1">or click to browse · JPG, PNG, WEBP · Max 10MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{uploadError}</p>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-neutral-100">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full text-white hidden group-hover:flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#FF385C] flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-[#FF385C] transition-colors cursor-pointer"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add more</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Step5Review({ form }: { form: any }) {
  const photos: UploadedPhoto[] = form.photos || [];
  return (
    <div className="space-y-5">
      <div className="bg-neutral-50 rounded-2xl p-4 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-neutral-500">Title</span><span className="font-semibold">{form.title || '—'}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Room Type</span><span className="font-semibold capitalize">{form.roomType?.toLowerCase().replace('_', ' ') || '—'}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">City</span><span className="font-semibold">{form.city}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Address</span><span className="font-semibold text-right max-w-[60%]">{form.address || '—'}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Monthly Rent</span><span className="font-bold text-emerald-700">₹{(form.pricePerMonth || 0).toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Security Deposit</span><span className="font-semibold">₹{(form.securityDeposit || 0).toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Amenities</span><span className="font-semibold">{(form.amenities || []).length} selected</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">Photos</span><span className="font-semibold">{photos.length} uploaded</span></div>
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((p, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-100">
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        <strong>Note:</strong> Your listing will be reviewed by our team before going live. This usually takes 2–4 hours.
      </div>
    </div>
  );
}

const STEPS = ['Basic Info', 'Pricing', 'Amenities', 'Photos', 'Review'];

export default function PropertyPostForm({ onSuccess }: { onSuccess?: () => void }) {
  const { tokens } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    roomType: 'SINGLE',
    city: 'Pune',
    address: '',
    pricePerMonth: 0,
    securityDeposit: 0,
    amenities: [] as string[],
    photos: [] as UploadedPhoto[],
    photoUrls: [] as string[],
  });

  const canProceed = () => {
    if (step === 0) return form.title.trim() && form.description.trim() && form.address.trim();
    if (step === 1) return form.pricePerMonth >= 500;
    return true;
  };

  const handleSubmit = async () => {
    if (!tokens?.accessToken) { setError('Please log in as an owner to post listings'); return; }
    setSubmitting(true);
    setError('');
    try {
      const [lat, lng] = CITY_COORDS[form.city] || [18.52, 73.86];
      const payload: CreateListingPayload = {
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        latitude: lat,
        longitude: lng,
        pricePerMonth: form.pricePerMonth,
        securityDeposit: form.securityDeposit || 0,
        roomType: form.roomType as any,
        amenities: form.amenities,
        photoUrls: form.photoUrls,
      };
      const res = await apiCreateListing(tokens.accessToken, payload);
      const created = (res as any)?.data || res;
      broadcastModerationUpdate({
        id: created?.id || `listing_${Date.now()}`,
        title: form.title,
        city: form.city,
        status: 'PENDING',
        photoUrls: form.photoUrls,
        pricePerMonth: form.pricePerMonth,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900">Listing Submitted!</h3>
        <p className="text-sm text-neutral-500 max-w-xs">
          Your property listing is under review. We'll notify you once it's verified and live.
        </p>
        <button
          onClick={() => { setSuccess(false); setStep(0); setForm({ title: '', description: '', roomType: 'SINGLE', city: 'Pune', address: '', pricePerMonth: 0, securityDeposit: 0, amenities: [], photos: [], photoUrls: [] }); }}
          className="mt-2 px-6 py-2.5 rounded-full bg-[#FF385C] text-white text-sm font-bold hover:bg-[#E00B41] transition-colors"
        >
          Post Another Property
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 ${i <= step ? 'text-[#FF385C]' : 'text-neutral-400'}`}>
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                i < step ? 'bg-[#FF385C] text-white' :
                i === step ? 'border-2 border-[#FF385C] text-[#FF385C]' :
                'border-2 border-neutral-200 text-neutral-400'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-[#FF385C]' : i < step ? 'text-neutral-700' : 'text-neutral-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-[#FF385C]' : 'bg-neutral-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Title */}
      <h2 className="text-xl font-bold text-neutral-900 mb-5">{STEPS[step]}</h2>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {step === 0 && <Step1Basic form={form} setForm={setForm} />}
        {step === 1 && <Step2Pricing form={form} setForm={setForm} />}
        {step === 2 && <Step3Amenities form={form} setForm={setForm} />}
        {step === 3 && <Step4Photos form={form} setForm={setForm} token={tokens?.accessToken || ''} />}
        {step === 4 && <Step5Review form={form} />}
      </div>

      {error && (
        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF385C] text-white text-sm font-bold hover:bg-[#E00B41] disabled:opacity-60 transition-colors"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Listing 🚀'}
          </button>
        )}
      </div>
    </div>
  );
}
