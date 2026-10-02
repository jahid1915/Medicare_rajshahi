import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, AlertTriangle, Stethoscope, FileText,
  Search, Pill, ArrowRight, MessageSquare, Bot, CheckCircle2,
  Clock, Zap, PhoneCall, HelpCircle, ExternalLink, Calendar, MapPin
} from 'lucide-react';
import { SPECIALTIES, classifyHealthInput } from '../../data/specialties';
import { aiAPI } from '../../services/api';
import { useLanguage } from '../../i18n';

const SAMPLE_PROMPTS_EN = [
  'Rajshahi te skin specialist doctor ke ke ache?',
  'Where can I find an ambulance in Rajshahi?',
  'How do I book a doctor appointment on Niramoy?',
  'What are standard fasting blood sugar targets for adults?',
  'Severe pressure in my chest spreading to my left arm.',
  'Can I take antacids at the same time as my daily iron tablet?'
];

const SAMPLE_PROMPTS_BN = [
  'রাজশাহীতে চর্মরোগ বিশেষজ্ঞ ডাক্তার কারা আছেন?',
  'জরুরি অ্যাম্বুলেন্স কোথায় পাওয়া যাবে?',
  'Niramoy-তে ডাক্তার অ্যাপয়েন্টমেন্ট কীভাবে বুক করব?',
  'ডায়াবেটিসে খালি পেটে রক্তের শর্করার স্বাভাবিক মাত্রা কত?',
  'বুকের বাম পাশে তীব্র ব্যথা ও চাপ অনুভূত হচ্ছে।',
  'অ্যান্টাসিড ও আয়রন ট্যাবলেট কি একসাথে খাওয়া যাবে?'
];

export default function AIPage() {
  const { t, language, isBangla } = useLanguage();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: isBangla
        ? 'আসসালামু আলাইকুম! আমি Niramoy AI, রাজশাহীতে আপনার স্বাস্থ্য সহকারী। আপনি বাংলা, ইংরেজি অথবা বাংলিশে জিজ্ঞাসা করতে পারেন:\n\n• "রাজশাহীতে চর্মরোগ বিশেষজ্ঞ ডাক্তার কে আছেন?"\n• "জরুরি অ্যাম্বুলেন্স কোথায় পাব?"\n• "Niramoy-তে ডাক্তার অ্যাপয়েন্টমেন্ট কীভাবে নিব?"\n\n*শুধুমাত্র প্রাথমিক স্বাস্থ্য তথ্যের জন্য — জরুরি পরিস্থিতিতে সরাসরি রাজশাহী মেডিকেল কলেজ হাসপাতালে যোগাযোগ করুন।*'
        : 'Hello! I am Niramoy AI, your intelligent health navigation assistant for Rajshahi. You can ask in Bangla, English, or Banglish:\n\n• "Rajshahi te skin doctor ke ache?"\n• "রাজশাহীতে অ্যাম্বুলেন্স কোথায় পাব?"\n• "Niramoy te doctor appointment kivabe nibo?"\n• Describe your symptoms for safe clinical guidance.\n\n*Informational guidance only — emergency patients should proceed directly to RMCH.*',
      entities: [],
      suggestedActions: [
        { label: isBangla ? 'ডাক্তার খুঁজুন' : 'Find Doctors', link: '/doctors' },
        { label: isBangla ? 'জরুরি অ্যাম্বুলেন্স' : 'Emergency Ambulance', link: '/ambulance' }
      ],
      timestamp: isBangla ? 'এইমাত্র' : 'Just now'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  const handleSend = async (textToSend) => {
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

    try {
      const res = await aiAPI.chat(text, language);
      const isEmergency = (res.reply || '').includes('⚠️') || (res.reply || '').includes('EMERGENCY') || (res.reply || '').includes('সতর্কতা');
      if (isEmergency) setEmergencyAlert(true);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          entities: res.entities || [],
          suggestedActions: res.suggestedActions || [],
          isEmergency,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Local fallback in case network/offline
      const lower = text.toLowerCase();
      let isEmergency = false;
      let reply = '';
      let recommendedSpecialty = null;

      if (
        lower.includes('chest pain') || lower.includes('heart attack') ||
        lower.includes('stroke') || lower.includes('cannot breathe') ||
        lower.includes('unconscious')
      ) {
        isEmergency = true;
        setEmergencyAlert(true);
        reply = `⚠️ **CRITICAL RED-FLAG WARNING:** Your description may indicate a life-threatening medical emergency. **DO NOT WAIT for an online reply.** Immediately call **999** or proceed to the Emergency Room at Rajshahi Medical College Hospital (RMCH).`;
      } else {
        const classification = classifyHealthInput(text);
        if (classification && classification.specialty) {
          recommendedSpecialty = classification.specialty;
          reply = `Based on your description, this commonly involves **${classification.specialty.name}** (${classification.specialty.banglaName || ''}).\n\n` +
            `• **Potential Considerations:** ${classification.specialty.commonConditions?.slice(0, 3).join(', ') || 'General evaluation'}\n` +
            `• **Next Clinical Step:** We recommend scheduling a physical chamber consultation with a verified BMDC specialist in Rajshahi.`;
        } else {
          reply = `Thank you for sharing your concern. For accurate diagnosis, an in-person physical assessment with a licensed doctor is essential.\n\nWould you like to search available doctors or chambers in Rajshahi today?`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          isEmergency,
          recommendedSpecialty,
          entities: [],
          suggestedActions: [{ label: 'Find Doctors', link: '/doctors' }],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
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
            <Sparkles size={14} /> {isBangla ? 'ক্লিনিক্যাল সিদ্ধান্ত ও স্বাস্থ্য সহায়ক' : 'CLINICAL DECISION SUPPORT & NAVIGATION'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            {t('ai.title', 'Niramoy AI Health Assistant')}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            {t('ai.subtitle', 'An intelligent healthcare companion designed for symptom navigation, prescription comprehension, and immediate linkage to verified BMDC physicians in Rajshahi.')}
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
            {isBangla ? (
              <><strong>সুরক্ষা প্রটোকল ও পরিধি:</strong> Niramoy AI একটি সহায়ক স্বাস্থ্য গাইডেন্স সিস্টেম, <em>এটি কোনো স্বয়ংক্রিয় ডাক্তার নয়</em>। এটি কোনো বাধ্যতামূলক রোগ নির্ণয় করে না। জরুরি পরিস্থিতিতে অবিলম্বে <strong>৯৯৯</strong> নম্বরে যোগাযোগ করুন।</>
            ) : (
              <><strong>Assistance Protocol & Scope:</strong> Niramoy AI is a supportive navigation tool, <em>not an autonomous medical doctor</em>. It does not replace a physical clinical consultation or formulate binding diagnostic conclusions. In emergencies, immediately call <strong>999</strong>.</>
            )}
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
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
                    {isBangla ? 'Niramoy হেলথ নেভিগেটর' : 'Niramoy Health Navigator'}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span> {isBangla ? 'ক্লিনিক্যাল সুরক্ষা বিধি সক্রিয়' : 'Clinical Safety Rules Active'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #47615f)', background: '#fff', border: '1px solid var(--color-border, #e2eceb)', padding: '3px 8px', borderRadius: '6px' }}>
                {isBangla ? 'দ্বিভাষিক (EN / বাংলা)' : 'Bilingual (EN / BN)'}
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

                  {/* Structured Entity Cards (Doctors, Ambulances, Hospitals, Medicines, etc.) */}
                  {m.entities && m.entities.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {m.entities.map((item, eIdx) => (
                        <div
                          key={eIdx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--color-border, #e2eceb)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-primary, #0f172a)' }}>
                                {item.title}
                              </strong>
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-primary, #0d7c6e)', fontWeight: 600 }}>
                                {item.subtitle}
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700,
                              background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569'
                            }}>
                              {item.type}
                            </span>
                          </div>

                          {item.details && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary, #334155)', margin: '2px 0' }}>
                              {item.details}
                            </div>
                          )}

                          {item.link && (
                            <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                              {item.link.startsWith('tel:') ? (
                                <a
                                  href={item.link}
                                  className="btn btn-primary"
                                  style={{ fontSize: '0.74rem', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                >
                                  <PhoneCall size={12} /> {item.actionLabel || 'Call Now'}
                                </a>
                              ) : (
                                <Link
                                  to={item.link}
                                  className="btn btn-primary"
                                  style={{ fontSize: '0.74rem', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                >
                                  {item.actionLabel || 'View Details'} <ArrowRight size={12} />
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Quick Actions */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {m.suggestedActions.map((act, aIdx) => (
                        <Link
                          key={aIdx}
                          to={act.link}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '99px',
                            background: '#ffffff',
                            color: 'var(--color-primary, #0d7c6e)',
                            border: '1px solid var(--color-primary, #0d7c6e)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {act.label} <ArrowRight size={11} />
                        </Link>
                      ))}
                    </div>
                  )}

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
                  {isBangla ? 'ক্লিনিক্যাল সুরক্ষা ডাটাবেসে উপসর্গ পর্যালোচনা করা হচ্ছে...' : 'Analyzing symptoms against clinical safety database...'}
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border, #e2eceb)', background: '#ffffff', overflowX: 'auto', display: 'flex', gap: '8px', scrollbarWidth: 'none' }}>
              {(isBangla ? SAMPLE_PROMPTS_BN : SAMPLE_PROMPTS_EN).map((p, i) => (
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
                placeholder={t('ai.inputPlaceholder', 'Type your health question or symptom...')}
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
                {t('ai.send', 'Send')}
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
                {isBangla ? 'Niramoy AI কীভাবে রোগীদের সুরক্ষা দেয়' : 'How Niramoy AI Protects Patients'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  {
                    title: isBangla ? 'স্বয়ংক্রিয় জরুরি উপসর্গ সনাক্তকরণ' : 'Automated Red-Flag Escalation',
                    desc: isBangla ? 'হার্ট অ্যাটাক, স্ট্রোক, শ্বাসকষ্টের মতো আশঙ্কাজনক লক্ষণ তাৎক্ষণিক শনাক্ত করে রোগীকে ৯৯৯ বা সরাসরি রাজশাহী মেডিকেল কলেজ হাসপাতালে যাওয়ার নির্দেশনা দেয়।' : 'Instantly identifies critical signs of acute coronary events, strokes, anaphylaxis, and acute respiratory failure, immediately directing users to dial 999 or proceed to RMCH ER.'
                  },
                  {
                    title: isBangla ? 'বিশেষজ্ঞ ডাক্তার রেফারেল' : 'Specialist Chamber Handoff',
                    desc: isBangla ? 'অযাচাইকৃত ওষুধের অনুমানের বদলে উপসর্গ অনুযায়ী বিএমডিসি নিবন্ধিত বিশেষজ্ঞ ডাক্তার ও চেম্বারের সময়সূচি প্রদর্শন করে।' : 'Instead of speculating on unverified treatments, Niramoy AI maps symptoms to appropriate clinical specialties and presents BMDC-registered practitioners with chamber hours.'
                  },
                  {
                    title: isBangla ? 'ওষুধের মিথস্ক্রিয়া ও সুরক্ষা সতর্কতা' : 'Drug Interaction & Safety Warnings',
                    desc: isBangla ? 'চিকিৎসককে দেখানোর পূর্বে একাধিক ওষুধের বিপজ্জনক সংমিশ্রণ সম্পর্কে রোগীদের আগাম সতর্ক করে।' : 'Flags common dangerous medication pairings (e.g. NSAIDs during suspected dengue fever or double dosing) before clinical consultations.'
                  },
                  {
                    title: isBangla ? 'অননুমোদিত প্রেসক্রিপশন নিষেধ' : 'Zero Hallucinated Prescriptions',
                    desc: isBangla ? 'কঠোর নিরাপত্তা নীতিমালার কারণে কৃত্রিম বুদ্ধিমত্তা কোনো অননুমোদিত ওষুধ প্রেসক্রাইব করতে পারে না। শুধুমাত্র নিবন্ধিত মানবিক চিকিৎসকই প্রেসক্রিপশন প্রদান করতে পারেন।' : 'Strict safety policies prevent the AI from generating unauthorized pharmaceutical prescriptions. Only registered human doctors can issue medical prescriptions.'
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
                {isBangla ? 'জরুরি চিকিৎসা সেবা প্রয়োজন?' : 'Need Immediate Medical Care?'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                {isBangla ? 'এআই চ্যাট বাদ দিয়ে সরাসরি রাজশাহীর স্বাস্থ্য সেবার সাথে যুক্ত হোন।' : 'Skip the AI chat and connect directly with healthcare infrastructure across Rajshahi.'}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to="/doctors" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                  {t('nav.doctors', 'Find Doctors')}
                </Link>
                <Link to="/ambulance" className="btn btn-secondary" style={{ background: '#ffffff', fontSize: '0.82rem' }}>
                  {t('nav.ambulance', 'Ambulance Dispatch')}
                </Link>
                <Link to="/hospitals" className="btn btn-secondary" style={{ background: '#ffffff', fontSize: '0.82rem' }}>
                  {t('nav.hospitals', 'Hospital Beds')}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
