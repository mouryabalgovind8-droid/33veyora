import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Download,
  Receipt,
  Building2,
  Smartphone
} from 'lucide-react';
import { Currency, Listing } from '../types';

interface PaymentModalProps {
  bookingData: {
    listing: Listing;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPriceINR: number;
    totalPriceUSD: number;
  } | null;
  onClose: () => void;
  currency: Currency;
  onPaymentSuccess: (bookingId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bookingData,
  onClose,
  currency,
  onPaymentSuccess,
}) => {
  if (!bookingData) return null;

  const { listing, checkIn, checkOut, guests, totalPriceINR, totalPriceUSD } = bookingData;

  const [paymentGateway, setPaymentGateway] = useState<'Razorpay' | 'PayPal'>(
    currency === 'INR' ? 'Razorpay' : 'PayPal'
  );
  const [razorpayMethod, setRazorpayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Form Fields
  const [guestName, setGuestName] = useState('Sandeep Bendre');
  const [guestEmail, setGuestEmail] = useState('sandeepbendre82@gmail.com');
  const [guestPhone, setGuestPhone] = useState('+91 98765 43210');
  const [upiId, setUpiId] = useState('sandeep@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [specialRequests, setSpecialRequests] = useState('Looking forward to our experience!');

  // Coupon code
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);

  const finalPriceINR = Math.max(0, totalPriceINR - discountAmount);
  const finalPriceUSD = Math.max(0, totalPriceUSD - Math.round(discountAmount / 83));

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'HAVEN2026') {
      const disc = Math.round(totalPriceINR * 0.1);
      setDiscountAmount(disc);
      setCouponApplied(true);
    } else {
      alert('Invalid Promo Code. Try "HAVEN2026" for 10% discount!');
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Create booking on server
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          guestName,
          guestEmail,
          guestPhone,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestsCount: guests,
          paymentGateway,
          specialRequests,
          paidCurrency: paymentGateway === 'Razorpay' ? 'INR' : 'USD',
        }),
      });

      const bookingJson = await bookingRes.json();

      if (!bookingJson.success) {
        throw new Error('Failed to record booking');
      }

      const createdBooking = bookingJson.booking;

      // 2. Verify payment with backend gateway endpoint
      if (paymentGateway === 'Razorpay') {
        await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: `pay_rzp_${Date.now()}`,
            razorpay_order_id: createdBooking.orderId,
            razorpay_signature: 'sig_mock_verified',
            bookingId: createdBooking.id,
          }),
        });
      } else {
        await fetch('/api/payments/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdBooking.orderId,
            bookingId: createdBooking.id,
          }),
        });
      }

      setCompletedBooking(createdBooking);
      onPaymentSuccess(createdBooking.id);
    } catch (err) {
      console.error(err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-800">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Secure Checkout Engine</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-mono font-bold">
                  256-Bit SSL
                </span>
              </h2>
              <p className="text-xs text-slate-500">{listing.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedBooking ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Transaction Verified
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Payment Successful!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
                Your reservation is locked in. Automated confirmation emails with complete directions &amp; receipts have been dispatched to <strong>{completedBooking.guestEmail}</strong> and Host <strong>{completedBooking.hostName}</strong>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-indigo-600" />
                  Booking Receipt
                </span>
                <span className="text-indigo-600">{completedBooking.id}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Guest Name:</span>
                <span className="text-slate-800 font-medium">{completedBooking.guestName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Experience Dates:</span>
                <span className="text-slate-800 font-medium">
                  {completedBooking.checkInDate} to {completedBooking.checkOutDate}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Gateway:</span>
                <span className="text-slate-800 font-medium">
                  {completedBooking.paymentGateway} ({completedBooking.paymentId})
                </span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200 font-bold text-sm text-slate-900">
                <span>Total Paid:</span>
                <span className="text-indigo-600">
                  {completedBooking.paidCurrency === 'INR' ? `₹${completedBooking.paidAmount.toLocaleString()}` : `$${completedBooking.paidAmount}`}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                View My Bookings Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM */
          <form onSubmit={handlePay} className="p-6 space-y-6">
            {/* Gateway Selector Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Select Payment Gateway Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentGateway('Razorpay')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentGateway === 'Razorpay'
                      ? 'bg-indigo-50 border-indigo-600 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <span className="text-indigo-600">Razorpay</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                        UPI &bull; Cards &bull; Netbanking
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pay in ₹ INR (Rupee)</p>
                  </div>
                  {paymentGateway === 'Razorpay' && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentGateway('PayPal')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentGateway === 'PayPal'
                      ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <span className="text-amber-600">PayPal</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                        Global Cards &bull; Wallet
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pay in $ USD (Dollar)</p>
                  </div>
                  {paymentGateway === 'PayPal' && <CheckCircle2 className="h-5 w-5 text-amber-500" />}
                </button>
              </div>
            </div>

            {/* Guest Contact Details */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Guest Contact &amp; Invoice Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Email Address (for Receipt &amp; Voucher)</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Mobile Phone (WhatsApp Notifications)</label>
                  <input
                    type="text"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Promo / Coupon Code</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. HAVEN2026"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 uppercase focus:outline-none focus:border-indigo-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay specific payment sub-methods */}
            {paymentGateway === 'Razorpay' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase">Razorpay Payment Option</span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setRazorpayMethod('upi')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold ${
                        razorpayMethod === 'upi' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setRazorpayMethod('card')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold ${
                        razorpayMethod === 'card' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setRazorpayMethod('netbanking')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold ${
                        razorpayMethod === 'netbanking' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Netbanking
                    </button>
                  </div>
                </div>

                {razorpayMethod === 'upi' && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-slate-800" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                          Scan QR with GPay / PhonePe / Paytm
                        </p>
                        <p className="text-[10px] text-slate-500">Or enter VPA / UPI ID below:</p>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-indigo-700 font-semibold w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {razorpayMethod === 'card' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-1">Valid Thru</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {razorpayMethod === 'netbanking' && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'Others'].map((b) => (
                      <div
                        key={b}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-center cursor-pointer text-slate-700 hover:border-indigo-600 flex items-center justify-center gap-1 font-medium"
                      >
                        <Building2 className="h-3 w-3 text-indigo-600" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PayPal Option Brief */}
            {paymentGateway === 'PayPal' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <CreditCard className="h-4 w-4" />
                  <span>PayPal Express Checkout (Global USD)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  You will be authenticated through PayPal's secure gateway. Standard buyer protection included automatically.
                </p>
              </div>
            )}

            {/* Final Amount & Pay Button */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Amount Payable ({paymentGateway === 'Razorpay' ? 'INR' : 'USD'})
                </span>
                <span className="text-2xl font-black text-indigo-600">
                  {paymentGateway === 'Razorpay'
                    ? `₹${finalPriceINR.toLocaleString()}`
                    : `$${finalPriceUSD}`}
                </span>
                {couponApplied && (
                  <span className="text-[10px] text-emerald-600 font-semibold block">10% Promo Discount Applied!</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Transaction...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay Now via {paymentGateway}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
