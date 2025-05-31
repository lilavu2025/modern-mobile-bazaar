import React, { useState } from 'react';
import { useLanguage } from '@/utils/languageContextUtils';
import { useAddresses, Address } from '@/hooks/useAddresses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit } from 'lucide-react';

interface EditAddressDialogProps {
  address: Address;
  trigger?: React.ReactNode;
}

const EditAddressDialog: React.FC<EditAddressDialogProps> = ({ address, trigger }) => {
  const { t, isRTL } = useLanguage();
  const { updateAddress, isUpdating } = useAddresses();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: address.full_name,
    phone: address.phone,
    city: address.city,
    area: address.area,
    street: address.street,
    building: address.building,
    floor: address.floor || '',
    apartment: address.apartment || '',
    is_default: address.is_default || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.id) {
      updateAddress({
        id: address.id,
        user_id: address.user_id,
        ...formData,
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`max-w-md ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('editAddress')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')}</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('city')}</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">{t('area')}</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                required
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">{t('street')}</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
              required
              className={isRTL ? 'text-right' : 'text-left'}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">{t('building')}</Label>
              <Input
                id="building"
                value={formData.building}
                onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                required
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">{t('floor')}</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment">{t('apartment')}</Label>
              <Input
                id="apartment"
                value={formData.apartment}
                onChange={(e) => setFormData(prev => ({ ...prev, apartment: e.target.value }))}
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked as boolean }))}
            />
            <Label htmlFor="is_default" className={isRTL ? 'text-right' : 'text-left'}>
              {t('setAsDefault')}
            </Label>
          </div>

          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? t('loading') : t('updateAddress')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAddressDialog;
