import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { NiramoyIcon } from '../Common/NiramoyLogo';
import { useLanguage } from '../../i18n';

export default function NiramoyFooter() {
  const currentYear = new Date().getFullYear();
  const { t, isBangla } = useLanguage();

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <footer className="niramoy-simple-footer" role="contentinfo" aria-label="Site footer">
      <div className="footer-container">
        
        {/* Main Grid: Left Brand Block + 3 Simple Link Columns */}
        <div className="footer-grid">

          {/* Left Block: Brand, Contact Info, Social Media */}
          <div className="footer-brand-col">
            <Link to="/" onClick={handleNavClick} className="footer-logo-wrap" aria-label="Niramoy Homepage">
              <NiramoyIcon size={34} glow={false} />
              <span className="footer-brand-text">NIRAMOY</span>
            </Link>

            <div className="footer-contact-list">
              <a href="tel:+8801700647266" className="footer-contact-item">
                <Phone size={17} className="footer-contact-icon" />
                <span>+880 1700-647266</span>
              </a>

              <a href="mailto:support@niramoy.health" className="footer-contact-item">
                <Mail size={17} className="footer-contact-icon" />
                <span>support@niramoy.health</span>
              </a>

              <div className="footer-contact-item">
                <MapPin size={17} className="footer-contact-icon" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{isBangla ? 'মেডিকেল মোড়, লক্ষ্মীপুর, রাজশাহী - ৬০০০' : 'Medical Mor, Laxmipur, Rajshahi - 6000'}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="footer-social-row">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 1: Company */}
          <div className="footer-links-col footer-col-company">
            <h3 className="footer-col-title">{isBangla ? 'কোম্পানি' : 'Company'}</h3>
            <div className="footer-links-list">
              <Link to="/about" onClick={handleNavClick} className="footer-nav-link">{isBangla ? 'আমাদের সম্পর্কে' : 'About us'}</Link>
              <Link to="/health-tips" onClick={handleNavClick} className="footer-nav-link">{isBangla ? 'স্বাস্থ্য পরামর্শ' : 'Health Tips'}</Link>
              <Link to="/contact" onClick={handleNavClick} className="footer-nav-link">{t('footer.contactUs', 'Contact us')}</Link>
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="footer-links-col footer-col-services">
            <h3 className="footer-col-title">{t('footer.medicalServices', 'Services')}</h3>
            <div className="footer-links-list">
              <Link to="/doctors" onClick={handleNavClick} className="footer-nav-link">{t('nav.doctors', 'Doctors')}</Link>
              <Link to="/hospitals" onClick={handleNavClick} className="footer-nav-link">{t('nav.hospitals', 'Hospitals and Clinics')}</Link>
              <Link to="/ambulance" onClick={handleNavClick} className="footer-nav-link">{t('nav.ambulance', 'Ambulance')}</Link>
              <Link to="/ai" onClick={handleNavClick} className="footer-nav-link">{t('nav.ai', 'Niramoy AI')}</Link>
              <Link to="/facilities" onClick={handleNavClick} className="footer-nav-link">{t('nav.facilities', 'Find a facility')}</Link>
            </div>
          </div>

          {/* Column 3: Legal */}
          <div className="footer-links-col footer-col-legal">
            <h3 className="footer-col-title">{isBangla ? 'আইনি তথ্য' : 'Legal'}</h3>
            <div className="footer-links-list">
              <Link to="/terms" onClick={handleNavClick} className="footer-nav-link">{t('footer.terms', 'Terms of Service')}</Link>
              <Link to="/privacy" onClick={handleNavClick} className="footer-nav-link">{t('footer.privacy', 'Privacy Policy')}</Link>
              <Link to="/cookie-policy" onClick={handleNavClick} className="footer-nav-link">{t('footer.cookies', 'Cookie Policy')}</Link>
              <Link to="/disclaimer" onClick={handleNavClick} className="footer-nav-link">{t('footer.disclaimer', 'Disclaimer')}</Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className="footer-bottom-row">
          <p className="footer-copyright">
            {t('footer.copyright', `© ${currentYear} Niramoy. All rights reserved.`)}
          </p>
        </div>

      </div>

      <style>{`
        .niramoy-simple-footer {
          background-color: #ffffff;
          color: #475569;
          border-top: 1px solid #e2e8f0;
          padding-top: 56px;
          padding-bottom: 36px;
          font-family: var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        /* Brand Column */
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-logo-wrap {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
          margin-bottom: 4px;
          transition: opacity 0.2s ease;
        }

        .footer-logo-wrap:hover {
          opacity: 0.88;
        }

        .footer-brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #0d7c6e;
          font-family: var(--font-heading, inherit);
        }

        .footer-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #475569;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.18s ease;
          line-height: 1.45;
        }

        .footer-contact-item:hover {
          color: #0d7c6e;
        }

        .footer-contact-icon {
          color: #0d7c6e;
          flex-shrink: 0;
        }

        /* Social Icons */
        .footer-social-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .footer-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: #475569;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .footer-social-btn:hover {
          color: #0d7c6e;
          background: #f0faf9;
          border-color: #9de2da;
          transform: translateY(-2px);
        }

        /* Link Columns */
        .footer-links-col {
          display: flex;
          flex-direction: column;
        }

        .footer-col-title {
          font-size: 0.96rem;
          font-weight: 700;
          color: #334155;
          margin: 0 0 18px 0;
          letter-spacing: 0.01em;
        }

        .footer-links-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-nav-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 500;
          transition: color 0.18s ease, transform 0.18s ease;
          display: inline-block;
          width: fit-content;
        }

        .footer-nav-link:hover {
          color: #0d7c6e;
          transform: translateX(3px);
        }

        /* Bottom Row */
        .footer-bottom-row {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
        }

        .footer-copyright {
          margin: 0;
          font-size: 0.84rem;
          color: #94a3b8;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1.2fr 1fr;
            gap: 36px 24px;
          }
        }

        @media (max-width: 768px) {
          .niramoy-simple-footer {
            padding-top: 40px;
            padding-bottom: 28px;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px 16px;
          }

          .footer-brand-col {
            grid-column: 1 / -1;
            margin-bottom: 6px;
          }

          .footer-col-company {
            grid-column: 1;
          }

          .footer-col-services {
            grid-column: 2;
          }

          .footer-col-legal {
            grid-column: 1 / -1;
            margin-top: 8px;
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
          }

          .footer-col-legal .footer-links-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 16px;
          }

          .footer-nav-link {
            font-size: 0.92rem;
            padding: 3px 0;
          }

          .footer-bottom-row {
            margin-top: 32px;
            padding-top: 18px;
          }
        }
      `}</style>
    </footer>
  );
}
