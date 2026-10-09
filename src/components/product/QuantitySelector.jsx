import React from 'react';
import { Minus, Plus } from 'lucide-react';
import './QuantitySelector.css';

export function QuantitySelector({
  quantity = 1,
  onChange,
  max = 10,
  min = 1,
  disabled = false,
  size = 'md',
  increaseTestId,
  decreaseTestId,
}) {
  const handleDecrease = () => {
    if (quantity > min && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max && !disabled) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.max(min, Math.min(max, val));
      onChange(clamped);
    }
  };

  return (
    <div className={`quantity-selector size-${size} ${disabled ? 'disabled' : ''}`}>
      <button
        type="button"
        className="qty-btn"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        data-testid={decreaseTestId}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>

      <input
        type="number"
        className="qty-input"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Item quantity"
      />

      <button
        type="button"
        className="qty-btn"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        data-testid={increaseTestId}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default QuantitySelector;

