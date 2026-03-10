// src/daifugo/components/FullRuleBook.jsx
import React from 'react';
import { useLanguage } from '../LanguageContext';

export default function FullRuleBook({ onClose }) {
  const { t } = useLanguage();

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginTop: 0, color: '#2980b9' }}>{t('frTitle')}</h2>
        
        <div style={scrollArea}>
          <p style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#e74c3c' }}>
            {t('frGoal')}
          </p>
          
          <div style={sectionStyle}>
            <h4>{t('frBasicTitle')}</h4>
            <p>{t('frBasicDesc')}</p>
          </div>

          <div style={sectionStyle}>
            <h4>{t('frPlayTitle')}</h4>
            <p>{t('frPlayDesc')}</p>
          </div>

          <div style={sectionStyle}>
            <h4>{t('frPassTitle')}</h4>
            <p>{t('frPassDesc')}</p>
          </div>

          <div style={sectionStyle}>
            <h4>{t('frRankTitle')}</h4>
            <p>{t('frRankDesc')}</p>
          </div>
          
          <div style={{ ...sectionStyle, borderBottom: 'none' }}>
            <h4>{t('ruleTitle')}</h4>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>{t('rRev')}</li>
              <li>{t('r5')}</li>
              <li>{t('r7')}</li>
              <li>{t('r8')}</li>
              <li>{t('r10')}</li>
              <li>{t('r11')}</li>
              <li>{t('r12')}</li>
              <li>{t('rSp3')}</li>
            </ul>
          </div>
        </div>

        <button className="main-btn" onClick={onClose} style={{ background: '#34495e', width: '100%', marginTop: '15px' }}>
          {t('closeBtn')}
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
  display: 'flex', justifyContent: 'center', alignItems: 'center'
};

const modalStyle = {
  backgroundColor: '#fff', color: '#333', padding: '20px', 
  borderRadius: '15px', width: '90%', maxWidth: '500px',
  maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
};

const scrollArea = {
  overflowY: 'auto', flex: 1, textAlign: 'left',
  paddingRight: '10px', lineHeight: '1.6'
};

const sectionStyle = {
  borderBottom: '1px solid #bdc3c7', paddingBottom: '15px', marginBottom: '15px'
};