import React, { useState } from 'react';
import { useLanguage } from '@/utils/languageContextUtils';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, MessageCircle, Smartphone } from 'lucide-react';
import { useContactInfo } from '@/hooks/useContactInfo';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { contactInfo, loading: contactLoading } = useContactInfo();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // إرسال البيانات إلى البريد الافتراضي عبر mailto (فتح برنامج البريد عند المستخدم)
      if (contactInfo?.email) {
        const mailto = `mailto:${contactInfo.email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `الاسم: ${formData.name}\nالبريد: ${formData.email}\nالهاتف: ${formData.phone}\n\n${formData.message}`
        )}`;
        window.location.href = mailto;
      }
      toast({
        title: t('success'),
        description: t('messageSubmitted'),
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast({
        title: t('error'),
        description: t('errorSendingMessage'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FIELD_ICONS: Record<string, React.ReactNode> = {
    email: <Mail className="h-5 w-5" />,
    phone: <Phone className="h-5 w-5" />,
    address: <MapPin className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    whatsapp: <Smartphone className="h-5 w-5" />,
    working_hours: <Clock className="h-5 w-5" />,
  };
  const FIELD_LABELS: Record<string, string> = {
    email: t('email'),
    phone: t('phone'),
    address: t('address'),
    facebook: 'Facebook',
    instagram: 'Instagram',
    whatsapp: t('phone'),
    working_hours: t('workingHours') || 'ساعات العمل',
  };
  const FIELD_KEYS = [
    'email',
    'phone',
    'address',
    'facebook',
    'instagram',
    'whatsapp',
    'working_hours',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchChange={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('contact')}</h1>
          <p className="text-gray-600">
            {t('getInTouch')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {(Array.isArray(contactInfo?.fields_order) ? contactInfo.fields_order.filter((f): f is string => typeof f === 'string') : FIELD_KEYS).map((field) => (
              contactInfo?.[field as keyof typeof contactInfo] ? (
                <Card key={field}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {FIELD_ICONS[field]}
                      {FIELD_LABELS[field] || field}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {field === 'working_hours' && typeof contactInfo[field as keyof typeof contactInfo] === 'string' ? (
                        <pre className="whitespace-pre-wrap break-words">{contactInfo[field as keyof typeof contactInfo] as string}</pre>
                      ) : (typeof contactInfo[field as keyof typeof contactInfo] === 'string' || typeof contactInfo[field as keyof typeof contactInfo] === 'number'
                        ? contactInfo[field as keyof typeof contactInfo]
                        : '-')}
                    </div>
                  </CardContent>
                </Card>
              ) : null
            ))}
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('sendMessage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('fullName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('subject')}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      autoComplete="off"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('message')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    autoComplete="off"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('sending') : t('sendMessage')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Contact;
