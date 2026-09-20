import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Send, MessageSquare, Volume2, 
  Sparkles, ShieldCheck, ArrowRight, User, Zap, Radio, VolumeX
} from 'lucide-react';
import { SPECIALTIES, classifyHealthInput } from '../../data/specialties';
import TriageSafetyBanner from './TriageSafetyBanner';
import AIHandoverModal from './AIHandoverModal';
import { addAuditLog } from '../../data/mockUserStore';

export default function AIVoiceChatContainer({ onNavigateToDoctor, userProfile }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTIES[0]);
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1, sender: 'ai',
      text: `Hello ${userProfile?.name || 'there'}! I'm your MediBridge AI Navigator. Describe any symptoms or health concern — I'll guide you to the right specialist or provide safe entry-level information.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      specialtyName: 'Front-Door Healthcare Navigator'
    }
  ]);
  const [handoverData, setHandoverData] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setInputText(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0; u.pitch = 1.0;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  const stopSpeaking = () => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); } };

  const toggleListening = () => {
    if (isSpeaking) stopSpeaking();
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { setInputText(''); recognitionRef.current?.start(); setIsListening(true); }
  };

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;
    stopSpeaking();
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const classification = classifyHealthInput(textToSend);
    let targetSpecialty = selectedSpecialty;
    if (isAutoDetect) { targetSpecialty = classification.specialty; setSelectedSpecialty(targetSpecialty); }
    addAuditLog(userProfile?.name || 'Patient', 'AI_CHAT_MESSAGE', `Query processed for specialty: ${targetSpecialty.name}`);

    setTimeout(() => {
      if (classification.isHighRisk) {
        const aiText = `⚠️ I've identified potential warning signs (${classification.detectedRedFlags.join(', ')}). For your safety, I'm escalating to a licensed ${targetSpecialty.suggestedSpecialist}. Preparing your clinical handover summary now.`;
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isEscalated: true, specialtyName: targetSpecialty.name }]);
        speakText(aiText);
        setHandoverData({ patientConcern: textToSend, symptoms: classification.detectedRedFlags, detectedRedFlags: classification.detectedRedFlags, reasonForEscalation: `Red flag warning signs detected (${classification.detectedRedFlags.join(', ')}).`, specialty: targetSpecialty, aiSummary: `Patient presented with: "${textToSend}". Safety warnings triggered.` });
      } else {
        const guidance = targetSpecialty.lowRiskAdvice;
        const responseText = `Based on your symptoms, here's validated guidance for ${targetSpecialty.name}:\n\n${guidance}\n\nWould you like to consult a verified ${targetSpecialty.suggestedSpecialist}?`;
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), specialtyName: targetSpecialty.name, canEscalate: true }]);
        speakText(responseText);
      }
    }, 600);
  };

  const handleQuickPrompt = (t) => { setInputText(t); handleSendMessage(t); };

  const quickPrompts = [
    { emoji: '🧠', text: 'Mild throbbing headache for 2 days', danger: false },
    { emoji: '🦴', text: 'Right knee hurts after playing sports', danger: false },
    { emoji: '🚨', text: 'Sudden crushing chest pain radiating to arm', danger: true },
  ];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <TriageSafetyBanner onTriggerEmergency={() => handleQuickPrompt("I am having sudden crushing chest pain and shortness of breath")} />

      {/* ─── MAIN AI CARD ─── */}
      <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '520px', maxHeight: '600px' }}>

        {/* Header Strip */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          background: 'rgba(10, 83, 148, 0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--primary-glow)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800 }}>AI Health Navigator</h3>
                <span className="live-pulse" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                  <span className="live-pulse-dot" /> Online
                </span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Powered by Specialty Medical RAG Knowledge Base</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
            <ShieldCheck style={{ width: 14, height: 14, color: 'var(--success)' }} />
            BMDC Standard Compliant
          </div>
        </div>

        {/* Specialty Selector & Warning Info Bar */}
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          fontSize: '0.75rem',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap style={{ width: 14, height: 14, color: 'var(--primary)' }} />
            <select
              value={isAutoDetect ? 'auto' : selectedSpecialty.id}
              onChange={(e) => {
                if (e.target.value === 'auto') { setIsAutoDetect(true); }
                else { setIsAutoDetect(false); const s = SPECIALTIES.find(s => s.id === e.target.value); if (s) setSelectedSpecialty(s); }
              }}
              className="input"
              style={{ padding: '4px 10px', fontSize: '0.6875rem', fontWeight: 650, width: 'auto', border: '1px solid var(--border-default)' }}
            >
              <option value="auto">✨ Auto-Detect from Symptoms</option>
              {SPECIALTIES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          {/* Quick Voice Stop */}
          {isSpeaking && (
            <button onClick={stopSpeaking} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.625rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <VolumeX style={{ width: 12, height: 12 }} /> Stop Voice
            </button>
          )}
        </div>

        {/* ─── SCROLLABLE CHAT FEED ─── */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '16px',
          background: 'var(--bg-dashboard)',
        }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              animation: 'fadeIn 250ms ease both',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                background: msg.sender === 'user' ? 'rgba(10, 83, 148, 0.15)' : msg.isEscalated ? 'rgba(245,158,11,0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: msg.sender === 'user' ? 'var(--primary)' : msg.isEscalated ? 'var(--warning)' : 'var(--success)',
              }}>
                {msg.sender === 'user' ? <User style={{ width: 16, height: 16 }} /> : <Sparkles style={{ width: 16, height: 16 }} />}
              </div>

              <div style={{ maxWidth: '75%', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: 4, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>
                    {msg.sender === 'user' ? (userProfile?.name || 'You') : (msg.specialtyName || 'AI Triage')}
                  </strong>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div style={{
                  padding: '12px 16px', fontSize: '0.8125rem', lineHeight: 1.5,
                  borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-surface)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-default)',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'pre-line',
                }}>
                  {msg.text}
                </div>

                {msg.canEscalate && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button 
                      onClick={() => setHandoverData({
                        patientConcern: messages[messages.length - 2]?.text || 'Health Concern',
                        specialty: selectedSpecialty,
                        reasonForEscalation: 'Patient requested specialist consultation.'
                      })} 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.6875rem', padding: '6px 12px', borderRadius: '20px' }}
                    >
                      Connect to {selectedSpecialty.name} Doctor <ArrowRight style={{ width: 12, height: 12, marginLeft: 4 }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Soundwave rendering when active */}
          {(isListening || isSpeaking) && (
            <div style={{ display: 'flex', justifyContent: isListening ? 'flex-end' : 'flex-start', padding: '0 40px' }}>
              <div className="soundwave" style={{ background: 'var(--bg-surface)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginRight: '8px', fontWeight: 650 }}>
                  {isListening ? 'Dictating...' : 'AI Voice Synth...'}
                </span>
                {[...Array(5)].map((_, i) => <div key={i} className="soundwave-bar" />)}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* ─── BOTTOM CHAT INPUT BAR WITHdictate MIC ─── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Quick Chip Prompts Row */}
          {messages.length <= 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>Try scenario:</span>
              {quickPrompts.map((p, i) => (
                <button key={i} onClick={() => handleQuickPrompt(p.text)} className="btn btn-secondary" style={{
                  fontSize: '0.6875rem', borderRadius: '20px', padding: '5px 12px',
                  ...(p.danger ? { borderColor: 'rgba(239,68,68,0.3)', color: 'var(--danger)' } : {}),
                }}>
                  {p.emoji} "{p.text}"
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Input field */}
            <input 
              type="text" 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your symptoms or ask a health question..."
              className="input" 
              style={{ flex: 1, borderRadius: '12px', paddingLeft: '16px', background: 'var(--bg-input)' }}
            />

            {/* Dictate Micro toggle */}
            <button 
              onClick={toggleListening} 
              className="btn btn-secondary"
              style={{ 
                padding: '10px', 
                borderRadius: '12px', 
                background: isListening ? 'var(--danger)' : 'var(--bg-badge)', 
                color: isListening ? 'white' : 'var(--text-secondary)',
                border: '1.5px solid var(--border-default)' 
              }}
              title="Dictate with Voice"
            >
              {isListening ? <MicOff style={{ width: 16, height: 16 }} /> : <Mic style={{ width: 16, height: 16 }} />}
            </button>

            {/* Submit Send Button */}
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!inputText.trim()} 
              className="btn btn-primary"
              style={{ borderRadius: '12px', padding: '10px 16px', fontSize: '0.75rem', opacity: inputText.trim() ? 1 : 0.4 }}
            >
              <Send style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

      </div>

      {handoverData && (
        <AIHandoverModal handoverData={handoverData} onClose={() => setHandoverData(null)}
          onSelectDoctor={(specId) => onNavigateToDoctor && onNavigateToDoctor(specId)} />
      )}
    </div>
  );
}
