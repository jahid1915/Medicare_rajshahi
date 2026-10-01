import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Tag, Clock, Calendar, UserCheck, AlertTriangle,
  ArrowRight, X, ChevronRight, Share2, Sparkles, Filter, CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Preventive Healthcare',
  'General Wellness',
  'Nutrition',
  'Medicine Awareness',
  'Maternal Health',
  'Child Health',
  'Emergency Awareness',
  'Chronic Disease Education'
];

const HEALTH_ARTICLES = [
  {
    id: 'art-1',
    title: 'Managing Seasonal Dengue & Platelet Monitoring in Rajshahi',
    category: 'Preventive Healthcare',
    author: 'Dr. M. A. Rahman, MBBS, FCPS (Medicine)',
    publishedDate: 'Sep 28, 2026',
    readTime: '5 min read',
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
    relatedIds: ['art-5', 'art-7'],
    featured: true
  },
  {
    id: 'art-2',
    title: 'Understanding Diabetes Mellitus: Fasting vs Postprandial Targets',
    category: 'Chronic Disease Education',
    author: 'Dr. Nasreen Sultana, MBBS, MD (Endocrinology)',
    publishedDate: 'Sep 24, 2026',
    readTime: '6 min read',
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
    `,
    relatedIds: ['art-3', 'art-7'],
    featured: false
  },
  {
    id: 'art-3',
    title: 'Safe Medicine Storage & Antibiotic Stewardship',
    category: 'Medicine Awareness',
    author: 'Prof. S. K. Das, MPharm, Clinical Pharmacologist',
    publishedDate: 'Sep 20, 2026',
    readTime: '4 min read',
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
    relatedIds: ['art-2', 'art-4'],
    featured: false
  },
  {
    id: 'art-4',
    title: 'Essential Nutritional Milestones During Pregnancy',
    category: 'Maternal Health',
    author: 'Dr. Farhana Yasmin, MBBS, DGO, MCPS (Obs & Gynae)',
    publishedDate: 'Sep 15, 2026',
    readTime: '7 min read',
    summary: 'Trimester-by-trimester nutritional advice, importance of folic acid and elemental iron supplementation, and warning signs of gestational hypertension.',
    content: `
A balanced maternal diet and consistent antenatal checkups (ANC) ensure optimal fetal organ development and protect the expectant mother from maternal morbidity.

### Trimester Essentials
- **First Trimester (Weeks 1–12):** Daily Folic Acid (400–800 mcg) is critical to prevent neural tube defects. Focus on hydration to combat morning nausea.
- **Second Trimester (Weeks 13–27):** Increase dietary calcium and iron. Start elemental iron and calcium supplementation separated by at least 2 hours for optimal absorption.
- **Third Trimester (Weeks 28–40):** High-quality protein intake supports rapid fetal brain and muscular growth.

### Danger Signs in Pregnancy
Contact your obstetrician immediately if you observe:
- Sudden swelling of face and hands with persistent headache (indicative of pre-eclampsia)
- Any vaginal spotting or bleeding
- Reduced fetal movements after 28 weeks
    `,
    relatedIds: ['art-6', 'art-1'],
    featured: false
  },
  {
    id: 'art-5',
    title: 'Pediatric Fever Management & Dehydration Warning Signs',
    category: 'Child Health',
    author: 'Dr. K. M. Hossain, MBBS, DCH (Pediatrics)',
    publishedDate: 'Sep 10, 2026',
    readTime: '5 min read',
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
    relatedIds: ['art-1', 'art-4'],
    featured: false
  },
  {
    id: 'art-6',
    title: 'Recognizing Acute Stroke: The F.A.S.T Protocol',
    category: 'Emergency Awareness',
    author: 'Dr. Tariqul Islam, MBBS, FCPS (Neurology)',
    publishedDate: 'Sep 05, 2026',
    readTime: '4 min read',
    summary: 'Time is brain tissue. Every minute lost during an acute ischemic stroke leads to irreversible neuron loss. Learn the rapid F.A.S.T screening method.',
    content: `
Acute ischemic stroke occurs when blood flow to an area of the brain is obstructed. The window for effective thrombolytic therapy is narrow (within 3 to 4.5 hours of symptom onset).

### The F.A.S.T. Assessment
- **F - Face Drooping:** Ask the person to smile. Does one side of the face droop or feel numb?
- **A - Arm Weakness:** Ask the person to raise both arms. Does one arm drift downward?
- **S - Speech Difficulty:** Is speech slurred, strange, or difficult to understand?
- **T - Time to Call 999:** If any of these signs are present, call emergency services immediately or transport the patient directly to Rajshahi Medical College Hospital with stroke facilities.

### What NOT to Do
- Do not feed the patient or give water, as swallowing reflexes may be impaired and lead to aspiration.
- Do not administer blood thinners or aspirin at home before a non-contrast CT brain scan confirms whether the stroke is ischemic or hemorrhagic.
    `,
    relatedIds: ['art-1', 'art-7'],
    featured: false
  },
  {
    id: 'art-7',
    title: 'Heart-Healthy Dietary Patterns for South Asian Lifestyles',
    category: 'Nutrition',
    author: 'Nusrat Jahan, BSc (Nutrition), MSc (Dietetics)',
    publishedDate: 'Aug 28, 2026',
    readTime: '5 min read',
    summary: 'Practical dietary swaps for traditional Bangladeshi cooking to lower LDL cholesterol, reduce arterial inflammation, and regulate hypertension.',
    content: `
South Asians have a documented genetic predisposition to premature coronary artery disease. Modifying traditional cooking practices can dramatically lower cardiovascular risk.

### Practical Kitchen Swaps
- **Cooking Oil Moderation:** Restrict cooking oil to 500 mL per person per month. Avoid reheating vegetable oils repeatedly, which produces harmful trans-fats.
- **Sodium Control:** Keep total salt intake under 5 grams (approx 1 level teaspoon) daily. Avoid table salt on raw salads and fruit.
- **Incorporate Seeds & Nuts:** A small handful (30g) of unsalted almonds or walnuts provides cardioprotective omega-3 fatty acids.
- **Spices as Antioxidants:** Turmeric, garlic, and ginger carry natural anti-inflammatory compounds that support vascular endothelium health.
    `,
    relatedIds: ['art-2', 'art-6'],
    featured: false
  },
  {
    id: 'art-8',
    title: 'Routine Health Screenings by Decade: 20s, 30s, 40s and Beyond',
    category: 'General Wellness',
    author: 'Dr. Shahriar Kabir, MBBS, MPH',
    publishedDate: 'Aug 20, 2026',
    readTime: '6 min read',
    summary: 'A preventative health roadmap detailing which annual tests, lipid profiles, and cancer screenings are medically recommended at each stage of life.',
    content: `
Preventive medicine saves lives by detecting hypertension, dyslipidemia, and metabolic disturbances long before overt clinical symptoms manifest.

### Recommended Screening Schedule
- **Age 20–29:** Baseline blood pressure, lipid profile every 5 years, annual dental and visual checkup.
- **Age 30–39:** Annual fasting blood glucose/HbA1c, liver and renal function tests, cervical Pap smear for women every 3 years.
- **Age 40–49:** Annual cardiovascular risk assessment, baseline ECG, mammography screening for women starting at age 40.
- **Age 50+:** Colon cancer screening (fecal occult blood or colonoscopy), bone density (DEXA) scan, prostate assessment for men.
    `,
    relatedIds: ['art-2', 'art-8'],
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

              {/* Formatted Content */}
              <div style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--color-text-secondary, #2f4847)',
                whiteSpace: 'pre-line'
              }}>
                {activeArticle.content.trim()}
              </div>

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
