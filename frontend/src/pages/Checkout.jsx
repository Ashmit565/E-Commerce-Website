import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  ClipboardCheck, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  ShieldCheck, 
  Truck, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Address, Step 2: Payment, Step 3: Review, Step 4: Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address state
  const [newFullName, setNewFullName] = useState(user?.full_name || '');
  const [newPhone, setNewPhone] = useState(user?.phone_number || '');
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  // Payment Method: 'simulated', 'upi', 'card', 'cod'
  const [paymentMethod, setPaymentMethod] = useState('simulated');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const data = await authService.getAddresses();
        setAddresses(data);
        if (data.length > 0) {
          const defaultAddr = data.find((a) => a.is_default) || data[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to load addresses', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const created = await authService.createAddress({
        full_name: newFullName,
        phone_number: newPhone,
        address_line1: newLine1,
        address_line2: newLine2 || undefined,
        city: newCity,
        state: newState,
        postal_code: newPostalCode,
        is_default: addresses.length === 0
      });
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      toast.success('Address saved successfully');
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      setCurrentStep(1);
      return;
    }

    try {
      setSubmittingOrder(true);
      const order = await orderService.createOrder({
        address_id: selectedAddressId,
        payment_method: paymentMethod
      });

      // If user selected Card or UPI, perform secure simulated payment verification
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        const payInit = await orderService.createPayment({
          order_id: order.id,
          payment_method: paymentMethod
        });

        await orderService.verifyPayment({
          order_id: order.id,
          transaction_id: payInit.transaction_id,
          status: 'success',
          is_simulated: true
        });
      }

      setConfirmedOrder(order);
      await refreshCart();
      setCurrentStep(4);
      toast.success('Your order has been placed successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to place order';
      toast.error(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    if (currentStep !== 4) {
      return (
        <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 1.5rem' }}>
            Add items to your cart before proceeding to checkout.
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      );
    }
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem', maxWidth: '1000px' }}>
      {/* Checkout Progress Stepper */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '3rem'
      }}>
        {[
          { num: 1, label: 'Address', icon: MapPin },
          { num: 2, label: 'Payment', icon: CreditCard },
          { num: 3, label: 'Review', icon: ClipboardCheck },
          { num: 4, label: 'Confirmed', icon: PackageCheck }
        ].map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <React.Fragment key={step.num}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: isDone || isCurrent ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: isDone || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(100, 38, 200, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isDone ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : 'var(--text-muted)'
                }}>
                  {step.label}
                </span>
              </div>
              {idx < 3 && (
                <div style={{
                  width: '70px',
                  height: '3px',
                  backgroundColor: currentStep > idx + 1 ? 'var(--primary)' : 'var(--border-light)',
                  margin: '0 8px 20px',
                  transition: 'background-color 0.3s ease'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1: DELIVERY ADDRESS */}
      {currentStep === 1 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Select Delivery Address
          </h2>

          {loadingAddresses ? (
            <LoadingSpinner message="Fetching your saved addresses..." />
          ) : (
            <div>
              {/* Existing Addresses List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: selectedAddressId === addr.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: selectedAddressId === addr.id ? 'var(--primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{addr.full_name}</span>
                      {addr.is_default && <span className="badge badge-primary">Default</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {addr.address_line1} {addr.address_line2 && `, ${addr.address_line2}`}<br />
                      {addr.city}, {addr.state} - {addr.postal_code}<br />
                      Phone: {addr.phone_number}
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggle Add New Address */}
              {!showNewAddressForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px', marginBottom: '1.5rem' }}
                >
                  <Plus size={16} />
                  <span>Add New Shipping Address</span>
                </button>
              ) : (
                <form onSubmit={handleSaveAddress} style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-light)'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>New Address Details</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="House / Flat / Block No, Building, Street"
                      className="form-input"
                      value={newLine1}
                      onChange={(e) => setNewLine1(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Landmark / Area (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newLine2}
                      onChange={(e) => setNewLine2(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save & Use This Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedAddressId}
                  className="btn btn-primary"
                  style={{ gap: '8px' }}
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PAYMENT METHOD */}
      {currentStep === 2 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Choose Payment Method
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            All transactions are secure and encrypted.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {/* Option 1: Simulated Instant Payment */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '1.25rem',
              borderRadius: '12px',
              border: paymentMethod === 'simulated' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              backgroundColor: paymentMethod === 'simulated' ? 'var(--primary-light)' : '#FFFFFF',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="simulated"
                checked={paymentMethod === 'simulated'}
                onChange={() => setPaymentMethod('simulated')}
                style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Simulated Instant Payment (Safe Test Mode)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>RECOMMENDED FOR TESTING</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Simulates a verified credit/debit transaction instantly without requiring live bank credentials.
                </p>
              </div>
            </label>

            {/* Option 2: UPI / QR */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '1.25rem',
              borderRadius: '12px',
              border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              backgroundColor: paymentMethod === 'upi' ? 'var(--primary-light)' : '#FFFFFF',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
                style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
              />
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>UPI (Google Pay / PhonePe / Paytm / BHIM)</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Pay seamlessly using any UPI App or VPA ID.
                </p>
              </div>
            </label>

            {/* Option 3: Credit/Debit Card */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '1.25rem',
              borderRadius: '12px',
              border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              backgroundColor: paymentMethod === 'card' ? 'var(--primary-light)' : '#FFFFFF',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
              />
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Credit or Debit Card</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Visa, MasterCard, RuPay, American Express supported.
                </p>
              </div>
            </label>

            {/* Option 4: Cash on Delivery */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '1.25rem',
              borderRadius: '12px',
              border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              backgroundColor: paymentMethod === 'cod' ? 'var(--primary-light)' : '#FFFFFF',
              cursor: 'pointer'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
              />
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Cash on Delivery (COD)</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Pay cash when your package is safely delivered to your doorstep.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn btn-secondary"
              style={{ gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Address</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn btn-primary"
              style={{ gap: '8px' }}
            >
              <span>Review Order</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ORDER REVIEW */}
      {currentStep === 3 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Review Your Order
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Delivery address snapshot */}
            <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Delivery Address</span>
                <button onClick={() => setCurrentStep(1)} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Change</button>
              </div>
              {selectedAddress && (
                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  <b>{selectedAddress.full_name}</b><br />
                  {selectedAddress.address_line1}<br />
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}<br />
                  Phone: {selectedAddress.phone_number}
                </div>
              )}
            </div>

            {/* Payment method snapshot */}
            <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Payment Mode</span>
                <button onClick={() => setCurrentStep(2)} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Change</button>
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                <b style={{ textTransform: 'uppercase' }}>{paymentMethod}</b><br />
                {paymentMethod === 'simulated' && 'Instant Sandbox Simulation (Fastest)'}
                {paymentMethod === 'upi' && 'UPI Virtual Payment Address'}
                {paymentMethod === 'card' && 'Credit / Debit Card Transaction'}
                {paymentMethod === 'cod' && 'Pay Cash Upon Receipt'}
              </div>
            </div>
          </div>

          {/* Items breakdown table */}
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Items in this order:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.product?.thumbnail}
                    alt=""
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  ₹{Number(item.item_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-light)',
            marginBottom: '2rem'
          }}>
            <div className="flex justify-between" style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
              <span>₹{Number(cart.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {Number(cart.discount_amount) > 0 && (
              <div className="flex justify-between" style={{ marginBottom: '6px', fontSize: '0.9rem', color: '#16A34A' }}>
                <span>Discount:</span>
                <span>- ₹{Number(cart.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Charges:</span>
              <span>
                {Number(cart.delivery_charge) === 0 ? (
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>FREE</span>
                ) : (
                  `₹${Number(cart.delivery_charge).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between items-baseline" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Final Total Payable:</span>
              <span style={{ fontWeight: 800, fontSize: '1.45rem', color: 'var(--primary)' }}>
                ₹{Number(cart.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn btn-secondary"
            >
              Back to Payment
            </button>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submittingOrder}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '220px' }}
            >
              {submittingOrder ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER CONFIRMATION */}
      {currentStep === 4 && confirmedOrder && (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Thank you for shopping with E-Commerce Website. Your order reference is{' '}
            <b style={{ color: 'var(--primary)' }}>{confirmedOrder.order_number}</b>.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
            textAlign: 'left',
            border: '1px solid var(--border-light)'
          }}>
            <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
              <span style={{ fontWeight: 700 }}>{confirmedOrder.order_number}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
              <span className={`badge ${confirmedOrder.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                {confirmedOrder.payment_status}
              </span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
              <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{confirmedOrder.payment_method}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '6px' }}>
              <span style={{ fontWeight: 700 }}>Amount Paid:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                ₹{Number(confirmedOrder.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link to="/orders" className="btn btn-secondary btn-lg">
              View Order History
            </Link>
            <Link to="/products" className="btn btn-primary btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

