import React, { useState } from 'react';
import { Activity, Home, MapPin, Search, Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import { DIAGNOSTICS } from '../../data/diagnostics';
import { getStoredState, saveStoredState, addAuditLog } from '../../data/mockUserStore';

export default function DiagnosticCenterView() {
  const [selectedCenter, setSelectedCenter] = useState(DIAGNOSTICS[0]);
  const [isHomeCollection, setIsHomeCollection] = useState(true);
  const [selectedTests, setSelectedTests] = useState([DIAGNOSTICS[0].tests[0]]); // CBC default
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  const handleToggleTest = (test) => {
    const exists = selectedTests.find(t => t.id === test.id);
    if (exists) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const testsSubtotal = selectedTests.reduce((acc, t) => acc + t.price, 0);
  const collectionFee = isHomeCollection ? selectedCenter.homeCollectionFee : 0;
  const total = testsSubtotal + collectionFee;

  const handleBookDiagnostic = () => {
    const bookingId = `diag-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      centerName: selectedCenter.name,
      tests: selectedTests.map(t => t.name),
      isHomeCollection,
      totalAmount: total,
      date: '2026-08-12',
      status: 'Confirmed'
    };

    const currentState = getStoredState();
    currentState.timeline = [
      {
        id: `tl-${Date.now()}`,
        date: '2026-08-12',
        time: '08:00 AM',
        type: 'LAB_REPORT',
        title: `Diagnostic Test Booked: ${selectedCenter.name}`,
        description: `Tests: ${selectedTests.map(t => t.name).join(', ')}. Mode: ${isHomeCollection ? 'Home Collection' : 'Lab Visit'}. Fee: ৳${total}`,
        badgeColor: 'success',
        familyMemberId: 'user-me'
      },
      ...currentState.timeline
    ];

    saveStoredState(currentState);
    addAuditLog('DIAGNOSTIC_BOOKING', 'LAB_TEST_BOOKED', `Booked ${selectedTests.length} tests at ${selectedCenter.name}`);

    setBookingConfirmed(newBooking);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 border border-card-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-main flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Diagnostic Test & Home Sample Collection Hub
            </h2>
            <p className="text-xs text-muted">Book verified lab tests, CBC, Pathology, Imaging & receive digital reports directly.</p>
          </div>

          <span className="live-pulse bg-emerald-500/10 text-emerald-500 text-xs">
            <Home className="w-3.5 h-3.5" /> Home Sample Collection Available
          </span>
        </div>

        {/* Diagnostic Centers Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-1 text-xs">
          {DIAGNOSTICS.map(center => (
            <button
              key={center.id}
              onClick={() => {
                setSelectedCenter(center);
                setSelectedTests([center.tests[0]]);
              }}
              className={`p-3 rounded-xl border text-left font-semibold shrink-0 transition-all ${
                selectedCenter.id === center.id ? 'border-primary bg-primary/10 text-primary' : 'border-card-border bg-card-bg text-muted'
              }`}
            >
              <div className="font-bold text-main text-xs">{center.name}</div>
              <div className="text-[10px] opacity-75">{center.distanceKm} km away • {center.openStatus}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Test Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 border border-card-border space-y-4">
            <h3 className="font-bold text-base text-main">Select Pathology & Lab Tests ({selectedCenter.name}):</h3>

            <div className="space-y-3">
              {selectedCenter.tests.map(test => {
                const isSelected = selectedTests.some(t => t.id === test.id);
                return (
                  <div
                    key={test.id}
                    onClick={() => handleToggleTest(test)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected ? 'border-primary bg-primary/10 text-main font-semibold' : 'border-card-border bg-card-bg hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-main flex items-center gap-2">
                        {test.name}
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-card-bg border border-card-border text-muted">
                          {test.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        Sample Type: {test.sample} • Digital Report Turnaround: {test.turnaround}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-primary">৳{test.price}</span>
                      <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-primary' : 'text-muted'}`}>
                        {isSelected ? '✓ Selected' : '+ Select'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Checkout Card */}
        <div className="space-y-6">
          <div className="glass-card p-5 border border-card-border space-y-4 text-xs">
            <h3 className="font-bold text-base text-main">Booking Summary</h3>

            {bookingConfirmed ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-main">Lab Test Booked!</h4>
                <p className="text-[11px] text-muted">A phlebotomist will arrive for home collection tomorrow morning.</p>
              </div>
            ) : (
              <>
                {/* Home collection toggle */}
                <div className="p-3 rounded-xl bg-card-bg border border-card-border space-y-2">
                  <span className="font-bold text-main block">Sample Collection Mode:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsHomeCollection(true)}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold border transition-all ${
                        isHomeCollection ? 'border-primary bg-primary text-white' : 'border-card-border bg-card-bg'
                      }`}
                    >
                      🏡 Home Collection
                    </button>

                    <button
                      onClick={() => setIsHomeCollection(false)}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold border transition-all ${
                        !isHomeCollection ? 'border-primary bg-primary text-white' : 'border-card-border bg-card-bg'
                      }`}
                    >
                      🏥 Lab Visit
                    </button>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="space-y-1.5 pt-2 border-t border-card-border">
                  <div className="flex justify-between text-muted">
                    <span>Tests Subtotal ({selectedTests.length}):</span>
                    <span>৳{testsSubtotal}</span>
                  </div>
                  {isHomeCollection && (
                    <div className="flex justify-between text-muted">
                      <span>Home Sample Collection Fee:</span>
                      <span>৳{collectionFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-main pt-2 border-t border-card-border">
                    <span>Total Amount:</span>
                    <span className="text-primary">৳{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleBookDiagnostic}
                  disabled={selectedTests.length === 0}
                  className="w-full btn btn-primary text-xs py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" /> Book Lab Test & Pay ৳{total}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
