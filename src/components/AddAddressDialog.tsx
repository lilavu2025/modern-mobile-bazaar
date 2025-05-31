import React, { useState } from 'react';
import { useLanguage } from '@/utils/languageContextUtils';
import { useAddresses } from '@/hooks/useAddresses';
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
import { Plus } from 'lucide-react';

interface AddAddressDialogProps {
  trigger?: React.ReactNode;
}

const AddAddressDialog: React.FC<AddAddressDialogProps> = ({ trigger }) => {
  const { t, isRTL } = useLanguage();
  const { createAddress, isCreating } = useAddresses();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    area: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    is_default: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAddress(formData);
    setFormData({
      full_name: '',
      phone: '',
      city: '',
      area: '',
      street: '',
      building: '',
      floor: '',
      apartment: '',
      is_default: false,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addAddress')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`max-w-md ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('addNewAddress')}</DialogTitle>
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t('loading') : t('addAddress')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddressDialog;
