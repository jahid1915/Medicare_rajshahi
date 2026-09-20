export const SPECIALTIES = [
  {
    id: 'general',
    name: 'General Medicine',
    icon: 'Stethoscope',
    color: '#0d9488',
    description: 'Entry-level screening, common cold, low-risk symptoms, general wellness.',
    redFlags: ['chest pain', 'shortness of breath', 'severe bleeding', 'fainting', 'sudden weakness', 'unconsciousness'],
    triageQuestions: ['How long have you noticed these symptoms?', 'Is the severity mild, moderate, or severe?', 'Are you experiencing any fever or difficulty breathing?'],
    lowRiskAdvice: 'Stay hydrated, get sufficient restful sleep, monitor your temperature, and rest. If symptoms worsen after 48 hours, seek a doctor.',
    suggestedSpecialist: 'General Physician / Internal Medicine Specialist'
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: 'Brain',
    color: '#8b5cf6',
    description: 'Brain, spinal cord, nerve concerns, chronic headaches, numbness, memory.',
    redFlags: ['sudden facial drooping', 'arm weakness', 'slurred speech', 'thunderclap headache', 'seizures', 'vision loss'],
    triageQuestions: ['Is the headache constant or throbbing?', 'Have you noticed any numbness or tingling in your limbs?', 'Any dizziness or balance problems?'],
    lowRiskAdvice: 'For tension headaches, try resting in a quiet dark room, maintaining regular sleep schedules, and drinking adequate water.',
    suggestedSpecialist: 'Neurologist'
  },
  {
    id: 'neurosurgery',
    name: 'Neurosurgery',
    icon: 'Activity',
    color: '#7c3aed',
    description: 'Surgical conditions of brain & spine, herniated discs, severe nerve compression.',
    redFlags: ['loss of bowel or bladder control', 'progressive leg weakness', 'head trauma with vomiting', 'severe neck stiffness'],
    triageQuestions: ['Do you have shooting pain down your leg or spine?', 'Any recent physical head or spinal injury?'],
    lowRiskAdvice: 'Avoid heavy lifting, maintain proper ergonomic posture while sitting, and avoid sudden twisting motions.',
    suggestedSpecialist: 'Neurosurgeon'
  },
  {
    id: 'nephrology',
    name: 'Nephrology',
    icon: 'Bean',
    color: '#0284c7',
    description: 'Kidney health, fluid retention, urine changes, hypertension management.',
    redFlags: ['severe flank or back pain', 'blood in urine', 'inability to pass urine', 'extreme facial & ankle swelling'],
    triageQuestions: ['Have you noticed swelling in your ankles or eyes?', 'Any burning sensation during urination or color changes?'],
    lowRiskAdvice: 'Ensure safe fluid intake (2-2.5L daily unless restricted), limit excessive salt intake, and avoid unprescribed painkiller overuse.',
    suggestedSpecialist: 'Nephrologist'
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: 'Heart',
    color: '#ef4444',
    description: 'Heart health, chest discomfort, palpitations, blood pressure concerns.',
    redFlags: ['chest tightness/pressure radiating to jaw/arm', 'severe shortness of breath', 'palpitations with dizziness', 'fainting'],
    triageQuestions: ['Does the chest pressure increase with physical exertion?', 'Do you have a history of high blood pressure?'],
    lowRiskAdvice: 'Limit sodium intake, practice stress relaxation techniques, avoid smoking or caffeine overload, and monitor blood pressure.',
    suggestedSpecialist: 'Cardiologist'
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    icon: 'Wind',
    color: '#06b6d4',
    description: 'Lungs, persistent cough, asthma, breathing difficulties, seasonal allergies.',
    redFlags: ['bluish lips or fingernails', 'coughing up blood', 'stridor/gasping for air', 'high fever with breathlessness'],
    triageQuestions: ['Is your cough dry or producing phlegm?', 'Do you hear wheezing sounds when breathing out?'],
    lowRiskAdvice: 'Use warm steam inhalation, avoid dust and smoke exposure, stay hydrated, and rest your respiratory tract.',
    suggestedSpecialist: 'Pulmonologist / Respiratory Specialist'
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: 'Bone',
    color: '#f59e0b',
    description: 'Bones, joints, knee pain, muscle strain, ligament injuries, back discomfort.',
    redFlags: ['inability to bear weight on limb', 'visible bone deformity', 'severe joint swelling with high fever', 'numbness below injury'],
    triageQuestions: ['Did this start after a fall or sports injury?', 'Is there visible swelling or bruising around the joint?'],
    lowRiskAdvice: 'Apply R.I.C.E protocol (Rest, Ice for 15 mins, Compression, Elevation) for minor sprains. Avoid straining the joint.',
    suggestedSpecialist: 'Orthopedic Surgeon / Specialist'
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    icon: 'Eye',
    color: '#10b981',
    description: 'Eye pain, vision changes, dry eyes, redness, eye discharge, fatigue.',
    redFlags: ['sudden loss of vision', 'severe deep eye pain with halos around lights', 'chemical exposure to eye', 'flashes of light'],
    triageQuestions: ['Is there any redness, discharge, or sensitivity to light?', 'Are you experiencing blurred or double vision?'],
    lowRiskAdvice: 'Follow the 20-20-20 screen rule, use warm compresses for mild styes, avoid rubbing eyes, and keep hands clean.',
    suggestedSpecialist: 'Ophthalmologist / Eye Surgeon'
  },
  {
    id: 'ent',
    name: 'ENT (Ear, Nose, Throat)',
    icon: 'Ear',
    color: '#ec4899',
    description: 'Sore throat, earache, sinus pressure, nasal congestion, hoarseness.',
    redFlags: ['inability to swallow saliva', 'severe ear discharge with vertigo', 'persistent neck lump', 'unexplained nosebleed over 20 mins'],
    triageQuestions: ['Do you have ear pain or reduced hearing?', 'Is throat pain worse when swallowing liquids?'],
    lowRiskAdvice: 'Gargle warm salt water 3 times daily, use saline nasal sprays, stay hydrated, and rest your voice.',
    suggestedSpecialist: 'ENT Specialist / Otolaryngologist'
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: 'Sparkles',
    color: '#d97706',
    description: 'Skin rash, acne, eczema, mole changes, hair loss, allergic skin reactions.',
    redFlags: ['rapidly spreading purple rash with fever', 'blistering covering wide body areas', 'breathing difficulty with rash'],
    triageQuestions: ['Is the skin itchiness severe or burning?', 'Has the rash spread over the past 24 hours?'],
    lowRiskAdvice: 'Apply mild fragrance-free moisturizer, avoid scratching, use cool compresses, and refrain from harsh soaps.',
    suggestedSpecialist: 'Dermatologist'
  },
  {
    id: 'gynecology',
    name: 'Gynecology',
    icon: 'UserCheck',
    color: '#f43f5e',
    description: 'Women’s health, menstrual cycles, pelvic discomfort, pregnancy navigation.',
    redFlags: ['severe acute lower abdominal/pelvic pain', 'excessive bleeding saturation (>1 pad/hr)', 'fever with foul vaginal discharge'],
    triageQuestions: ['Is the abdominal discomfort linked to your menstrual cycle?', 'Any possibility of pregnancy or missed periods?'],
    lowRiskAdvice: 'Use warm heating pads for mild menstrual cramps, maintain hydration, and track symptoms in a cycle journal.',
    suggestedSpecialist: 'Gynecologist & Obstetrician'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: 'Baby',
    color: '#3b82f6',
    description: 'Child health, infant nutrition, childhood fever, vaccination schedule.',
    redFlags: ['lethargy / unresponsiveness in child', 'high fever (>102°F) in infants under 3 months', 'sunken eyes / dehydration'],
    triageQuestions: ['Is your child drinking fluids and staying active?', 'How many wet diapers has the infant had today?'],
    lowRiskAdvice: 'Ensure adequate fluid intake (breastmilk/ORSL), keep child comfortably dressed in light clothing, and monitor temperature.',
    suggestedSpecialist: 'Pediatrician'
  }
];

// Helper to classify user input into a target specialty and detect red flags
export function classifyHealthInput(input) {
  const text = input.toLowerCase();
  
  // Red flag keyword search
  const universalRedFlags = [
    'chest pain', 'crushing chest', 'heart attack', 'stroke', 'slurred speech',
    'facial drooping', 'paralysis', 'unconscious', 'fainting', 'severe bleeding',
    'coughing blood', 'suicidal', 'poison', 'anaphylaxis'
  ];
  
  const detectedRedFlags = universalRedFlags.filter(rf => text.includes(rf));

  // Match specialty
  let matchedSpecialty = SPECIALTIES[0]; // fallback to General Medicine
  let maxScore = 0;

  SPECIALTIES.forEach(spec => {
    let score = 0;
    // Check specialty name & description matches
    const keywords = [
      spec.id, spec.name.toLowerCase(),
      ...spec.description.toLowerCase().split(/[,\s]+/)
    ];

    keywords.forEach(kw => {
      if (kw.length > 3 && text.includes(kw)) score += 2;
    });

    // Check specific symptoms
    if (spec.id === 'cardiology' && (text.includes('heart') || text.includes('chest') || text.includes('bp') || text.includes('pulse'))) score += 5;
    if (spec.id === 'neurology' && (text.includes('headache') || text.includes('migraine') || text.includes('dizzy') || text.includes('numb'))) score += 5;
    if (spec.id === 'orthopedics' && (text.includes('knee') || text.includes('joint') || text.includes('back pain') || text.includes('bone'))) score += 5;
    if (spec.id === 'nephrology' && (text.includes('kidney') || text.includes('urine') || text.includes('flank') || text.includes('swelling'))) score += 5;
    if (spec.id === 'dermatology' && (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('acne'))) score += 5;
    if (spec.id === 'pulmonology' && (text.includes('cough') || text.includes('asthma') || text.includes('breath') || text.includes('wheez'))) score += 5;
    if (spec.id === 'pediatrics' && (text.includes('child') || text.includes('baby') || text.includes('infant') || text.includes('kid'))) score += 5;
    if (spec.id === 'gynecology' && (text.includes('period') || text.includes('cramp') || text.includes('pregnant') || text.includes('pelvic'))) score += 5;
    if (spec.id === 'ophthalmology' && (text.includes('eye') || text.includes('vision') || text.includes('sight'))) score += 5;
    if (spec.id === 'ent' && (text.includes('ear') || text.includes('throat') || text.includes('nose') || text.includes('sinus'))) score += 5;

    if (score > maxScore) {
      maxScore = score;
      matchedSpecialty = spec;
    }
  });

  return {
    specialty: matchedSpecialty,
    isHighRisk: detectedRedFlags.length > 0,
    detectedRedFlags,
    confidence: maxScore > 0 ? 'High' : 'Medium'
  };
}
