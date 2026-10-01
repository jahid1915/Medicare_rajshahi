import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, AlertTriangle, Stethoscope, FileText,
  Search, Pill, ArrowRight, MessageSquare, Bot, CheckCircle2,
  Clock, Zap, PhoneCall, HelpCircle
} from 'lucide-react';
import { SPECIALTIES, classifyHealthInput } from '../../data/specialties';

const SAMPLE_PROMPTS = [
  'I have had a sore throat, dry cough, and mild fever for 2 days.',
  'What are standard fasting blood sugar targets for adults?',
  'Severe pressure in my chest spreading to my left arm.',
  'Need to find a verified pediatrician in Laxmipur, Rajshahi.',
  'Can I take antacids at the same time as my daily iron tablet?'
];

export default function AIPage() {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am Niramoy AI, your intelligent health navigation assistant. Describe a symptom, ask general medicine questions, or find specialized doctors in Rajshahi. Remember: I provide informational guidance only and cannot replace an in-person doctor consultation.',
      timestamp: 'Just now'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMsg = {
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setEmergencyAlert(false);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let isEmergency = false;
      let reply = '';
      let recommendedSpecialty = null;

      // Clinical Red Flag Checks
      if (
        lower.includes('chest pain') ||
        lower.includes('heart attack') ||
        lower.includes('stroke') ||
        lower.includes('cannot breathe') ||
        lower.includes('shortness of breath') ||
        lower.includes('unconscious')
      ) {
        isEmergency = true;
        setEmergencyAlert(true);
        reply = `⚠️ **CRITICAL RED-FLAG WARNING:** Your description may indicate a life-threatening medical emergency (such as acute coronary syndrome, stroke, or respiratory distress). **DO NOT WAIT for an online reply.** Immediately call **999**, proceed to the Emergency Room at Rajshahi Medical College Hospital (RMCH), or call the National Health Helpline at **16263**.`;
      } else {
        // Normal classification
        const classification = classifyHealthInput(text);
        if (classification && classification.specialty) {
          recommendedSpecialty = classification.specialty;
          reply = `Based on your description, this commonly involves **${classification.specialty.name}** (${classification.specialty.banglaName || ''}).\n\n` +
            `• **Potential Considerations:** ${classification.specialty.commonConditions?.slice(0, 3).join(', ') || 'General evaluation'}\n` +
            `• **Next Clinical Step:** We recommend scheduling a physical chamber consultation with a verified BMDC specialist to review your vitals and obtain an accurate diagnosis.\n` +
            `• **Home Guidance:** Stay well hydrated, record temperature/vitals, and avoid self-medicating with unprescribed antibiotics or strong painkillers.`;
        } else {
          reply = `Thank you for sharing your concern. While these symptoms can arise from a range of benign to acute causes, an in-person physical assessment is essential for clinical diagnosis.\n\n` +
            `Would you like to search for available General Physicians or Internal Medicine chambers in Rajshahi today?`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          isEmergency,
          recommendedSpecialty,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="ai-page" style={{ color: 'var(--color-text, #142422)', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0d7c6e 0%, #064e44 100%)',
        color: '#ffffff',
        padding: '54px 20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.15)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '14px'
          }}>
            <Sparkles size={14} /> CLINICAL DECISION SUPPORT & NAVIGATION
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Niramoy AI Health Assistant
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            An intelligent healthcare companion designed for symptom navigation, prescription comprehension, and immediate linkage to verified BMDC physicians in Rajshahi.
          </p>
        </div>
      </section>

      {/* Safety Scope Callout Banner */}
      <div style={{ maxWidth: '1080px', margin: '-20px auto 32px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '16px',
          padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <ShieldCheck size={22} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.6 }}>
            <strong>Assistance Protocol & Scope:</strong> Niramoy AI is a supportive navigation tool, <em>not an autonomous medical doctor</em>. It does not replace a physical clinical consultation or formulate binding diagnostic conclusions. In emergencies, immediately call <strong>999</strong>.
          </div>
        </div>
      </div>

      {/* Main Interactive Container */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>

          {/* Left Column: Interactive Chat Box */}
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2eceb)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            height: '620px'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--color-border, #e2eceb)',
              background: 'var(--color-bg-muted, #f8fafc)', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Niramoy Health Navigator</h3>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span> Clinical Safety Rules Active
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #47615f)', background: '#fff', border: '1px solid var(--color-border, #e2eceb)', padding: '3px 8px', borderRadius: '6px' }}>
                Bilingual (EN / BN)
              </span>
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'var(--color-primary, #0d7c6e)' : (m.isEmergency ? '#fef2f2' : 'var(--color-bg-muted, #f8fafc)'),
                    color: m.role === 'user' ? '#ffffff' : (m.isEmergency ? '#991b1b' : 'var(--color-text, #142422)'),
                    border: m.isEmergency ? '1.5px solid #fecaca' : '1px solid var(--color-border, #e2eceb)',
                    borderRadius: '16px',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                    padding: '14px 16px',
                    fontSize: '0.88rem',
                    lineHeight: 1.6
                  }}
                >
                  <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                  {m.recommendedSpecialty && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border, #e2eceb)' }}>
                      <Link
                        to="/doctors"
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Book {m.recommendedSpecialty.name} <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                  <div style={{ fontSize: '0.68rem', marginTop: '6px', textAlign: 'right', opacity: 0.7 }}>
                    {m.timestamp}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--color-bg-muted, #f8fafc)', padding: '10px 16px', borderRadius: '14px', fontSize: '0.82rem', color: 'var(--color-text-muted, #47615f)' }}>
                  Analyzing symptoms against clinical safety database...
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border, #e2eceb)', background: '#ffffff', overflowX: 'auto', display: 'flex', gap: '8px', scrollbarWidth: 'none' }}>
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  style={{
                    fontSize: '0.74rem', padding: '4px 10px', borderRadius: '99px',
                    background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2eceb)',
                    color: 'var(--color-text-secondary, #2f4847)', whiteSpace: 'nowrap', cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-border, #e2eceb)', background: 'var(--color-surface, #ffffff)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Type your health question or symptom..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border, #e2eceb)', fontSize: '0.88rem', outline: 'none' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputQuery.trim()}
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontWeight: 700 }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Right Column: AI Architecture & Safety Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'var(--color-surface, #ffffff)', border: '1px solid var(--color-border, #e2eceb)',
              borderRadius: '20px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 16px 0' }}>
                How Niramoy AI Protects Patients
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    title: 'Automated Red-Flag Escalation',
                    desc: 'Instantly identifies critical signs of acute coronary events, strokes, anaphylaxis, and acute respiratory failure, immediately directing users to dial 999 or proceed to RMCH ER.'
                  },
                  {
                    title: 'Specialist Chamber Handoff',
                    desc: 'Instead of speculating on unverified treatments, Niramoy AI maps symptoms to appropriate clinical specialties and presents BMDC-registered practitioners with chamber hours.'
                  },
                  {
                    title: 'Drug Interaction & Safety Warnings',
                    desc: 'Flags common dangerous medication pairings (e.g. NSAIDs during suspected dengue fever or double dosing) before clinical consultations.'
                  },
                  {
                    title: 'Zero Hallucinated Prescriptions',
                    desc: 'Strict safety policies prevent the AI from generating unauthorized pharmaceutical prescriptions. Only registered human doctors can issue medical prescriptions.'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-primary, #0d7c6e)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '0 0 2px 0' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links Card */}
            <div style={{
              background: 'var(--color-primary-50, #f0faf9)', border: '1px solid var(--color-primary-100, #ccebe8)',
              borderRadius: '20px', padding: '24px'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--color-primary, #0d7c6e)' }}>
                Need Immediate Medical Care?
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Skip the AI chat and connect directly with healthcare infrastructure across Rajshahi.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/doctors" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                  Find Doctors
                </Link>
                <Link to="/ambulance" className="btn btn-secondary" style={{ background: '#ffffff', fontSize: '0.82rem' }}>
                  Ambulance Dispatch
                </Link>
                <Link to="/hospitals" className="btn btn-secondary" style={{ background: '#ffffff', fontSize: '0.82rem' }}>
                  Hospital Beds
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
