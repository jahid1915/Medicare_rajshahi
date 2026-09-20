import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, ShieldCheck, Search, Plus, Minus, Trash2, MapPin, Clock } from 'lucide-react';
import { PHARMACIES } from '../../data/pharmacies';
import { getStoredState, saveStoredState, addAuditLog } from '../../data/mockUserStore';
import PharmacyMap from './PharmacyMap';

export default function PharmacyStore() {
  const state = getStoredState();
  const activeRx = state.prescriptions?.[0]; // Latest prescription
  const [selectedPharmacy, setSelectedPharmacy] = useState(PHARMACIES[0]);
  const [cart, setCart] = useState([
    { name: 'Napa Extra (Paracetamol 500mg + Caffeine 65mg)', price: 30, quantity: 2, unit: 'strip of 10' },
    { name: 'Sumatriptan 50mg (Migraine Relief)', price: 180, quantity: 1, unit: 'pack of 4' }
  ]);
  const [activeOrderTracker, setActiveOrderTracker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const availableItems = selectedPharmacy.inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = selectedPharmacy.deliveryFee;
  const total = subtotal + deliveryFee;

  const handleAddToCart = (item) => {
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
      setCart(cart.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { name: item.name, price: item.price, quantity: 1, unit: item.unit }]);
    }
  };

  const handleUpdateQty = (name, delta) => {
    setCart(cart.map(c => {
      if (c.name === name) {
        const newQ = c.quantity + delta;
        return newQ > 0 ? { ...c, quantity: newQ } : null;
      }
      return c;
    }).filter(Boolean));
  };

  const handleCheckout = () => {
    const orderId = `ord-${Date.now()}`;
    const newOrder = {
      id: orderId,
      pharmacyName: selectedPharmacy.name,
      date: new Date().toLocaleDateString(),
      items: cart.map(c => `${c.name} (${c.quantity} ${c.unit})`),
      totalAmount: total,
      currency: selectedPharmacy.currency,
      status: 'Preparing Order',
      deliveryEta: `${selectedPharmacy.deliveryEtaMins} Mins`,
      deliveryAddress: 'House 14, Road 5, Dhanmondi, Dhaka'
    };

    const currentState = getStoredState();
    currentState.pharmacyOrders = [newOrder, ...currentState.pharmacyOrders];
    currentState.timeline = [
      {
        id: `tl-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'PHARMACY_ORDER',
        title: `Medicine Order #${orderId} Placed`,
        description: `Pharmacy: ${selectedPharmacy.name}. Items: ${cart.length}. Total: ${selectedPharmacy.currency}${total}`,
        badgeColor: 'info',
        familyMemberId: 'user-me'
      },
      ...currentState.timeline
    ];

    saveStoredState(currentState);
    addAuditLog('PHARMACY_CHECKOUT', 'ORDER_PLACED', `Order #${orderId} submitted to ${selectedPharmacy.name}`);

    setActiveOrderTracker(newOrder);
    setCart([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Live Map Header Component */}
      <PharmacyMap onSelectPharmacyForOrder={(pharm) => setSelectedPharmacy(pharm)} />

      {/* Main Pharmacy Store Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Catalog & Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Prescription Import Banner */}
          {activeRx && (
            <div className="glass-card p-4 border border-teal-500/40 bg-teal-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Auto-Imported Active Prescription (#{activeRx.id})
                </div>
                <span className="text-[10px] text-muted font-medium">Issued by {activeRx.doctorName} • {activeRx.date}</span>
              </div>

              <div className="text-xs space-y-1">
                <span className="font-semibold text-main">Diagnosis: {activeRx.diagnosis}</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeRx.medicines.map((m, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-teal-500/15 text-teal-600 dark:text-teal-300 font-medium text-[11px]">
                      💊 {m.name} ({m.dosage})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search OTC Medicines */}
          <div className="glass-card p-5 border border-card-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-main flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Available Medicine Inventory ({selectedPharmacy.name.split('-')[0]})
              </h3>
              <span className="text-xs text-emerald-500 font-semibold">🟢 In Stock & Ready for Dispatch</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prescription medicines or OTC items..."
                className="w-full bg-card-bg text-main border border-card-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-card-bg border border-card-border flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-main">{item.name}</div>
                    <div className="text-[11px] text-muted">{item.unit} • Stock: {item.stockCount}</div>
                    <div className="font-extrabold text-primary text-sm mt-0.5">{selectedPharmacy.currency}{item.price}</div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn btn-outline-primary py-1.5 px-3 text-xs shrink-0"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Cart Checkout & Tracker */}
        <div className="space-y-6">
          {/* Order Tracker popup if active */}
          {activeOrderTracker && (
            <div className="glass-card p-5 border border-emerald-500/40 bg-emerald-500/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 animate-bounce" /> Live Delivery Tracker
                </span>
                <span>{activeOrderTracker.deliveryEta}</span>
              </div>

              <div className="p-3 rounded-xl bg-card-bg border border-card-border text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Order ID:</span>
                  <span className="font-mono text-main font-bold">{activeOrderTracker.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pharmacy:</span>
                  <span className="font-semibold text-main">{activeOrderTracker.pharmacyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Paid:</span>
                  <span className="font-bold text-primary">{activeOrderTracker.currency}{activeOrderTracker.totalAmount}</span>
                </div>
              </div>

              <div className="w-full bg-card-bg h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-2/3 animate-pulse"></div>
              </div>
              <p className="text-[11px] text-center text-muted font-medium">Pharmacist verified prescription. Delivery rider assigned.</p>
            </div>
          )}

          {/* Cart Card */}
          <div className="glass-card p-5 border border-card-border space-y-4">
            <h3 className="font-bold text-base text-main flex items-center justify-between">
              <span>Your Medicine Cart ({cart.length})</span>
              <span className="text-xs text-primary font-bold">{selectedPharmacy.currency}{subtotal}</span>
            </h3>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                Your cart is currently empty. Add prescribed medicines from above.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-card-bg border border-card-border text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-main">{item.name}</div>
                      <div className="text-[11px] text-muted">{selectedPharmacy.currency}{item.price} / {item.unit}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateQty(item.name, -1)} className="p-1 rounded bg-card-bg border border-card-border text-muted hover:text-main">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-main w-4 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.name, 1)} className="p-1 rounded bg-card-bg border border-card-border text-muted hover:text-main">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pricing summary */}
                <div className="pt-3 border-t border-card-border space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Medicines Subtotal:</span>
                    <span>{selectedPharmacy.currency}{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Express Delivery Fee ({selectedPharmacy.name.split('-')[0]}):</span>
                    <span>{selectedPharmacy.currency}{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-main pt-2 border-t border-card-border">
                    <span>Total Amount:</span>
                    <span className="text-primary">{selectedPharmacy.currency}{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" /> Place Order & Pay {selectedPharmacy.currency}{total}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
