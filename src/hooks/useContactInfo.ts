import { useEffect, useState } from 'react';
import { ContactInfoService, ContactInfo } from '@/services/supabase/contactInfoService';

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const data = await ContactInfoService.getContactInfo();
      setContactInfo(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return { contactInfo, loading, error, refetch: fetchContactInfo };
}
