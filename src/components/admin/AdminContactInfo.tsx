import React, { useState } from 'react';
import { ContactInfoService, ContactInfo } from '@/services/supabase/contactInfoService';
import { useContactInfo } from '@/hooks/useContactInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminContactInfo: React.FC = () => {
  const { contactInfo, loading, error, refetch } = useContactInfo();
  const [form, setForm] = useState<Partial<ContactInfo>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (contactInfo) setForm(contactInfo);
  }, [contactInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const updated = await ContactInfoService.updateContactInfo(form);
    setSaving(false);
    if (updated) {
      setSuccess(true);
      refetch();
    }
  };

  if (loading) return <div>جاري تحميل معلومات الاتصال...</div>;
  if (error) return <div>خطأ في تحميل معلومات الاتصال</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">معلومات اتصل بنا</h2>
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" value={form.email || ''} onChange={handleChange} required type="email" />
      </div>
      <div>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input id="phone" name="phone" value={form.phone || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="address">العنوان</Label>
        <Input id="address" name="address" value={form.address || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="facebook">رابط فيسبوك</Label>
        <Input id="facebook" name="facebook" value={form.facebook || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="instagram">رابط انستغرام</Label>
        <Input id="instagram" name="instagram" value={form.instagram || ''} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="whatsapp">رقم واتساب</Label>
        <Input id="whatsapp" name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} />
      </div>
      <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
      {success && <div className="text-green-600 mt-2">تم تحديث المعلومات بنجاح</div>}
    </form>
  );
};

export default AdminContactInfo;
