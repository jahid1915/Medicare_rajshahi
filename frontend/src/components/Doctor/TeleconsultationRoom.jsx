import React, { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, FileText, Plus, Trash2, CheckCircle2, ShieldCheck, Send } from 'lucide-react';
import { addAuditLog, getStoredState, saveStoredState } from '../../data/mockUserStore';

export default function TeleconsultationRoom({ appointment, onCloseRoom }) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState('call'); // 'call' | 'prescription' | 'chat'
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', text: 'Hello! I am reviewing your AI handover summary. How are you feeling right now?', time: '07:30 PM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Prescription Form State (Doctor side)
  const [diagnosis, setDiagnosis] = useState('Tension-type Headache & Upper Spine Muscle Fatigue');
  const [medicines, setMedicines] = useState([
    { name: 'Napa Extra 500mg', dosage: '1 tab after food', frequency: 'TID (3 times/day)', duration: '5 days' },
    { name: 'Sumatriptan 50mg', dosage: '1 tab at onset of acute migraine', frequency: 'PRN', duration: '4 tablets' }
  ]);
  const [advice, setAdvice] = useState('Rest in a dark quiet room during acute onset. Drink 2.5L water daily. Limit continuous laptop screen time to 45 mins.');
  const [rxIssued, setRxIssued] = useState(false);

  const handleAddMedicine = () => {
    setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleIssuePrescription = () => {
    const rxId = `rx-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentState = getStoredState();

    const newRx = {
      id: rxId,
      doctorId: appointment?.doctorId || 'doc-1',
      doctorName: appointment?.doctorName || 'Dr. Sarah Jenkins',
      date: new Date().toISOString().split('T')[0],
      patientName: appointment?.patientName || 'Tanvir Hossain',
      diagnosis,
      medicines: medicines.filter(m => m.name.trim()),
      advice,
      nextFollowUp: '14 Days'
    };

    currentState.prescriptions = [newRx, ...currentState.prescriptions];
    currentState.timeline = [
      {
        id: `tl-${Date.now()}`,
        date: newRx.date,
        time: '07:45 PM',
        type: 'DOCTOR_VISIT',
        title: `Digital Prescription #${rxId} Issued by ${newRx.doctorName}`,
        description: `Diagnosis: ${diagnosis}. Prescribed ${newRx.medicines.length} medicines. Auto-imported to Medicine Corner.`,
        badgeColor: 'success',
        familyMemberId: appointment?.familyMemberId || 'user-me'
      },
      ...currentState.timeline
    ];

    saveStoredState(currentState);
    addAuditLog(newRx.doctorName, 'ISSUED_DIGITAL_PRESCRIPTION', `Rx #${rxId} generated for ${newRx.patientName}`);

    setRxIssued(true);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'patient', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col font-sans text-slate-100">
      {/* Header Bar */}
      <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="live-pulse bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full">
            <span className="live-pulse-dot"></span> Live Teleconsultation
          </span>
          <div>
            <h3 className="font-bold text-sm text-slate-100">{appointment?.doctorName || 'Dr. Sarah Jenkins'}</h3>
            <p className="text-xs text-slate-400">{appointment?.specialty || 'Neurology'} • Patient: {appointment?.patientName || 'Tanvir Hossain'}</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('call')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'call' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📹 Video Stream
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'prescription' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Doctor Prescription Pad
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'chat' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
          >
            💬 Call Chat ({chatMessages.length})
          </button>
        </div>

        <button onClick={onCloseRoom} className="btn btn-danger text-xs py-1.5 px-4 flex items-center gap-1.5">
          <PhoneOff className="w-3.5 h-3.5" /> End Consultation
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* VIDEO STREAM VIEW */}
        {activeTab === 'call' && (
          <div className="flex-1 relative bg-slate-900 flex items-center justify-center p-6">
            {/* Doctor Main Screen */}
            <div className="w-full max-w-4xl aspect-video rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative shadow-2xl flex items-center justify-center">
              {isVideoOn ? (
                <img
                  src={appointment?.doctorAvatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80"}
                  alt="Doctor Stream"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400 space-y-2">
                  <VideoOff className="w-12 h-12 mx-auto" />
                  <p className="text-sm font-semibold">Doctor Camera Paused</p>
                </div>
              )}

              {/* Overlay Badge */}
              <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                HD 1080p Encrypted Stream
              </div>

              {/* Patient PIP Overlay */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-xl bg-slate-950 border-2 border-primary overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Patient PIP"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-2 text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300 font-bold">You</span>
              </div>
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 flex items-center gap-4 shadow-2xl">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-all ${isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-all ${isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'}`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setActiveTab('prescription')}
                className="btn btn-primary text-xs py-2 px-4 rounded-full flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Issue Prescription
              </button>

              <button
                onClick={onCloseRoom}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* DOCTOR PRESCRIPTION PAD */}
        {activeTab === 'prescription' && (
          <div className="flex-1 bg-slate-900 overflow-y-auto p-6 flex justify-center">
            <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl text-xs">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-teal-400 uppercase tracking-wide">MediBridge Digital Prescription</h3>
                  <p className="text-slate-400 text-xs">Doctor Portal • Teleconsultation Workspace</p>
                </div>
                <div className="text-right text-slate-400">
                  <div><strong>Doctor:</strong> {appointment?.doctorName || 'Dr. Sarah Jenkins'}</div>
                  <div><strong>Specialty:</strong> {appointment?.specialty || 'Neurology'}</div>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {rxIssued ? (
                <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-100">Digital Prescription Successfully Issued!</h4>
                  <p className="text-xs text-slate-300">The prescription has been added to the patient's timeline and Medicine Corner for instant ordering.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Patient & Diagnosis */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Clinical Diagnosis:</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>

                  {/* Medicines table */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-slate-300">Prescribed Rx Medicines:</label>
                      <button onClick={handleAddMedicine} className="text-teal-400 text-xs flex items-center gap-1 font-semibold hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Add Medicine
                      </button>
                    </div>

                    <div className="space-y-2">
                      {medicines.map((med, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 items-center">
                          <input
                            type="text"
                            placeholder="Medicine Name"
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].name = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-4 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1 tab after food)"
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].dosage = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-3 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Frequency (TID / PRN)"
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].frequency = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-2 py-1 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Duration (5 days)"
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[index].duration = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-2 py-1 text-xs"
                          />
                          <button onClick={() => handleRemoveMedicine(index)} className="col-span-1 text-red-400 hover:text-red-300 text-center">
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor advice */}
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Doctor Advice & Lifestyle Instructions:</label>
                    <textarea
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Digital Sign Verified by BMDC License #89421
                    </span>
                    <button onClick={handleIssuePrescription} className="btn btn-primary text-xs py-2 px-6">
                      Sign & Issue Prescription
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALL CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 bg-slate-900 p-6 flex justify-center">
            <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-800 font-bold text-xs text-slate-300">
                In-Call Consultation Chat
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-xl text-xs max-w-xs ${m.sender === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{m.time}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type a message to doctor..."
                  className="flex-1 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
                <button onClick={handleSendChat} className="btn btn-primary text-xs py-2 px-4">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
