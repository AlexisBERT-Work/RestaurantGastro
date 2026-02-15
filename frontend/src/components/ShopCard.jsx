import { useState } from 'react';

function formatExpiration(lots) {
  if (!lots || lots.length === 0) return null;
  const now = new Date();
  const soonest = lots
    .filter(l => new Date(l.expiresAt) > now)
    .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt))[0];
  if (!soonest) return null;

  const remaining = new Date(soonest.expiresAt) - now;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h${minutes}m`;
  return `${minutes}m`;
}

export default function ShopCard({ ingredient, treasury, onPurchase }) {
  const [quantity, setQuantity] = useState(1);

  const totalCost = ingredient.cost * quantity;
  const expiration = formatExpiration(ingredient.lots);

  const handleBuy = () => {
    onPurchase(ingredient, quantity);
    setQuantity(1);
  };

  return (
    <div className="shop-card">
      <div className="shop-card-header">
        <span className="shop-item-name">{ingredient.name}</span>
        <span className="shop-item-category">{ingredient.category}</span>
      </div>
      <div className="shop-card-body">
        <div className="shop-info">
          <span className="shop-cost">{ingredient.cost}G</span>
          <span className="shop-stock">Stock: {ingredient.quantity}</span>
        </div>
        {ingredient.lots && ingredient.lots.length > 0 && (
          <div className="shop-dlc">
            <span className="dlc-label">DLC</span>
            <span className={`dlc-value ${expiration && parseInt(expiration) < 1 ? 'expiring-soon' : ''}`}>
              {expiration || 'Expire'}
            </span>
            <span className="dlc-lots">{ingredient.lots.length} lot(s)</span>
          </div>
        )}
        <div className="shop-shelf-life">
          Conservation: {ingredient.shelfLife || 3}h
        </div>
        <div className="shop-actions">
          <input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="qty-input"
          />
          <button
            onClick={handleBuy}
            className="btn-buy"
            disabled={treasury !== null && treasury < totalCost}
          >
            Acheter
          </button>
        </div>
      </div>
    </div>
  );
}
