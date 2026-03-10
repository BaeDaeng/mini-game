// src/daifugo/components/RuleBook.jsx
import React from 'react';
import { useLanguage } from '../LanguageContext';

export default function RuleBook({ onClose }) {
  const { t } = useLanguage();
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0, color: '#e74c3c' }}>{t('ruleTitle')}</h3>
        <ul style={{ lineHeight: '1.8', textAlign: 'left', marginBottom: '20px', paddingLeft: '20px', fontSize: '0.95em' }}>
          <li>{t('rRev')}</li>
          <li>{t('r5')}</li>
          <li>{t('r7')}</li>
          <li>{t('r8')}</li>
          <li>{t('r10')}</li>
          <li>{t('r11')}</li>
          <li>{t('r12')}</li>
          <li>{t('rSp3')}</li>
        </ul>
        <button className="main-btn" onClick={onClose} style={{ background: '#34495e', width: '100%' }}>{t('closeBtn')}</button>
      </div>
    </div>
  );
}
const overlayStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalStyle = { backgroundColor: '#fff', color: '#333', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' };