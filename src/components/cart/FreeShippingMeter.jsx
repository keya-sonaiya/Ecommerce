import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice.js';
import './FreeShippingMeter.css';

export function FreeShippingMeter({
  amountNeeded,
  progressPercentage,
  hasFreeShipping,
}) {
  return (
    <div className="shipping-meter" role="region" aria-label="Free shipping status">
      <div className="shipping-meter-header">
        {hasFreeShipping ? (
          <div className="shipping-meter-status unlocked">
            <CheckCircle2 size={18} className="status-icon" />
            <span>Complimentary standard shipping unlocked!</span>
          </div>
        ) : (
          <div className="shipping-meter-status pending">
            <Truck size={18} className="status-icon" />
            <span>
              Add <strong>{formatPrice(amountNeeded)}</strong> more to unlock complimentary shipping
            </span>
          </div>
        )}
      </div>

      <div
        className="shipping-meter-bar"
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className={`shipping-meter-fill ${hasFreeShipping ? 'is-complete' : ''}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default FreeShippingMeter;

