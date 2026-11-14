import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, updateProfileState } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'security', 'addresses'

  // Personal Info Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);

  // New address form
  const [addrName, setAddrName] = useState(user?.full_name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone_number || '');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postal, setPostal] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone_number || '');
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await authService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const updated = await authService.updateProfile({
        full_name: fullName,
        phone_number: phone || undefined
      });
      updateProfileState(updated);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdatingPassword(true);
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const created = await authService.createAddress({
        full_name: addrName,
        phone_number: addrPhone,
        address_line1: line1,
        city,
        state,
        postal_code: postal,
        is_default: addresses.length === 0
      });
      setAddresses([...addresses, created]);
      setShowAddAddr(false);
      setLine1('');
      setCity('');
      setState('');
      setPostal('');
      toast.success('Address saved successfully');
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await authService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.info('Address removed');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Account & Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your personal details, credentials, and saved addresses
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-3" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem'
              }}>
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{user?.full_name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => setActiveTab('personal')}
                className="flex items-center gap-2"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'personal' ? 700 : 500,
                  backgroundColor: activeTab === 'personal' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'personal' ? 'var(--primary)' : 'var(--text-main)'
                }}
              >
                <User size={18} />
                <span>Personal Information</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className="flex items-center gap-2"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'security' ? 700 : 500,
                  backgroundColor: activeTab === 'security' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-main)'
                }}
              >
                <Lock size={18} />
                <span>Security & Password</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className="flex items-center gap-2"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'addresses' ? 700 : 500,
                  backgroundColor: activeTab === 'addresses' ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-main)'
                }}
              >
                <MapPin size={18} />
                <span>Saved Addresses</span>
              </button>

              <Link
                to="/orders"
                className="flex items-center gap-2"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  textDecoration: 'none',
                  marginTop: '6px',
                  borderTop: '1px solid var(--border-light)'
                }}
              >
                <Package size={18} />
                <span>View My Orders</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div style={{ flex: 2 }}>
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                Personal Information
              </h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="form-input"
                    style={{ backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="btn btn-primary"
                  style={{ marginTop: '0.5rem' }}
                >
                  {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                Change Account Password
              </h2>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="btn btn-primary"
                  style={{ marginTop: '0.5rem' }}
                >
                  {updatingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="card" style={{ padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Saved Shipping Addresses</h2>
                {!showAddAddr && (
                  <button
                    onClick={() => setShowAddAddr(true)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '4px' }}
                  >
                    <Plus size={16} />
                    <span>New Address</span>
                  </button>
                )}
              </div>

              {showAddAddr && (
                <form onSubmit={handleAddAddress} style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-light)'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Add New Address</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="form-input"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address Line</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={postal}
                        onChange={(e) => setPostal(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                    <button type="button" onClick={() => setShowAddAddr(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <LoadingSpinner message="Loading addresses..." />
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No saved addresses. Add an address for faster checkout.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.full_name}</span>
                          {a.is_default && <span className="badge badge-primary">Default</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                          {a.address_line1}<br />
                          {a.city}, {a.state} - {a.postal_code}<br />
                          Phone: {a.phone_number}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(a.id)}
                        style={{ color: '#EF4444', padding: '6px' }}
                        title="Delete Address"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

