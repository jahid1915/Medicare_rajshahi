import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2, Mail, User, Download, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addAuditLog, getStoredState, saveStoredState } from '../../data/mockUserStore';

export default function AppointmentBookingModal({ doctor, onClose, onBookingSuccess }) {
  const state = getStoredState();
  const [step, setStep] = useState('slot'); // 'slot' | 'payment' | 'confirmed'
  const [selectedDay, setSelectedDay] = useState('today'); // 'today' | 'tomorrow'
  const [selectedSlot, setSelectedSlot] = useState(
    doctor?.availableToday && doctor?.slotsToday?.length > 0 
      ? doctor.slotsToday[0] 
      : doctor?.slotsTomorrow?.[0] || '07:00 PM'
  );
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(state.familyMembers[0]);
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // 'bkash' | 'nagad' | 'card'
  const [mobileNumber, setMobileNumber] = useState('01711223344');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  if (!doctor) return null;

  const handleConfirmPayment = () => {
    const txnId = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const appointmentDate = selectedDay === 'today' ? '2026-08-11' : '2026-08-12';

    const newAppointment = {
      id: `apt-${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialtyName,
      date: appointmentDate,
      time: selectedSlot,
      consultationType: 'HD Video Call',
      fee: doctor.fee,
      currency: doctor.currency,
      status: 'Confirmed',
      paymentTxnId: txnId,
      patientName: selectedFamilyMember.name,
      familyMemberId: selectedFamilyMember.id,
      doctorAvatar: doctor.avatar,
      hospital: doctor.hospital
    };

    // Save to stored state
    const currentState = getStoredState();
    currentState.appointments = [newAppointment, ...currentState.appointments];
    currentState.timeline = [
      {
        id: `tl-${Date.now()}`,
        date: appointmentDate,
        time: selectedSlot,
        type: 'DOCTOR_VISIT',
        title: `Appointment Booked with ${doctor.name}`,
        description: `Specialty: ${doctor.specialtyName}. Fee: ${doctor.currency}${doctor.fee}. Payment Txn: ${txnId}`,
        badgeColor: 'primary',
        familyMemberId: selectedFamilyMember.id
      },
      ...currentState.timeline
    ];

    saveStoredState(currentState);

    addAuditLog('BOOKING_ENGINE', 'APPOINTMENT_CONFIRMED', `Booked ${doctor.name} for ${selectedFamilyMember.name}. Txn: ${txnId}`);

    setBookingResult(newAppointment);
    setStep('confirmed');

    // Confetti effect
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    if (onBookingSuccess) onBookingSuccess(newAppointment);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-card-border">
          <div className="flex items-center gap-3">
            <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
            <div>
              <h3 className="text-base font-bold text-main">{doctor.name}</h3>
              <p className="text-xs text-primary font-semibold">{doctor.title} • {doctor.specialtyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-main text-xl font-bold px-2">&times;</button>
        </div>

        {/* STEP 1: SLOT & PATIENT SELECTOR */}
        {step === 'slot' && (
          <div className="my-5 space-y-5">
            {/* Patient Selector */}
            <div>
              <label className="text-xs font-bold text-main block mb-2">Select Patient Profile:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {state.familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedFamilyMember(member)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedFamilyMember.id === member.id
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-card-border bg-card-bg hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-[10px] opacity-75">{member.relation} ({member.age} yrs)</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-xs font-bold text-main block mb-2">Select Date:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDay('today');
                    if (doctor.slotsToday?.length > 0) setSelectedSlot(doctor.slotsToday[0]);
                  }}
                  disabled={!doctor.availableToday || doctor.slotsToday?.length === 0}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selectedDay === 'today'
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-card-border bg-card-bg'
                  } disabled:opacity-40`}
                >
                  🟢 Today (Aug 11)
                  <span className="block text-[10px] opacity-75 font-normal mt-0.5">
                    {doctor.availableToday ? `${doctor.slotsToday?.length} slots open` : 'Fully Booked'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDay('tomorrow');
                    if (doctor.slotsTomorrow?.length > 0) setSelectedSlot(doctor.slotsTomorrow[0]);
                  }}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    selectedDay === 'tomorrow'
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-card-border bg-card-bg'
                  }`}
                >
                  📅 Tomorrow (Aug 12)
                  <span className="block text-[10px] opacity-75 font-normal mt-0.5">
                    {doctor.slotsTomorrow?.length} slots open
                  </span>
                </button>
              </div>
            </div>

            {/* Slots List */}
            <div>
              <label className="text-xs font-bold text-main block mb-2">Available Time Slots:</label>
              <div className="flex flex-wrap gap-2">
                {(selectedDay === 'today' ? doctor.slotsToday : doctor.slotsTomorrow)?.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all ${
                      selectedSlot === slot
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-card-border bg-card-bg text-main hover:border-primary'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee summary */}
            <div className="p-3 rounded-xl bg-card-bg border border-card-border flex items-center justify-between text-xs">
              <span className="text-muted">Consultation Fee:</span>
              <span className="text-base font-extrabold text-primary">{doctor.currency}{doctor.fee}</span>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button onClick={onClose} className="btn btn-secondary text-xs">Cancel</button>
              <button onClick={() => setStep('payment')} className="btn btn-primary text-xs py-2 px-6">
                Proceed to Payment & Confirm
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT GATEWAY */}
        {step === 'payment' && (
          <div className="my-5 space-y-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted block">Booking Summary:</span>
                <span className="font-bold text-main">{doctor.name} • {selectedDay === 'today' ? 'Today' : 'Tomorrow'} at {selectedSlot}</span>
              </div>
              <span className="text-lg font-bold text-primary">{doctor.currency}{doctor.fee}</span>
            </div>

            <label className="text-xs font-bold text-main block">Select Test Payment Gateway (Sandbox):</label>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('bkash')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-card-border bg-card-bg'
                }`}
              >
                💖 bKash
              </button>
              <button
                onClick={() => setPaymentMethod('nagad')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-card-border bg-card-bg'
                }`}
              >
                🧡 Nagad
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-card-border bg-card-bg'
                }`}
              >
                💳 Debit / Credit Card
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted block font-medium">Account / Mobile Number:</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-card-bg text-main border border-card-border rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Compliant sandbox payment mode active. Instant receipt generated.</span>
            </div>

            <div className="pt-2 flex justify-between">
              <button onClick={() => setStep('slot')} className="btn btn-secondary text-xs">Back</button>
              <button onClick={handleConfirmPayment} className="btn btn-primary text-xs py-2 px-6">
                Confirm & Pay {doctor.currency}{doctor.fee}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMED RECEIPT & EMAIL NOTIFICATION */}
        {step === 'confirmed' && bookingResult && (
          <div className="my-5 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-main">Appointment Confirmed!</h3>
              <p className="text-xs text-muted">A confirmation email & calendar invitation have been sent.</p>
            </div>

            <div className="p-4 rounded-xl bg-card-bg border border-card-border text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-muted">Doctor:</span>
                <span className="font-bold text-main">{bookingResult.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Specialty:</span>
                <span className="font-semibold text-primary">{bookingResult.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Date & Time:</span>
                <span className="font-bold text-main">{bookingResult.date} at {bookingResult.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Patient:</span>
                <span className="font-semibold text-main">{bookingResult.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Transaction ID:</span>
                <span className="font-mono text-emerald-500 font-bold">{bookingResult.paymentTxnId}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowEmailPreview(true)}
                className="btn btn-secondary text-xs flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4 text-primary" /> View Confirmation Email
              </button>

              <button
                onClick={onClose}
                className="btn btn-primary text-xs py-2 px-6"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* EMAIL PREVIEW MODAL */}
        {showEmailPreview && (
          <div className="modal-overlay">
            <div className="modal-content max-w-lg">
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <h4 className="text-sm font-bold text-main flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Automated Email Receipt Preview
                </h4>
                <button onClick={() => setShowEmailPreview(false)} className="text-muted font-bold text-lg">&times;</button>
              </div>

              <div className="my-4 p-4 rounded-xl bg-card-bg border border-card-border text-xs space-y-3 font-sans">
                <div className="border-b border-card-border pb-2">
                  <div><strong>From:</strong> appointments@medibridge.ai</div>
                  <div><strong>To:</strong> tanvir.hossain@example.com</div>
                  <div><strong>Subject:</strong> Confirmed: Tele-Consultation with {bookingResult?.doctorName}</div>
                </div>

                <p>Dear {bookingResult?.patientName},</p>
                <p>Your video consultation has been successfully booked and paid.</p>
                
                <div className="p-3 rounded bg-primary/10 border border-primary/20 space-y-1">
                  <div><strong>Doctor:</strong> {bookingResult?.doctorName} ({bookingResult?.specialty})</div>
                  <div><strong>Date & Time:</strong> {bookingResult?.date} @ {bookingResult?.time}</div>
                  <div><strong>Consultation Link:</strong> <span className="text-secondary font-mono underline">https://medibridge.ai/room/{bookingResult?.id}</span></div>
                </div>

                <div className="text-[11px] text-muted">
                  🔔 Automated Reminders Scheduled: 24 Hours, 1 Hour, and 10 Minutes before consultation time.
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setShowEmailPreview(false)} className="btn btn-primary text-xs">
                  Close Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
