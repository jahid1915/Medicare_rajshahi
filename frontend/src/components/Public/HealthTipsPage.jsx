import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Tag, Clock, Calendar, UserCheck, AlertTriangle,
  ArrowRight, X, ChevronRight, Share2, Sparkles, Filter, CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Heart Health',
  'Diabetes',
  'Preventive Healthcare',
  'Nutrition',
  'Mental Wellness',
  'Women\'s Health',
  'Child Health',
  'Elderly Care',
  'Skin Care',
  'Respiratory Health',
  'Digestive Health',
  'Eye Care',
  'Dental Health',
  'First Aid',
  'Sleep & Recovery',
  'Medicine Awareness',
  'Emergency Awareness'
];

const HEALTH_ARTICLES = [
  {
    id: 'art-1',
    slug: 'managing-seasonal-dengue-platelet-monitoring',
    title: 'Managing Seasonal Dengue & Platelet Monitoring in Rajshahi',
    category: 'Preventive Healthcare',
    author: 'Dr. M. A. Rahman, MBBS, FCPS (Medicine)',
    publishedDate: 'Sep 28, 2026',
    readTime: '5 min read',
    tags: ['Dengue', 'RMCH', 'Platelet', 'Fever', 'Infectious Disease'],
    keyPoints: [
      'Early hydration with ORS and clear fluids is the most effective intervention.',
      'Strictly avoid NSAIDs (Aspirin, Ibuprofen, Diclofenac) to prevent gastrointestinal bleeding.',
      'Warning signs requiring urgent hospital admission include persistent vomiting, mucosal bleeding, and severe abdominal pain.'
    ],
    summary: 'Essential clinical guidelines on recognizing early warning signs of dengue hemorrhagic fever, hydration protocols, and when hospital admission is mandatory at RMCH.',
    content: `
Dengue fever continues to be an annual public health challenge across Rajshahi and surrounding districts. Early clinical suspicion and rigorous monitoring of fluid intake and platelet trends are the cornerstones of successful outpatient management.

### 1. Key Early Symptoms
- Sudden onset of high fever (102°F–105°F)
- Severe retro-orbital (behind the eye) headache
- Intense musculoskeletal pain ("break-bone fever")
- Transient macular rash appearing on day 3–4 of illness

### 2. Warning Signs Mandating Immediate ER Visit
If the patient exhibits any of the following, do not delay seeking hospital care:
- Persistent vomiting or inability to retain oral fluids
- Severe abdominal pain or tenderness
- Spontaneous bleeding from gums, nose, or in urine/stool
- Lethargy, extreme restlessness, or sudden drop in body temperature accompanied by cold clammy skin

### 3. Safe Management at Home
- **Hydration is paramount:** Oral rehydration solution (ORS), fresh coconut water, and clear broths.
- **Strict Avoidance of NSAIDs:** Never take Aspirin, Ibuprofen, or Diclofenac, as they dramatically increase the risk of gastrointestinal bleeding. Use only Paracetamol within safe daily limits (maximum 3g/24 hours for adults).
- **Platelet Count:** Maintain regular CBC tests as directed by your physician. Platelet count below 50,000/μL or rapid decline requires close clinical supervision.
    `,
    relatedIds: ['art-5', 'art-16'],
    featured: true
  },
  {
    id: 'art-2',
    slug: 'understanding-diabetes-mellitus-targets',
    title: 'Understanding Diabetes Mellitus: Fasting vs Postprandial Targets & Foot Care',
    category: 'Diabetes',
    author: 'Dr. Nasreen Sultana, MBBS, MD (Endocrinology)',
    publishedDate: 'Sep 24, 2026',
    readTime: '6 min read',
    tags: ['Diabetes', 'HbA1c', 'Endocrinology', 'Glucose', 'Diet'],
    keyPoints: [
      'Target fasting glucose is 4.4–7.0 mmol/L and 2-hour postprandial is under 8.5–10.0 mmol/L.',
      'Daily 30-minute brisk walking dramatically improves cellular insulin sensitivity.',
      'Daily diabetic foot inspections prevent undetected neuropathic ulcerations.'
    ],
    summary: 'A comprehensive guide to interpreting HbA1c, maintaining healthy glucose levels through dietary discipline, and preventing diabetic retinopathy and neuropathy.',
    content: `
Type 2 Diabetes Mellitus affects a significant portion of urban and semi-urban adults in Bangladesh. Consistent glycemic control prevents devastating long-term microvascular and macrovascular complications.

### Target Glycemic Ranges
- **Fasting Plasma Glucose:** 4.4 to 7.0 mmol/L (80–125 mg/dL)
- **2-Hour Postprandial (After Meal):** Less than 8.5 to 10.0 mmol/L
- **HbA1c Target:** Below 7.0% for most non-pregnant adults

### Daily Dietary Adjustments
- Prioritize high-fiber complex carbohydrates (unpolished brown rice, whole wheat atta, vegetables) over refined white rice and sweetened tea.
- Invert meal proportions: dedicate 50% of the plate to non-starchy vegetables, 25% to lean protein (fish, dal, egg whites), and 25% to carbohydrates.
- Regular 30-minute brisk walking at least 5 days a week improves insulin receptor sensitivity naturally.

### Diabetic Foot Hygiene
- Wash feet daily with lukewarm water and dry thoroughly, especially between the toes.
- Never walk barefoot, even indoors, to avoid minor punctures that can progress to diabetic ulcers.
    `,
    relatedIds: ['art-3', 'art-7'],
    featured: false
  },
  {
    id: 'art-3',
    slug: 'managing-hypertension-cardiovascular-health',
    title: 'Managing Hypertension & Lowering Cardiovascular Risk in South Asia',
    category: 'Heart Health',
    author: 'Prof. Dr. A. K. M. Shamsuddin, MBBS, FCPS, MD (Cardiology)',
    publishedDate: 'Sep 22, 2026',
    readTime: '6 min read',
    tags: ['Cardiology', 'Hypertension', 'Blood Pressure', 'Heart Attack', 'Salt'],
    keyPoints: [
      'Normal blood pressure is below 120/80 mmHg; sustained readings above 140/90 require medical management.',
      'Limiting dietary sodium to under 5 grams (approx. 1 level teaspoon) daily lowers systolic BP by 5–8 mmHg.',
      'Never discontinue antihypertensive medications abruptly without doctor instruction.'
    ],
    summary: 'Clinical advice on managing high blood pressure, minimizing salt intake, recognizing subtle heart attack warning signs, and preserving arterial elasticity.',
    content: `
Hypertension is known as the "silent killer" because elevated arterial pressure damages vital organs for years without causing noticeable symptoms.

### Blood Pressure Classifications
- **Optimal:** < 120/80 mmHg
- **Elevated:** 120–129 / < 80 mmHg
- **Stage 1 Hypertension:** 130–139 / 80–89 mmHg
- **Stage 2 Hypertension:** ≥ 140/90 mmHg

### Practical Sodium Reduction in Bangladeshi Diets
- Eliminate added table salt on rice, salads, and cut fruits.
- Limit processed savories, pickles (achar), and dried salted fish (shutki), which have exceptionally high sodium density.
- Incorporate potassium-rich foods (bananas, green leafy vegetables, coconut water) to help counterbalance sodium effects.

### Red-Flag Symptoms of Angina / Acute Coronary Syndrome
Seek immediate emergency medical attention if you experience:
- Crushing, squeezing retrosternal chest pain or pressure lasting more than 10 minutes.
- Pain radiating to the jaw, neck, back, or left arm.
- Accompanying cold diaphoresis (sweating), unexplained nausea, or lightheadedness.
    `,
    relatedIds: ['art-7', 'art-16'],
    featured: false
  },
  {
    id: 'art-4',
    slug: 'safe-medicine-storage-antibiotic-stewardship',
    title: 'Safe Medicine Storage & Antibiotic Stewardship',
    category: 'Medicine Awareness',
    author: 'Prof. S. K. Das, MPharm, Clinical Pharmacologist',
    publishedDate: 'Sep 20, 2026',
    readTime: '4 min read',
    tags: ['Antibiotics', 'Pharmacy', 'AMR', 'Medication Safety', 'Storage'],
    keyPoints: [
      'Antibiotics are ineffective against common viral colds, influenza, and COVID-19.',
      'Always complete the exact duration prescribed to eliminate resistant bacteria.',
      'Store oral antibiotic suspensions in the refrigerator (2°C–8°C) and discard after 7–14 days.'
    ],
    summary: 'Why completing full antibiotic courses prevents antimicrobial resistance, and how humidity and heat affect everyday home medications in Bangladesh.',
    content: `
Antimicrobial resistance (AMR) is one of the gravest threats to modern medical care. Misusing antibiotics for viral colds or stopping courses prematurely fosters resistant bacterial strains.

### Cardinal Rules of Antibiotic Safety
1. **Never use antibiotics for common viral flu:** Antibiotics kill bacteria, not viruses. Taking Azithromycin or Cefixime for a standard viral sore throat provides zero therapeutic benefit.
2. **Complete the full prescribed course:** Even if symptoms subside by Day 3, lingering bacteria survive if the full 5- or 7-day course is abandoned.
3. **Never share prescription drugs:** Dosages are tailored to renal function, body weight, and clinical indication.

### Proper Home Storage
- Keep medicines away from direct sunlight, stove heat, and bathroom dampness.
- Suspensions like reconstituted antibiotic syrups must be stored in the refrigerator (2°C–8°C) and discarded after 7–14 days as stated on the leaflet.
    `,
    relatedIds: ['art-2', 'art-14'],
    featured: false
  },
  {
    id: 'art-5',
    slug: 'pcos-awareness-maternal-health',
    title: 'PCOS Awareness, Menstrual Health & Iron Deficiency Anemia in Women',
    category: 'Women\'s Health',
    author: 'Dr. Farhana Yasmin, MBBS, DGO, MCPS (Obs & Gynae)',
    publishedDate: 'Sep 17, 2026',
    readTime: '6 min read',
    tags: ['PCOS', 'Maternal Health', 'Anemia', 'Gynecology', 'Nutrition'],
    keyPoints: [
      'Polycystic Ovary Syndrome (PCOS) is primarily a metabolic condition driven by insulin resistance.',
      'Routine ferritin screening detects iron deficiency before frank anemia manifests.',
      'Take iron supplements with Vitamin C (lemon juice) and avoid tea or milk for 2 hours.'
    ],
    summary: 'Clinical insights into identifying polycystic ovary syndrome, managing hormonal imbalances, and addressing high rates of microcytic hypochromic anemia in women.',
    content: `
Polycystic Ovary Syndrome (PCOS) and iron-deficiency anemia represent two of the most prevalent yet frequently underdiagnosed conditions impacting women across Bangladesh.

### Understanding PCOS
PCOS is a complex hormonal and metabolic condition characterized by:
- Irregular or absent menstrual cycles (oligomenorrhea)
- Elevated androgens causing facial hirsutism or severe acne
- Polycystic ovarian morphology observed on pelvic ultrasound

### Combating Iron-Deficiency Anemia
- Symptoms: Chronic fatigue, pale conjunctiva/nail beds, brittle nails, shortness of breath upon mild exertion.
- Dietary sources: Green leafy vegetables (kochushak, palong), liver, lentils, and small fish eaten with bones.
- Supplement rules: Calcium and tannins in strong tea inhibit iron absorption. Always separate iron intake from dairy products and hot tea.
    `,
    relatedIds: ['art-6', 'art-7'],
    featured: false
  },
  {
    id: 'art-6',
    slug: 'pediatric-fever-management-vaccination',
    title: 'Pediatric Fever Management & Dehydration Warning Signs',
    category: 'Child Health',
    author: 'Dr. K. M. Hossain, MBBS, DCH (Pediatrics)',
    publishedDate: 'Sep 14, 2026',
    readTime: '5 min read',
    tags: ['Pediatrics', 'Child Health', 'Fever', 'Vaccines', 'Dehydration'],
    keyPoints: [
      'Sponge bath with lukewarm tap water only; never use ice water or alcohol rubs.',
      'Dose paracetamol strictly by child weight (15 mg/kg per dose), not age guesswork.',
      'Urgent medical care is needed if an infant has fewer than 4 wet diapers in 24 hours.'
    ],
    summary: 'How to safely manage childhood fever, appropriate sponge bath techniques, weight-based paracetamol dosing, and identifying acute dehydration.',
    content: `
Fever in infants and young children frequently alarms parents. Understanding normal physiological responses and precise red-flag symptoms helps protect your child safely.

### How to Sponge Bath Correctly
- Use lukewarm tap water, never ice-cold water or rubbing alcohol.
- Gently wipe forehead, neck, armpits, and groin. Cold water causes shivering, which paradoxically raises core body temperature.

### Weight-Based Dosing
Always consult your pediatrician or refer to prescription guidelines for weight-based paracetamol dosing (15 mg/kg per dose every 4–6 hours). Never give adult tablets halved without clinician confirmation.

### Recognizing Pediatric Dehydration
- Sunken eyes or depressed anterior fontanelle (soft spot on infant's head)
- Dry lips and tongue with absence of tears when crying
- Fewer than 4 wet diapers in 24 hours
    `,
    relatedIds: ['art-1', 'art-5'],
    featured: false
  },
  {
    id: 'art-7',
    slug: 'heart-healthy-dietary-patterns',
    title: 'Heart-Healthy Dietary Patterns for South Asian Lifestyles',
    category: 'Nutrition',
    author: 'Nusrat Jahan, BSc (Nutrition), MSc (Dietetics)',
    publishedDate: 'Sep 11, 2026',
    readTime: '5 min read',
    tags: ['Nutrition', 'Cholesterol', 'Heart Health', 'Diet', 'Vegetables'],
    keyPoints: [
      'Limit cooking oil to no more than 500 mL per person per month.',
      'Never repeatedly reuse fried vegetable oil, which creates carcinogenic trans-fats.',
      'Include a small palm-sized portion (30g) of raw almonds or walnuts for essential omega-3 fatty acids.'
    ],
    summary: 'Practical dietary swaps for traditional Bangladeshi cooking to lower LDL cholesterol, reduce arterial inflammation, and regulate hypertension.',
    content: `
South Asians have a documented genetic predisposition to premature coronary artery disease. Modifying traditional cooking practices can dramatically lower cardiovascular risk.

### Practical Kitchen Swaps
- **Cooking Oil Moderation:** Restrict cooking oil to 500 mL per person per month. Avoid reheating vegetable oils repeatedly, which produces harmful trans-fats.
- **Sodium Control:** Keep total salt intake under 5 grams (approx 1 level teaspoon) daily. Avoid table salt on raw salads and fruit.
- **Incorporate Seeds & Nuts:** A small handful (30g) of unsalted almonds or walnuts provides cardioprotective omega-3 fatty acids.
- **Spices as Antioxidants:** Turmeric, garlic, and ginger carry natural anti-inflammatory compounds that support vascular endothelium health.
    `,
    relatedIds: ['art-2', 'art-3'],
    featured: false
  },
  {
    id: 'art-8',
    slug: 'recognizing-clinical-anxiety-depression',
    title: 'Recognizing Clinical Anxiety, Depression & Stress De-escalation',
    category: 'Mental Wellness',
    author: 'Dr. Tanvir Ahmed, MBBS, MPhil (Psychiatry)',
    publishedDate: 'Sep 08, 2026',
    readTime: '5 min read',
    tags: ['Mental Health', 'Anxiety', 'Depression', 'Psychiatry', 'Wellness'],
    keyPoints: [
      'Mental illness is a physiological brain health condition, not personal weakness or lack of willpower.',
      'Persistent low mood or anhedonia (inability to feel pleasure) lasting over 2 weeks warrants professional evaluation.',
      'Diaphragmatic 4-7-8 breathing activates the parasympathetic nervous system to de-escalate panic attacks.'
    ],
    summary: 'Breaking stigma around psychological distress, recognizing somatic symptoms of clinical anxiety, and when to consult a licensed psychiatrist in Rajshahi.',
    content: `
Mental health concerns in Bangladesh are frequently masked as vague somatic complaints—chronic headaches, unexplained palpitations, gastric distress, and insomnia. Recognizing psychological roots is the first step toward effective healing.

### Recognizing Symptoms of Major Depressive Disorder (MDD)
- Persistent depressed mood, emptiness, or tearfulness for more than 2 consecutive weeks.
- Marked loss of interest in previously cherished hobbies and social interactions (anhedonia).
- Sleep disturbances: early morning awakening or excessive hypersomnia.
- Pervasive fatigue and feelings of excessive guilt or worthlessness.

### Immediate Panic De-escalation (The 4-7-8 Technique)
1. Inhale quietly through your nose for a mental count of 4 seconds.
2. Hold your breath gently for a count of 7 seconds.
3. Exhale completely through your mouth with a soft whoosh for a count of 8 seconds.
4. Repeat 4 times to stimulate the vagus nerve and slow elevated heart rates.
    `,
    relatedIds: ['art-13', 'art-7'],
    featured: false
  },
  {
    id: 'art-9',
    slug: 'preventing-falls-osteoporosis-elderly-care',
    title: 'Preventing Falls, Osteoporosis & Managing Polypharmacy in Seniors',
    category: 'Elderly Care',
    author: 'Dr. Mahfuzur Rahman, MBBS, MD (Internal Medicine & Geriatrics)',
    publishedDate: 'Sep 05, 2026',
    readTime: '6 min read',
    tags: ['Geriatrics', 'Elderly Care', 'Osteoporosis', 'Falls', 'Polypharmacy'],
    keyPoints: [
      'Ensure bathroom safety with non-slip mats and wall-mounted grab rails.',
      'Annual DEXA bone scans identify silent osteopenia before hip or vertebral fractures occur.',
      'Regularly review all active prescription medicines with a doctor to avoid hazardous drug-drug interactions.'
    ],
    summary: 'A geriatric healthcare guide for caring for aging parents, minimizing bathroom fall hazards, screening for bone fragility, and consolidating complex medication schedules.',
    content: `
As life expectancy increases, specialized geriatric care becomes paramount to preserve physical mobility, cognitive clarity, and quality of life for our senior citizens.

### Environmental Fall Prevention
- **Bathroom Safety:** More than 70% of senior falls occur on wet bathroom tiles. Install grab rails beside the commode and shower area, and remove loose floor rugs.
- **Lighting:** Maintain adequate night-light illumination along hallways between the bedroom and bathroom.
- **Footwear:** Ensure elderly family members wear closed-heel, non-slip footwear rather than loose slippers.

### Managing Polypharmacy
Taking 5 or more concurrent daily medications increases adverse drug event risks. Bring all medicine boxes to your doctor every 6 months for a medication reconciliation review.
    `,
    relatedIds: ['art-3', 'art-4'],
    featured: false
  },
  {
    id: 'art-10',
    slug: 'managing-eczema-fungal-infections-skincare',
    title: 'Managing Eczema, Fungal Infections & Sun Protection in Bangladesh',
    category: 'Skin Care',
    author: 'Dr. Subhashish Roy, MBBS, DDV (Dermatology & Venereology)',
    publishedDate: 'Sep 02, 2026',
    readTime: '5 min read',
    tags: ['Dermatology', 'Skin Care', 'Eczema', 'Fungal', 'Sunscreen'],
    keyPoints: [
      'Never apply over-the-counter steroid creams on itchy ringworm rashes; steroids worsen fungal proliferation.',
      'Moisturize skin within 3 minutes of bathing to seal in epidermal hydration.',
      'Broad-spectrum SPF 30+ sunscreen protects against hyperpigmentation and premature photoaging.'
    ],
    summary: 'Guidance on treating prevalent fungal dermatophytosis (Tinea), managing atopic dermatitis flare-ups, and debunking dangerous topical steroid misuse.',
    content: `
The humid, subtropical climate of Rajshahi fosters widespread fungal infections and inflammatory skin disorders. Misuse of combination steroid creams sold over-the-counter is a major clinical issue.

### The Danger of Topical Steroids on Fungal Infections
Combination creams containing strong corticosteroids (like Clobetasol) suppress local cutaneous immunity. While they temporarily reduce itching, the underlying fungus multiplies unchecked, creating widespread refractory Tinea Incognito. Always obtain a dermatological diagnosis before applying topical medications.

### Eczema (Atopic Dermatitis) Care
- Bathe in lukewarm water for no longer than 10 minutes using a gentle, fragrance-free cleanser.
- Apply a thick ceramide- or petroleum-based moisturizer within 3 minutes of stepping out of the shower ("soak and seal").
- Wear loose, breathable cotton clothing to minimize friction and thermal perspiration.
    `,
    relatedIds: ['art-1', 'art-4'],
    featured: false
  },
  {
    id: 'art-11',
    slug: 'seasonal-asthma-air-quality-respiratory-health',
    title: 'Seasonal Asthma, Bronchitis & Coping with Air Quality in Northern Bengal',
    category: 'Respiratory Health',
    author: 'Dr. Nazmul Huda, MBBS, MD (Pulmonology)',
    publishedDate: 'Aug 29, 2026',
    readTime: '5 min read',
    tags: ['Pulmonology', 'Asthma', 'COPD', 'Air Pollution', 'Inhaler'],
    keyPoints: [
      'Inhaled corticosteroids delivered via spacer deliver medicine directly to bronchial airways with minimal systemic absorption.',
      'Monitor seasonal particulate matter (PM2.5) and wear a fitted N95 mask during winter morning smog.',
      'Never delay seeking emergency care if speech is interrupted by breathlessness.'
    ],
    summary: 'Managing seasonal respiratory flare-ups, proper inhaler and spacer technique, understanding peak flow monitoring, and minimizing particulate matter exposure.',
    content: `
During late autumn and winter, temperature inversions trap particulate pollution and agricultural dust across Rajshahi Division, triggering severe exacerbations in patients with asthma and Chronic Obstructive Pulmonary Disease (COPD).

### Proper Inhaler Technique with a Spacer
Over 60% of patients use metered-dose inhalers incorrectly, causing medication to deposit on the tongue rather than reaching deep pulmonary bronchioles. Using an anti-static valved spacer ensures optimal lung deposition and dramatically reduces oral thrush.

### Asthma Action Plan
- **Green Zone:** No cough or wheeze, normal sleep. Continue maintenance controller inhalers.
- **Yellow Zone:** Mild wheezing, chest tightness, waking at night. Use prescribed reliever (Salbutamol) and contact doctor.
- **Red Zone:** Severe shortness of breath, inability to speak full sentences without pausing for breath, rib retraction. Call 999 or proceed immediately to RMCH Emergency.
    `,
    relatedIds: ['art-1', 'art-16'],
    featured: false
  },
  {
    id: 'art-12',
    slug: 'gerd-acid-reflux-digestive-health',
    title: 'GERD (Acid Reflux), Peptic Ulcer Prevention & Gut Microbiome Health',
    category: 'Digestive Health',
    author: 'Prof. Dr. M. Masud Karim, MBBS, FCPS (Gastroenterology)',
    publishedDate: 'Aug 26, 2026',
    readTime: '6 min read',
    tags: ['Gastroenterology', 'GERD', 'Ulcer', 'Gastric', 'PPI'],
    keyPoints: [
      'Chronic unmonitored PPI (Omeprazole, Esomeprazole) use can impair calcium and vitamin B12 absorption.',
      'Avoid lying down for at least 2 to 3 hours following a heavy meal.',
      'Black tarry stools (melena) or vomiting blood indicate acute gastrointestinal bleeding requiring urgent endoscopy.'
    ],
    summary: 'Clinical advice on curbing chronic dyspepsia, moving beyond lifelong PPI dependency through lifestyle adjustments, and identifying red flags for upper GI ulcers.',
    content: `
"Gastric" is one of the most frequent complaints in clinical chambers across Bangladesh. Chronic heartburn and acid regurgitation can cause erosive esophagitis and Barrett's esophagus if left unmanaged.

### Breaking Lifelong PPI Dependency
Proton Pump Inhibitors (such as Omeprazole, Esomeprazole, and Pantoprazole) are effective for healing acute ulcers. However, taking them continuously for years without clinical review reduces gastric acidity, impairing calcium, magnesium, and vitamin B12 absorption, and increasing susceptibility to intestinal infections.

### Practical Lifestyle Measures for Reflux
- Eat smaller, more frequent meals rather than large, oil-heavy dinners.
- Allow at least 2.5 to 3 hours between your evening meal and bedtime.
- Elevate the head of your bed by 6 inches (using bed riser blocks, not extra pillows) to prevent nocturnal acid backflow.
- Limit triggers: excessive black tea, carbonated sodas, deep-fried snacks (singara, puri), and raw onions.
    `,
    relatedIds: ['art-7', 'art-4'],
    featured: false
  },
  {
    id: 'art-13',
    slug: 'sleep-hygiene-circadian-rhythms',
    title: 'Sleep Hygiene, Circadian Rhythms & Overcoming Chronic Insomnia',
    category: 'Sleep & Recovery',
    author: 'Dr. Nabila Chowdhury, MBBS, MSc (Sleep Medicine)',
    publishedDate: 'Aug 23, 2026',
    readTime: '5 min read',
    tags: ['Sleep', 'Insomnia', 'Mental Health', 'Circadian', 'Wellness'],
    keyPoints: [
      'Maintain an unvarying wake-up time 7 days a week to anchor your circadian rhythm.',
      'Stop viewing blue-light screens (smartphones, tablets) 60 minutes prior to sleep.',
      'Reserve the bed exclusively for sleep and intimacy to reinforce conditioned stimulus association.'
    ],
    summary: 'Evidence-based behavioral sleep strategies, managing melatonin disruption from smartphones, and avoiding reliance on addictive over-the-counter sedatives.',
    content: `
Adequate restorative sleep (7–8 hours for adults) is a non-negotiable biological requirement for neurocognitive function, metabolic equilibrium, and cardiovascular preservation.

### The Science of Sleep Hygiene
- **Consistent Wake-Up Time:** Waking up at the exact same hour every day sets your master circadian clock in the suprachiasmatic nucleus.
- **Blue Light Disruption:** The short-wavelength blue light emitted by smartphone screens suppresses pineal melatonin secretion, delaying sleep onset latency by up to 90 minutes.
- **The 20-Minute Rule:** If you are unable to fall asleep within 20 minutes, get out of bed. Move to a dimly lit room and engage in a calming activity (reading a physical book) until sleepiness arrives.

### The Risk of Self-Medicating with Benzodiazepines
Never purchase sedatives or sleeping tablets without a psychiatric or medical prescription. Benzodiazepines induce rapid physiological tolerance and high dependence liability.
    `,
    relatedIds: ['art-8', 'art-3'],
    featured: false
  },
  {
    id: 'art-14',
    slug: 'immediate-first-aid-burn-care-snakebites',
    title: 'Immediate First Aid: Burn Care, Bleeding Control & Snakebite Protocol',
    category: 'First Aid',
    author: 'Dr. Zahirul Haque, MBBS, MS (Emergency Medicine)',
    publishedDate: 'Aug 19, 2026',
    readTime: '6 min read',
    tags: ['First Aid', 'Emergency', 'Burn Care', 'Snakebite', 'Trauma'],
    keyPoints: [
      'Cool thermal burns immediately with cool running tap water for 15–20 minutes; never apply toothpaste or raw eggs.',
      'For severe arterial bleeding, apply direct, relentless pressure with a clean cloth.',
      'In snakebites, immobilize the limb like a fractured bone and transport immediately to RMCH; never make incisions or tourniquets.'
    ],
    summary: 'Life-saving first-aid guidelines for household burn accidents, laceration hemorrhage control, and scientifically sound snakebite management in rural Rajshahi.',
    content: `
In emergency trauma and acute accidents, the interventions delivered in the initial "golden hour" dictate whether a patient survives with minimal morbidity.

### 1. Thermal Burn Care
- **Cool Running Water:** Immediately cool the burned area with running tap water for 15 to 20 minutes. This halts deep thermal progression into subcutaneous tissues.
- **Never Apply Folk Remedies:** Toothpaste, raw eggs, butter, or engine oil trap heat and introduce severe bacterial infections into compromised tissue.
- Cover with a clean, dry, non-adherent cloth or sterile cling film and proceed to an emergency facility.

### 2. Snakebite Management (National Guidelines)
- **Do NOT cut or suck the bite wound.**
- **Do NOT apply tight tourniquets or ropes,** which cause ischemic gangrene and necessitate limb amputation.
- **Immobilize the bitten limb:** Keep the patient calm, immobilize the limb with a splint, and transport them immediately to Rajshahi Medical College Hospital, where polyvalent antivenom and respiratory support are available 24/7.
    `,
    relatedIds: ['art-1', 'art-16'],
    featured: false
  },
  {
    id: 'art-15',
    slug: 'preventing-periodontal-gum-disease-oral-hygiene',
    title: 'Preventing Periodontal Gum Disease, Cavities & Oral Hygiene Rules',
    category: 'Dental Health',
    author: 'Dr. Anisur Rahman, BDS, FCPS (Oral & Maxillofacial Surgery)',
    publishedDate: 'Aug 15, 2026',
    readTime: '4 min read',
    tags: ['Dental', 'Oral Health', 'Teeth', 'Hygiene', 'Periodontal'],
    keyPoints: [
      'Brush twice daily for a full 2 minutes using a soft-bristled brush with fluoride toothpaste.',
      'Bleeding gums are a clinical indicator of gingivitis, not an excuse to cease brushing.',
      'Oral tobacco (zarda, gul, pan-masala) is the leading risk factor for oral squamous cell carcinoma.'
    ],
    summary: 'Best practices for dental hygiene, proper modified Bass brushing technique, and the severe oral cancer hazards associated with betel nut and chewing tobacco.',
    content: `
Oral health is deeply connected to systemic well-being. Chronic periodontal infection is an established contributing factor for coronary artery disease and poor glycemic control in diabetics.

### Daily Oral Hygiene Regimen
- **Brushing Technique:** Hold your toothbrush at a 45-degree angle toward the gum line. Use short, gentle vibratory circular strokes. Brush for 2 full minutes twice daily (especially before bed).
- **Flossing:** Toothbrush bristles cannot penetrate interdental contact points where cavities frequently initiate. Daily flossing removes trapped food debris and plaque biofilm.
- **Replace Toothbrushes:** Discard your toothbrush every 3 months or sooner if bristles splay outwards.

### Oral Cancer Prevention
Chewing betel quid (pan) combined with smokeless tobacco (zarda, gul, sadapata) causes chronic submucous fibrosis and carries an exceptionally high risk of malignant transformation into oral carcinoma. Any non-healing mouth ulcer lasting more than 2 weeks warrants immediate biopsy evaluation.
    `,
    relatedIds: ['art-2', 'art-3'],
    featured: false
  },
  {
    id: 'art-16',
    slug: 'recognizing-acute-stroke-fast-protocol',
    title: 'Recognizing Acute Stroke: The F.A.S.T Protocol & RMCH Transfer',
    category: 'Emergency Awareness',
    author: 'Dr. Tariqul Islam, MBBS, FCPS (Neurology)',
    publishedDate: 'Aug 10, 2026',
    readTime: '5 min read',
    tags: ['Neurology', 'Stroke', 'FAST', 'Emergency', 'RMCH', '999'],
    keyPoints: [
      'F.A.S.T: Face drooping, Arm weakness, Speech difficulty, Time to call 999.',
      'The thrombolysis window for acute ischemic stroke is under 3 to 4.5 hours from symptom onset.',
      'Never give water, food, or oral aspirin at home before emergency CT imaging confirms stroke type.'
    ],
    summary: 'Time is brain tissue. Every minute lost during an acute ischemic stroke leads to irreversible neuron loss. Learn the rapid F.A.S.T screening method.',
    content: `
Acute ischemic stroke occurs when blood flow to an area of the brain is obstructed. The window for effective thrombolytic therapy is narrow (within 3 to 4.5 hours of symptom onset).

### The F.A.S.T. Assessment
- **F - Face Drooping:** Ask the person to smile. Does one side of the face droop or feel numb?
- **A - Arm Weakness:** Ask the person to raise both arms. Does one arm drift downward?
- **S - Speech Difficulty:** Is speech slurred, strange, or difficult to understand?
- **T - Time to Call 999:** If any of these signs are present, call emergency services immediately or transport the patient directly to Rajshahi Medical College Hospital with stroke facilities.

### What NOT to Do
- Do not feed the patient or give water, as swallowing reflexes may be impaired and lead to aspiration pneumonia.
- Do not administer blood thinners or aspirin at home before a non-contrast CT brain scan confirms whether the stroke is ischemic or hemorrhagic.
    `,
    relatedIds: ['art-3', 'art-14'],
    featured: false
  }
];


export default function HealthTipsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const filteredArticles = useMemo(() => {
    return HEALTH_ARTICLES.filter(art => {
      const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredArticle = HEALTH_ARTICLES.find(a => a.featured) || HEALTH_ARTICLES[0];

  return (
    <div className="health-tips-page" style={{ color: 'var(--color-text, #142422)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0d7c6e 0%, #0a5f54 100%)',
        color: '#ffffff',
        padding: '54px 20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '99px',
            background: 'rgba(255,255,255,0.15)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px'
          }}>
            <BookOpen size={14} /> CLINICAL HEALTH RESOURCES
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Health Tips & Medical Resources
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
            Evidence-based medical education, preventive health guidance, and regional health advisories reviewed by licensed physicians.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 20px' }}>
        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
          marginBottom: '28px', background: 'var(--color-surface, #ffffff)',
          padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border, #e2eceb)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #47615f)' }} />
            <input
              type="text"
              placeholder="Search by symptom, condition, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 42px',
                border: '1px solid var(--color-border, #e2eceb)', borderRadius: '10px',
                fontSize: '0.9rem', outline: 'none', background: 'var(--color-bg-muted, #f8fafc)'
              }}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-muted, #47615f)',
                fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}
            >
              <X size={14} /> Clear Search
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px',
          marginBottom: '32px', scrollbarWidth: 'none'
        }}>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '99px',
                  border: active ? '1.5px solid var(--color-primary, #0d7c6e)' : '1px solid var(--color-border, #e2eceb)',
                  background: active ? 'var(--color-primary, #0d7c6e)' : 'var(--color-surface, #ffffff)',
                  color: active ? '#ffffff' : 'var(--color-text-secondary, #2f4847)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured Article Card (only when no active search) */}
        {!searchQuery && selectedCategory === 'All' && featuredArticle && (
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1.5px solid var(--color-primary-100, #ccebe8)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 4px 12px rgba(13, 124, 110, 0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '99px',
              background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)',
              fontSize: '0.78rem', fontWeight: 800, marginBottom: '14px', textTransform: 'uppercase'
            }}>
              <Sparkles size={14} /> Featured Medical Guide
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 12px 0', color: 'var(--color-text, #142422)' }}>
              {featuredArticle.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6, maxWidth: '780px', margin: '0 0 20px 0' }}>
              {featuredArticle.summary}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)', marginBottom: '20px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <UserCheck size={16} color="var(--color-primary, #0d7c6e)" /> {featuredArticle.author}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {featuredArticle.publishedDate}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> {featuredArticle.readTime}
              </span>
            </div>
            <button
              onClick={() => setActiveArticle(featuredArticle)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 700 }}
            >
              Read Full Article <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Article Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 20px 0' }}>
            {selectedCategory === 'All' ? 'Latest Health Articles' : `${selectedCategory} Articles`}
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted, #47615f)', marginLeft: '10px' }}>
              ({filteredArticles.length} found)
            </span>
          </h2>

          {filteredArticles.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--color-surface, #ffffff)', borderRadius: '16px', border: '1px solid var(--color-border, #e2eceb)' }}>
              <BookOpen size={40} style={{ color: 'var(--color-text-muted, #47615f)', margin: '0 auto 12px auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>No matching articles</h3>
              <p style={{ color: 'var(--color-text-muted, #47615f)', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
                Try adjusting your search terms or selecting another category.
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  style={{
                    background: 'var(--color-surface, #ffffff)',
                    border: '1px solid var(--color-border, #e2eceb)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary, #0d7c6e)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border, #e2eceb)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                >
                  <div>
                    <div style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
                      background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)',
                      fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px'
                    }}>
                      {article.category}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.35, color: 'var(--color-text, #142422)' }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary, #2f4847)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                      {article.summary}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border, #e2eceb)', paddingTop: '14px', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text, #142422)', marginBottom: '4px' }}>
                      {article.author}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted, #47615f)' }}>
                      <span>{article.publishedDate}</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Disclaimer Callout */}
        <div style={{
          marginTop: '48px',
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400e', margin: '0 0 6px 0' }}>
              Medical Disclaimer for Health Tips
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#92400e', lineHeight: 1.6 }}>
              All health articles published on Niramoy are prepared for educational purposes and do not replace personalized clinical advice from a certified medical practitioner. Always consult a licensed doctor for symptom evaluation or prescription adjustments. In severe medical emergencies, immediately dial <strong>999</strong> or visit your nearest hospital emergency ward.
            </p>
          </div>
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setActiveArticle(null); }}
        >
          <div style={{
            background: 'var(--color-surface, #ffffff)',
            borderRadius: '20px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border, #e2eceb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-muted, #f8fafc)'
            }}>
              <span style={{
                padding: '4px 10px', borderRadius: '6px',
                background: 'var(--color-primary-50, #f0faf9)', color: 'var(--color-primary, #0d7c6e)',
                fontSize: '0.78rem', fontWeight: 700
              }}>
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted, #47615f)', display: 'flex', alignItems: 'center',
                  padding: '4px', borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px 24px', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.25, margin: '0 0 14px 0' }}>
                {activeArticle.title}
              </h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted, #47615f)', marginBottom: '24px', borderBottom: '1px solid var(--color-border, #e2eceb)', paddingBottom: '16px' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary, #0d7c6e)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={16} /> {activeArticle.author}
                </span>
                <span>•</span>
                <span>{activeArticle.publishedDate}</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>

              {/* Key Clinical Takeaways */}
              {activeArticle.keyPoints && activeArticle.keyPoints.length > 0 && (
                <div style={{
                  background: 'rgba(13, 124, 110, 0.06)',
                  border: '1px solid rgba(13, 124, 110, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--color-primary, #0d7c6e)', fontWeight: 800, fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} /> Key Clinical Takeaways
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--color-text, #142422)', lineHeight: 1.6 }}>
                    {activeArticle.keyPoints.map((pt, kIdx) => (
                      <li key={kIdx} style={{ marginBottom: '6px' }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formatted Content */}
              <div style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary, #2f4847)',
                whiteSpace: 'pre-line'
              }}>
                {activeArticle.content.trim()}
              </div>

              {/* Tags */}
              {activeArticle.tags && activeArticle.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '20px' }}>
                  {activeArticle.tags.map((tg, tIdx) => (
                    <span key={tIdx} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      #{tg}
                    </span>
                  ))}
                </div>
              )}

              {/* Medical Review Disclaimer */}
              <div style={{
                marginTop: '32px', padding: '16px', borderRadius: '12px',
                background: 'var(--color-bg-muted, #f8fafc)', border: '1px solid var(--color-border, #e2eceb)',
                fontSize: '0.8rem', color: 'var(--color-text-muted, #47615f)'
              }}>
                <strong>Clinical Review Notice:</strong> This article was authored and reviewed by licensed medical professionals. Information is subject to updates as clinical guidelines evolve.
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border, #e2eceb)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--color-bg-muted, #f8fafc)'
            }}>
              <Link to="/doctors" onClick={() => setActiveArticle(null)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                Consult a Doctor
              </Link>
              <button
                onClick={() => setActiveArticle(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', background: '#ffffff' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
