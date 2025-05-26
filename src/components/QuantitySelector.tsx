
import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  min?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  max = 999,
  min = 1,
}) => {
  const { isRTL } = useLanguage();
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Sync input value when quantity prop changes
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onQuantityChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString());
      onQuantityChange(min);
    } else if (numValue > max) {
      setInputValue(max.toString());
      onQuantityChange(max);
    }
  };

  const increment = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setInputValue(newQuantity.toString());
      onQuantityChange(newQuantity);
    }
  };

  const decrement = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1;
      setInputValue(newQuantity.toString());
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8"
        onClick={decrement}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={`w-16 text-center ${isRTL ? 'text-right' : 'text-left'}`}
        min={min}
        max={max}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
      
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8"
        onClick={increment}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantitySelector;
