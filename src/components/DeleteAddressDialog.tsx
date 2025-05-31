import React, { useState } from 'react';
import { useLanguage } from '@/utils/languageContextUtils';
import { useAddresses } from '@/hooks/useAddresses';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteAddressDialogProps {
  addressId: string;
  addressName: string;
  trigger?: React.ReactNode;
}

const DeleteAddressDialog: React.FC<DeleteAddressDialogProps> = ({
  addressId,
  addressName,
  trigger
}) => {
  const { t, isRTL } = useLanguage();
  const { deleteAddress, isDeleting } = useAddresses();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteAddress(addressId);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <AlertDialogTitle className={isRTL ? 'text-right' : 'text-left'}>
            {t('deleteAddress')}
          </AlertDialogTitle>
          <AlertDialogDescription className={isRTL ? 'text-right' : 'text-left'}>
            {t('confirmDeleteAddress')} "{addressName}"? {t('actionCannotBeUndone')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAddressDialog;
