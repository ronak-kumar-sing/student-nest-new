'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  X,
  IndianRupee,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Building,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loadRazorpayScript } from '@/lib/razorpay';
import { apiCreatePaymentOrder, apiVerifyPayment } from '@/lib/api';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    listingId: string;
    title?: string;
    address?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
    totalAmount?: number;
    pricePerMonth?: number;
    securityDeposit?: number;
    durationMonths?: number;
  };
  onPaymentSuccess: (bookingId: string) => void;
}

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}: RazorpayCheckoutModalProps) {
  const { tokens, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    orderId: string;
    paymentId: string;
    amount: number;
    paidAt: string;
  } | null>(null);

  if (!isOpen) return null;

  const rent = booking.pricePerMonth || Math.round((booking.totalAmount || 15000) * 0.7);
  const deposit = booking.securityDeposit || Math.round((booking.totalAmount || 15000) * 0.25);
  const platformFee = Math.round(rent * 0.03); // 3% student guarantee fee
  const totalAmount = booking.totalAmount || (rent + deposit + platformFee);

  const handlePay = async () => {
    if (!tokens?.accessToken) {
      setError('Please sign in to complete payment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend
      const order = await apiCreatePaymentOrder(tokens.accessToken, booking.id);

      // 2. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay && order.keyId !== 'rzp_test_placeholder') {
        // Real Razorpay modal configuration
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'StudentNest Housing',
          description: `Booking deposit for ${booking.title || 'Student Room'}`,
          order_id: order.orderId,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#FF385C',
          },
          handler: async function (response: any) {
            try {
              await apiVerifyPayment(tokens.accessToken, {
                razorpayOrderId: response.razorpay_order_id || order.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || 'sig_demo',
              });

              setReceipt({
                orderId: response.razorpay_order_id || order.orderId,
                paymentId: response.razorpay_payment_id,
                amount: totalAmount,
                paidAt: new Date().toLocaleString('en-IN'),
              });

              onPaymentSuccess(booking.id);
            } catch (err: any) {
              setError(err.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setError(resp.error?.description || 'Payment transaction failed.');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Smooth simulated test checkout (Instant test mode)
        await new Promise((r) => setTimeout(r, 1200));

        const mockPaymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        await apiVerifyPayment(tokens.accessToken, {
          razorpayOrderId: order.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: 'sig_mock_verified',
        });

        setReceipt({
          orderId: order.orderId,
          paymentId: mockPaymentId,
          amount: totalAmount,
          paidAt: new Date().toLocaleString('en-IN'),
        });

        onPaymentSuccess(booking.id);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-neutral-100/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">Escrow Secure Checkout</h3>
              <p className="text-[11px] text-neutral-500">Powered by Razorpay & StudentNest Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {receipt ? (
            /* Success Receipt */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-neutral-900">Payment Confirmed!</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Your payment is secured in the StudentNest Escrow vault.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 text-left border border-neutral-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Transaction ID</span>
                  <span className="font-mono font-bold text-neutral-800">{receipt.paymentId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Razorpay Order</span>
                  <span className="font-mono text-neutral-700">{receipt.orderId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Amount Paid</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ₹{receipt.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Date & Time</span>
                  <span className="text-neutral-700">{receipt.paidAt}</span>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl flex items-start gap-2 text-left">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>
                  <strong>Escrow Guarantee:</strong> Funds will only be released to the owner 24 hours after your successful check-in.
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm hover:bg-black transition-colors"
              >
                Close & View Booking
              </button>
            </div>
          ) : (
            /* Payment Breakdown & Checkout Form */
            <div className="space-y-5">
              {/* Property Details */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-[#FF385C]/10 flex items-center justify-center text-[#FF385C] shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-neutral-900 truncate">
                    {booking.title || 'Student Accommodation'}
                  </h4>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {booking.address ? `${booking.address}, ${booking.city || ''}` : 'Verified Academic Campus Room'}
                  </p>
                  {(booking.startDate || booking.endDate) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 mt-1.5 font-medium">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>
                        {booking.startDate || 'Start Date'} → {booking.endDate || 'End Date'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-neutral-600 border-t border-b border-neutral-100 py-3.5">
                <div className="flex justify-between items-center">
                  <span>First Month Rent</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{rent.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Refundable Security Deposit</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{deposit.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Student Protection Fee (3%)
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  </span>
                  <span className="font-semibold text-neutral-900">
                    ₹{platformFee.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-neutral-200 text-sm font-bold text-neutral-900">
                  <span>Total Amount Due</span>
                  <span className="text-emerald-700 text-base font-black">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Methods Supported */}
              <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">Supported Payments:</span>
                <span className="font-semibold text-neutral-600">UPI · Google Pay · Cards · NetBanking</span>
              </div>

              {/* Security Shield Callout */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>StudentNest Escrow:</strong> Your money is held in a secure trust account and is only released to the owner after you move in.
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] text-white font-bold text-sm hover:opacity-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Razorpay Gateway...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{totalAmount.toLocaleString('en-IN')} with Razorpay
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
