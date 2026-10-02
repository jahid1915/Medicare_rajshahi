export const SPECIALTIES = [
  {
    id: 'alternative-medicine',
    name: 'Alternative Medicine',
    slug: 'alternative-medicine',
    image: '/specialties/alternative-medicine.webp',
    icon: 'Sparkles',
    color: '#10b981',
    description: 'Homeopathic, holistic health, natural therapies, and complementary wellness.',
    redFlags: ['chest pain', 'unconsciousness', 'severe breathing difficulty', 'uncontrolled bleeding'],
    triageQuestions: ['How long have you had these symptoms?', 'Are you taking any conventional medications currently?'],
    lowRiskAdvice: 'Ensure balanced nutrition, adequate hydration, and consultation with registered holistic practitioners.',
    suggestedSpecialist: 'Alternative Medicine Practitioner'
  },
  {
    id: 'anaesthesiology',
    name: 'Anaesthesiology',
    slug: 'anesthesiology-pain-medicine',
    image: '/specialties/anesthesiology-pain-medicine.webp',
    icon: 'Activity',
    color: '#0284c7',
    description: 'Perioperative care, chronic pain management, anesthesia consultation.',
    redFlags: ['acute severe unmanaged pain', 'difficulty breathing post-procedure', 'anaphylactic drug reactions'],
    triageQuestions: ['Is this pain post-surgical or related to chronic nerve issues?', 'Do you have previous adverse reactions to anesthesia?'],
    lowRiskAdvice: 'Avoid strenuous physical activity, apply prescribed cold/warm packs, and review pre-surgery instructions.',
    suggestedSpecialist: 'Anaesthesiologist / Pain Specialist'
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    slug: 'cardiology',
    image: '/specialties/cardiology.webp',
    icon: 'Heart',
    color: '#ef4444',
    description: 'Heart health, chest discomfort, palpitations, hypertension, and cardiovascular disorders.',
    redFlags: ['chest tightness radiating to left arm/jaw', 'severe breathlessness', 'palpitations with fainting'],
    triageQuestions: ['Does the chest pressure worsen during exercise or stairs?', 'Do you have diagnosed high blood pressure or diabetes?'],
    lowRiskAdvice: 'Limit dietary sodium, refrain from smoking/excess caffeine, monitor BP, and practice calm breathing.',
    suggestedSpecialist: 'Cardiologist'
  },
  {
    id: 'cardiothoracic-surgery',
    name: 'Cardiothoracic surgery',
    slug: 'cardiac-thoracic-surgery',
    image: '/specialties/cardiac-thoracic-surgery.webp',
    icon: 'Activity',
    color: '#b91c1c',
    description: 'Surgical conditions of heart, lungs, esophagus, and thoracic vascular structures.',
    redFlags: ['coughing up large volumes of blood', 'sudden unbearable tearing chest pain', 'cyanosis / blue lips'],
    triageQuestions: ['Have you been advised for bypass, valve, or lung surgery?', 'Any history of thoracic trauma?'],
    lowRiskAdvice: 'Avoid heavy chest lifting or strain, follow cardiac rehab guidance, and monitor oxygen levels.',
    suggestedSpecialist: 'Cardiothoracic Surgeon'
  },
  {
    id: 'dentistry',
    name: 'Dentistry',
    slug: 'dentistry',
    image: '/specialties/dentistry.webp',
    icon: 'Smile',
    color: '#0891b2',
    description: 'Teeth, gums, oral hygiene, root canals, dental implants, and jaw alignment.',
    redFlags: ['swelling spreading to eye or neck with fever', 'difficulty swallowing or breathing from tooth infection', 'uncontrolled gum bleeding'],
    triageQuestions: ['Is the toothache constant or triggered by hot/cold drinks?', 'Is there visible gum swelling or pus?'],
    lowRiskAdvice: 'Rinse with warm saltwater 3 times daily, brush twice daily with soft bristles, avoid hard or sugary foods.',
    suggestedSpecialist: 'Dentist / Dental Surgeon'
  },
  {
    id: 'dermatology-venereology',
    name: 'Dermatology & Venereology',
    slug: 'dermatology-venereology',
    image: '/specialties/dermatology-venereology.webp',
    icon: 'Sparkles',
    color: '#d97706',
    description: 'Skin diseases, allergies, eczema, psoriasis, acne, hair, nails, and venereal infections.',
    redFlags: ['rapidly spreading purple rash with fever', 'skin blistering over wide body areas', 'mucosal ulcerations'],
    triageQuestions: ['Is the itching intense at night?', 'Has the rash spread to new areas over the last 48 hours?'],
    lowRiskAdvice: 'Use gentle fragrance-free moisturizers, avoid hot showers, and do not scratch irritated skin.',
    suggestedSpecialist: 'Dermatologist & Venereologist'
  },
  {
    id: 'endocrinology-diabetes',
    name: 'Endocrinology & Diabetes',
    slug: 'endocrinology-diabetes',
    image: '/specialties/endocrinology-diabetes.webp',
    icon: 'Activity',
    color: '#059669',
    description: 'Diabetes, thyroid disorders, hormone imbalances, metabolic syndrome, and obesity.',
    redFlags: ['extreme confusion or lethargy with very high/low blood glucose', 'fruity breath odor with vomiting', 'hypoglycemic seizure'],
    triageQuestions: ['What was your last fasting blood glucose or HbA1c reading?', 'Have you noticed unexpected weight changes or tremors?'],
    lowRiskAdvice: 'Follow regular meal timings, limit refined carbohydrates, stay hydrated, and maintain daily glucose logs.',
    suggestedSpecialist: 'Endocrinologist & Diabetologist'
  },
  {
    id: 'ent',
    name: 'ENT',
    slug: 'ent',
    image: '/specialties/ent.webp',
    icon: 'Ear',
    color: '#ec4899',
    description: 'Ear infections, hearing loss, sinus congestion, tonsillitis, throat, and neck conditions.',
    redFlags: ['inability to swallow liquids or saliva', 'sudden complete hearing loss', 'nosebleed lasting > 20 mins despite pressure'],
    triageQuestions: ['Do you have ear discharge or reduced hearing?', 'Is throat pain worse on swallowing?'],
    lowRiskAdvice: 'Gargle warm salt water, perform warm saline nasal rinses, avoid digging into ear canals with cotton swabs.',
    suggestedSpecialist: 'ENT Specialist / Otolaryngologist'
  },
  {
    id: 'gastroenterology-hepatology',
    name: 'Gastroenterology & Hepatology',
    slug: 'gastroenterology-hepatology',
    image: '/specialties/gastroenterology-hepatology.webp',
    icon: 'Flame',
    color: '#d97706',
    description: 'Digestive system, stomach ulcers, acid reflux, liver diseases, jaundice, and IBS.',
    redFlags: ['vomiting blood or coffee-ground material', 'black tarry stools', 'yellowing of eyes with deep abdominal pain'],
    triageQuestions: ['Is pain related to eating fatty or spicy foods?', 'Any yellowing of eyes, dark urine, or pale stools?'],
    lowRiskAdvice: 'Eat smaller frequent meals, avoid deep-fried/spicy foods, avoid lying down immediately after eating.',
    suggestedSpecialist: 'Gastroenterologist & Hepatologist'
  },
  {
    id: 'general-surgery',
    name: 'General Surgery',
    slug: 'general-surgery',
    image: '/specialties/general-surgery.webp',
    icon: 'Scissors',
    color: '#0284c7',
    description: 'Appendicitis, hernia, gallbladder stones, piles, fistula, trauma, and laparoscopic procedures.',
    redFlags: ['rigid board-like abdomen with severe tenderness', 'irreducible painful groin lump with vomiting', 'septic wound with high fever'],
    triageQuestions: ['Where is the pain located and has it moved to the right lower abdomen?', 'Any nausea or inability to pass gas?'],
    lowRiskAdvice: 'Do not eat or drink if acute surgical pain is suspected, avoid painkiller self-medication before doctor exam.',
    suggestedSpecialist: 'General & Laparoscopic Surgeon'
  },
  {
    id: 'gynecology-obstetrics',
    name: 'Gynecology & Obstetrics',
    slug: 'gynecology-obstetrics',
    image: '/specialties/gynecology-obstetrics.webp',
    icon: 'Users',
    color: '#db2777',
    description: 'Women’s health, pregnancy, normal delivery, cesarean, irregular periods, PCOS, and fibroids.',
    redFlags: ['severe lower abdominal agony with vaginal bleeding during pregnancy', 'reduced fetal movements', 'heavy bleeding soaking > 1 pad/hour'],
    triageQuestions: ['Is there any chance of pregnancy or missed periods?', 'How many days does your menstrual bleeding typically last?'],
    lowRiskAdvice: 'Rest with feet elevated during pregnancy swelling, use warm heating pads for mild menstrual cramps.',
    suggestedSpecialist: 'Gynecologist & Obstetrician'
  },
  {
    id: 'hematology',
    name: 'Hematology',
    slug: 'hematology',
    image: '/specialties/hematology.webp',
    icon: 'Droplet',
    color: '#e11d48',
    description: 'Blood diseases, anemia, thalassemia, leukemia, clotting disorders, and blood transfusions.',
    redFlags: ['unexplained large bruises and petechial pin-point rashes', 'fever with dangerously low platelet counts', 'severe pallor with breathlessness'],
    triageQuestions: ['Have you noticed unprovoked bleeding from gums or nose?', 'Do you have family history of thalassemia or blood disorders?'],
    lowRiskAdvice: 'Include iron and folate-rich foods in diet (green leafy vegetables, pulses), avoid unverified supplements.',
    suggestedSpecialist: 'Hematologist'
  },
  {
    id: 'medicine',
    name: 'Medicine',
    slug: 'medicine-general-physician',
    image: '/specialties/medicine-general-physician.webp',
    icon: 'Stethoscope',
    color: '#0d9488',
    description: 'Comprehensive adult health, fever, infections, hypertension, diabetes, and internal medicine.',
    redFlags: ['high fever > 103°F with neck stiffness or confusion', 'breathlessness at rest', 'persistent vomiting leading to dehydration'],
    triageQuestions: ['How many days has the fever or illness persisted?', 'Do you have any existing chronic illnesses like diabetes or asthma?'],
    lowRiskAdvice: 'Stay well-hydrated with oral rehydration salts (ORSL) and water, get plenty of rest, monitor temperature twice daily.',
    suggestedSpecialist: 'Medicine Specialist / General Physician'
  },
  {
    id: 'nephrology',
    name: 'Nephrology',
    slug: 'nephrology',
    image: '/specialties/nephrology.webp',
    icon: 'Shield',
    color: '#0284c7',
    description: 'Kidney disease, acute & chronic renal failure, proteinuria, dialysis, and fluid retention.',
    redFlags: ['drastic drop in urine output (< 400ml/day)', 'blood visible in urine', 'extreme shortness of breath with body swelling'],
    triageQuestions: ['Have you noticed swelling in feet, legs, or under eyes?', 'Are you on pain medications or high blood pressure therapy?'],
    lowRiskAdvice: 'Limit daily dietary salt, drink adequate safe drinking water (unless under fluid restriction), avoid NSAID painkillers.',
    suggestedSpecialist: 'Nephrologist / Kidney Specialist'
  },
  {
    id: 'neurology',
    name: 'Neurology',
    slug: 'neurology',
    image: '/specialties/neurology.webp',
    icon: 'Brain',
    color: '#8b5cf6',
    description: 'Brain, stroke, epilepsy, numbness, migraines, parkinsonism, neuropathies, and memory disorders.',
    redFlags: ['sudden facial drooping, arm weakness, or slurred speech (FAST)', 'thunderclap sudden worst headache of life', 'first-time seizure'],
    triageQuestions: ['Is numbness or weakness on one side of the body?', 'How often do headaches occur and are they accompanied by nausea/light sensitivity?'],
    lowRiskAdvice: 'Maintain regular sleep cycles, stay hydrated, avoid skipped meals, keep a headache log.',
    suggestedSpecialist: 'Neurologist'
  },
  {
    id: 'neurosurgery',
    name: 'Neurosurgery',
    slug: 'neurosurgery',
    image: '/specialties/neurosurgery.webp',
    icon: 'Activity',
    color: '#7c3aed',
    description: 'Surgical conditions of the brain, spine, disc prolapse, sciatica, tumors, and nerve decompression.',
    redFlags: ['loss of bowel or bladder control (cauda equina)', 'progressive weakness or dragging of foot', 'head trauma with repeated vomiting'],
    triageQuestions: ['Does shooting electric-like pain radiate down the leg or arm?', 'Any recent physical fall or spinal strain?'],
    lowRiskAdvice: 'Avoid bending forward with heavy loads, use ergonomic back support when sitting, avoid sudden spinal twists.',
    suggestedSpecialist: 'Neurosurgeon'
  },
  {
    id: 'nuclear-medicine',
    name: 'Nuclear Medicine',
    slug: 'nuclear-medicine',
    image: '/specialties/nuclear-medicine.webp',
    icon: 'Activity',
    color: '#0d9488',
    description: 'Diagnostic isotope scans, thyroid radioiodine therapy, PET/CT scans, and bone scintigraphy.',
    redFlags: ['severe uncontrolled hyperthyroid storm with rapid heartbeat', 'acute bone pain in oncology patients'],
    triageQuestions: ['Are you scheduled for a thyroid scan, bone scan, or radioiodine therapy?', 'Is there any possibility of pregnancy or breastfeeding?'],
    lowRiskAdvice: 'Follow isotope test preparation instructions carefully and maintain high fluid intake post-procedure as advised.',
    suggestedSpecialist: 'Nuclear Medicine Specialist'
  },
  {
    id: 'nutrition-dietetics',
    name: 'Nutrition & Dietetics',
    slug: 'nutrition-dietetics',
    image: '/specialties/nutrition-dietetics.webp',
    icon: 'Apple',
    color: '#16a34a',
    description: 'Clinical diet counseling, weight loss/gain, diabetic meal planning, and therapeutic nutrition.',
    redFlags: ['rapid unintended weight loss (> 10% in 1 month)', 'severe inability to swallow solid food or liquids'],
    triageQuestions: ['What are your primary goals (weight management, diabetes, kidney diet)?', 'Any diagnosed food intolerances?'],
    lowRiskAdvice: 'Prioritize whole fiber-rich grains, colorful vegetables, adequate lean protein, and limit sugary drinks.',
    suggestedSpecialist: 'Clinical Nutritionist & Dietitian'
  },
  {
    id: 'oncology',
    name: 'Oncology',
    slug: 'oncology',
    image: '/specialties/oncology.webp',
    icon: 'Shield',
    color: '#475569',
    description: 'Cancer care, chemotherapy, radiotherapy, breast lumps, tumors, and cancer screening.',
    redFlags: ['rapidly enlarging hard painless lump', 'unexplained significant weight loss and night sweats', 'persistent hoarseness or difficulty swallowing'],
    triageQuestions: ['Have you had a biopsy or previous histopathology report done?', 'Where is the lump or discomfort located?'],
    lowRiskAdvice: 'Avoid delaying clinical examination for persistent unexplained lumps, maintain balanced calorie intake.',
    suggestedSpecialist: 'Oncologist / Cancer Specialist'
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    slug: 'ophthalmology',
    image: '/specialties/ophthalmology.webp',
    icon: 'Eye',
    color: '#0d7c6e',
    description: 'Eye care, cataract surgery, glaucoma, vision testing, refractive errors, and eye infections.',
    redFlags: ['sudden painful or painless loss of vision', 'halos around bright lights with intense eye ache', 'chemical splash in eye (flush immediately)'],
    triageQuestions: ['Is your vision blurry at distance, reading, or both?', 'Is there eye redness, discharge, or light sensitivity?'],
    lowRiskAdvice: 'Rest eyes using the 20-20-20 rule, avoid rubbing eyes, never use unprescribed steroid eye drops.',
    suggestedSpecialist: 'Ophthalmologist / Eye Surgeon'
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    slug: 'orthopedics',
    image: '/specialties/orthopedics.webp',
    icon: 'Bone',
    color: '#f59e0b',
    description: 'Bone fractures, knee osteoarthritis, back pain, joint replacements, and sports injuries.',
    redFlags: ['inability to bear any weight on limb after trauma', 'visible bone deformity or open fracture', 'hot swollen red joint with high fever'],
    triageQuestions: ['Did pain start following a direct fall or twisting motion?', 'Do your knees crack or ache when climbing stairs?'],
    lowRiskAdvice: 'Use R.I.C.E protocol (Rest, Ice, Compression, Elevation) for fresh sprains; avoid high-impact jumping.',
    suggestedSpecialist: 'Orthopedic Surgeon'
  },
  {
    id: 'pathology-laboratory-medicine',
    name: 'Pathology & Laboratory Medicine',
    slug: 'pathology-laboratory-medicine',
    image: '/specialties/pathology-laboratory-medicine.webp',
    icon: 'TestTube',
    color: '#6366f1',
    description: 'Clinical laboratory diagnostic testing, histopathology, cytopathology, and blood biochemistry.',
    redFlags: ['severely abnormal critical panic lab values (e.g. potassium < 2.5 or > 6.0)', 'acute blood culture positive sepsis'],
    triageQuestions: ['Which diagnostic test or biopsy specimen was performed?', 'Do you have previous comparison reports?'],
    lowRiskAdvice: 'Follow fasting or sample collection instructions accurately for reliable laboratory test results.',
    suggestedSpecialist: 'Pathologist / Laboratory Specialist'
  },
  {
    id: 'pediatric-surgery',
    name: 'Pediatric Surgery',
    slug: 'pediatric-surgery',
    image: '/specialties/pediatric-surgery.webp',
    icon: 'Activity',
    color: '#0284c7',
    description: 'Surgical conditions in newborns, infants, and children (hernia, hydrocele, appendicitis, anomalies).',
    redFlags: ['infant with green/bilious vomiting and abdominal swelling', 'inconsolable crying with hard groin swelling', 'anorectal malformation in newborn'],
    triageQuestions: ['How old is the child and when was the swelling/pain noticed?', 'Has the child had normal bowel movements and urination?'],
    lowRiskAdvice: 'Do not forcefully press any groin swelling; keep infant calm and seek pediatric surgeon evaluation.',
    suggestedSpecialist: 'Pediatric Surgeon'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    slug: 'pediatrics',
    image: '/specialties/pediatrics.webp',
    icon: 'Baby',
    color: '#3b82f6',
    description: 'Child health, infant nutrition, childhood infections, immunization, growth, and development.',
    redFlags: ['infant lethargy or unresponsiveness', 'fever > 101°F in infant younger than 3 months', 'chest indrawing / fast breathing in child'],
    triageQuestions: ['Is your child active, feeding, and drinking fluids?', 'How many wet diapers has the child had today?'],
    lowRiskAdvice: 'Continue breastmilk/fluids, keep child lightly dressed in fever, use oral rehydration salts for loose stools.',
    suggestedSpecialist: 'Pediatrician / Child Specialist'
  },
  {
    id: 'physical-medicine-rehabilitation',
    name: 'Physical Medicine & Rehabilitation',
    slug: 'physical-medicine-rehabilitation',
    image: '/specialties/physical-medicine-rehabilitation.webp',
    icon: 'Activity',
    color: '#059669',
    description: 'Physiotherapy, paralysis recovery, post-stroke rehabilitation, musculoskeletal pain, and arthritis.',
    redFlags: ['rapid progression of limb paralysis within hours', 'loss of sensation in the saddle/groin area'],
    triageQuestions: ['Is stiffness worse in the morning upon waking?', 'Have you engaged in guided physical therapy exercises before?'],
    lowRiskAdvice: 'Perform gentle range-of-motion stretching daily, use supportive ergonomic seating, avoid prolonged bed rest.',
    suggestedSpecialist: 'Physiatrist / Physical Medicine Specialist'
  },
  {
    id: 'psychiatry-mental-health',
    name: 'Psychiatry & Mental Health',
    slug: 'psychiatry-mental-health',
    image: '/specialties/psychiatry-mental-health.webp',
    icon: 'Smile',
    color: '#7c3aed',
    description: 'Depression, anxiety, panic attacks, OCD, insomnia, bipolar disorder, and psychotherapy.',
    redFlags: ['thoughts of self-harm or suicide', 'severe agitation or hallucinations', 'complete refusal of food and water'],
    triageQuestions: ['How long have feelings of low mood or high anxiety lasted?', 'Is sleep or daily work functioning disrupted?'],
    lowRiskAdvice: 'Practice daily mindfulness deep breathing, maintain consistent sleep hours, reach out to supportive loved ones.',
    suggestedSpecialist: 'Psychiatrist / Mental Health Professional'
  },
  {
    id: 'pulmonology-respiratory-medicine',
    name: 'Pulmonology & Respiratory Medicine',
    slug: 'pulmonology-respiratory-medicine',
    image: '/specialties/pulmonology-respiratory-medicine.webp',
    icon: 'Wind',
    color: '#06b6d4',
    description: 'Asthma, COPD, chronic cough, pneumonia, tuberculosis, and sleep apnea.',
    redFlags: ['oxygen saturation SpO2 falling below 92%', 'coughing up red blood', 'audible severe wheezing with gasping for breath'],
    triageQuestions: ['Is the cough dry or producing colored sputum?', 'Do breathlessness attacks trigger at night or in cold air?'],
    lowRiskAdvice: 'Inhale warm steam, avoid mosquito coils and cooking smoke, take prescribed inhaler with spacer as directed.',
    suggestedSpecialist: 'Pulmonologist / Chest Specialist'
  },
  {
    id: 'radiology-imaging',
    name: 'Radiology & Imaging',
    slug: 'radiology-imaging',
    image: '/specialties/radiology-imaging.webp',
    icon: 'Activity',
    color: '#0284c7',
    description: 'Ultrasound, X-ray, CT scan, MRI, Doppler studies, and interventional radiology.',
    redFlags: ['acute traumatic intracranial bleeding detected on CT', 'acute pulmonary embolism suspicion on CT angio'],
    triageQuestions: ['Which body region requires imaging (abdomen, chest, brain, knee)?', 'Do you have metal implants or pacemakers (for MRI)?'],
    lowRiskAdvice: 'Drink water for pelvic ultrasound to keep bladder full, remove metal jewelry before radiographic scans.',
    suggestedSpecialist: 'Radiologist & Sonologist'
  },
  {
    id: 'reproductive-medicine-infertility',
    name: 'Reproductive Medicine & Infertility',
    slug: 'reproductive-medicine-infertility',
    image: '/specialties/reproductive-medicine-infertility.webp',
    icon: 'Heart',
    color: '#db2777',
    description: 'Fertility assessments, IUI, IVF counseling, male & female reproductive health, and hormone tracking.',
    redFlags: ['acute severe sudden unilateral pelvic pain (ectopic risk)', 'heavy post-procedure vaginal hemorrhage'],
    triageQuestions: ['How long have you been trying to conceive without protection?', 'Have basic semen analysis or ovulation tests been conducted?'],
    lowRiskAdvice: 'Maintain healthy BMI, reduce psychological stress, track ovulatory window, avoid smoking and alcohol.',
    suggestedSpecialist: 'Infertility & Reproductive Specialist'
  },
  {
    id: 'rheumatology',
    name: 'Rheumatology',
    slug: 'rheumatology',
    image: '/specialties/rheumatology.webp',
    icon: 'Activity',
    color: '#b45309',
    description: 'Rheumatoid arthritis, lupus (SLE), gout, ankylosing spondylitis, and autoimmune joint disorders.',
    redFlags: ['fever with acute single hot swollen joint (septic arthritis)', 'kidney involvement or butterfly rash in lupus'],
    triageQuestions: ['Do morning joint stiffness episodes last more than 30-45 minutes?', 'Are small joints of fingers and wrists affected on both sides?'],
    lowRiskAdvice: 'Apply warm water compresses for morning stiffness, engage in low-impact swimming/walking, avoid high-purine foods in gout.',
    suggestedSpecialist: 'Rheumatologist'
  },
  {
    id: 'urology',
    name: 'Urology',
    slug: 'urology',
    image: '/specialties/urology.webp',
    icon: 'Shield',
    color: '#0369a1',
    description: 'Kidney stones, prostate enlargement (BPH), urinary tract infections (UTI), and male urinary surgery.',
    redFlags: ['complete inability to pass urine with painful distended bladder', 'blood in urine with clots', 'severe flank pain with vomiting and fever'],
    triageQuestions: ['Do you have burning sensation during urination or waking multiple times at night?', 'Has a urine routine or KUB ultrasound been done?'],
    lowRiskAdvice: 'Drink 2.5 to 3 liters of water daily, do not hold urine for long periods, limit excessive oxalates if stone former.',
    suggestedSpecialist: 'Urologist / Urological Surgeon'
  }
];

// Helper to classify user input into a target specialty and detect red flags
export function classifyHealthInput(input) {
  const text = (input || '').toLowerCase();
  
  // Red flag keyword search
  const universalRedFlags = [
    'chest pain', 'crushing chest', 'heart attack', 'stroke', 'slurred speech',
    'facial drooping', 'paralysis', 'unconscious', 'fainting', 'severe bleeding',
    'coughing blood', 'suicidal', 'poison', 'anaphylaxis'
  ];
  
  const detectedRedFlags = universalRedFlags.filter(rf => text.includes(rf));

  // Match specialty
  let matchedSpecialty = SPECIALTIES[12]; // fallback to Medicine
  let maxScore = 0;

  SPECIALTIES.forEach(spec => {
    let score = 0;
    const keywords = [
      spec.id, spec.name.toLowerCase(),
      ...spec.description.toLowerCase().split(/[,\s]+/)
    ];

    keywords.forEach(kw => {
      if (kw.length > 3 && text.includes(kw)) score += 2;
    });

    if (spec.id === 'cardiology' && (text.includes('heart') || text.includes('chest') || text.includes('bp') || text.includes('pulse'))) score += 5;
    if (spec.id === 'neurology' && (text.includes('headache') || text.includes('migraine') || text.includes('dizzy') || text.includes('numb'))) score += 5;
    if (spec.id === 'orthopedics' && (text.includes('knee') || text.includes('joint') || text.includes('back pain') || text.includes('bone'))) score += 5;
    if (spec.id === 'nephrology' && (text.includes('kidney') || text.includes('urine') || text.includes('flank') || text.includes('swelling'))) score += 5;
    if (spec.id.includes('dermatology') && (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('acne'))) score += 5;
    if (spec.id.includes('pulmonology') && (text.includes('cough') || text.includes('asthma') || text.includes('breath') || text.includes('wheez'))) score += 5;
    if (spec.id === 'pediatrics' && (text.includes('child') || text.includes('baby') || text.includes('infant') || text.includes('kid'))) score += 5;
    if (spec.id.includes('gynecology') && (text.includes('period') || text.includes('cramp') || text.includes('pregnant') || text.includes('pelvic'))) score += 5;
    if (spec.id === 'ophthalmology' && (text.includes('eye') || text.includes('vision') || text.includes('sight'))) score += 5;
    if (spec.id === 'ent' && (text.includes('ear') || text.includes('throat') || text.includes('nose') || text.includes('sinus'))) score += 5;
    if (spec.id === 'dentistry' && (text.includes('tooth') || text.includes('teeth') || text.includes('gum') || text.includes('dental'))) score += 5;
    if (spec.id === 'urology' && (text.includes('prostate') || text.includes('stone') || text.includes('bladder'))) score += 5;

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
