
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Category {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  icon: string;
  count: number;
}

interface ViewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
}

const ViewCategoryDialog: React.FC<ViewCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
}) => {
  const { t } = useLanguage();

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('viewCategory')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <img
              src={category.image}
              alt={category.name}
              className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
            />
            <div className="text-4xl mb-2">{category.icon}</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{t('categoryNames')}</h3>
            <div className="space-y-1">
              <p><strong>{t('arabic')}:</strong> {category.name}</p>
              <p><strong>{t('english')}:</strong> {category.nameEn}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{t('statistics')}</h3>
            <div className="flex items-center gap-2">
              <span>{t('productCount')}:</span>
              <Badge variant="secondary">{category.count}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCategoryDialog;
