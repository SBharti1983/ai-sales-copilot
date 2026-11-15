import React, { useState } from 'react';
import { X, Sparkles, Building2, User, Mail, Phone, DollarSign, FileText } from 'lucide-react';
import type { Lead } from '../types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Partial<Lead>) => Promise<void>;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('VP Engineering / CTO');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('2500000');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !company || !email) return;

    setLoading(true);
    try {
      await onSubmit({
        fullName,
        company,
        designation,
        email,
        phone,
        budget: Number(budget) || 0,
        requirements,
      });
      onClose();
    } catch {
      alert('Failed to create lead. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '700' }}>Add Enterprise Lead</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Lead will be saved in SQL and instantly evaluated by Semantic Kernel AI
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Company */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Company Name *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                <Building2 size={15} color="var(--text-dim)" />
                <input
                  required
                  placeholder="e.g. InfyTech Global"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Contact Person *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                <User size={15} color="var(--text-dim)" />
                <input
                  required
                  placeholder="e.g. Ananya Sen"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Title / Designation */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Designation
              </label>
              <input
                placeholder="e.g. CTO / VP Technology"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                style={{ width: '100%', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Budget */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Budget (INR ₹)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                <DollarSign size={15} color="var(--text-dim)" />
                <input
                  type="number"
                  placeholder="e.g. 2500000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Email Address *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                <Mail size={15} color="var(--text-dim)" />
                <input
                  required
                  type="email"
                  placeholder="contact@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
                <Phone size={15} color="var(--text-dim)" />
                <input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '13px', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Business Requirements & Project Scope
            </label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px' }}>
              <FileText size={15} color="var(--text-dim)" style={{ marginTop: '3px' }} />
              <textarea
                rows={3}
                placeholder="e.g. Planning cloud migration to Azure with custom AI copilot for 300+ sales representatives across APAC..."
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontSize: '13px', width: '100%', resize: 'none' }}
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ fontSize: '13px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: '13px' }}>
              <Sparkles size={14} />
              <span>{loading ? 'Saving & Scoring...' : 'Save & AI Qualify'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
