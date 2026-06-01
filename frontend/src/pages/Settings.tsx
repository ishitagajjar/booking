import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import httpClient from '@/api/httpClient';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [taxRate, setTaxRate] = useState('0');
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await httpClient.put('/users/profile', form);
      if (data.IsSuccess) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.Message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
    setSaving(false);
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setSavingPassword(true);
    setPasswordMessage(null);
    try {
      const { data } = await httpClient.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (data.IsSuccess) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: data.Message });
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Failed to change password' });
    }
    setSavingPassword(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card title="Business Profile">
        <form onSubmit={handleProfile} className="space-y-4">
          <Input label="Email" type="email" value={user?.email || ''} disabled className="bg-gray-50" />
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>Save Changes</Button>
            {message && (
              <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</span>
            )}
          </div>
        </form>
      </Card>

      <Card title="Change Password">
        <form onSubmit={handlePassword} className="space-y-4">
          <Input label="Current Password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
          <Input label="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
          <Input label="Confirm New Password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength={6} />
          <div className="flex items-center gap-3">
            <Button type="submit" loading={savingPassword} variant="secondary">Change Password</Button>
            {passwordMessage && (
              <span className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</span>
            )}
          </div>
        </form>
      </Card>

      <Card title="Tax Configuration">
        <div className="space-y-4">
          <Input
            label="Default Tax Rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            min="0"
            max="100"
            step="0.01"
          />
          <p className="text-sm text-gray-500">This rate will be applied by default when creating new invoices.</p>
          <Button variant="secondary">Update Tax Rate</Button>
        </div>
      </Card>
    </div>
  );
}
