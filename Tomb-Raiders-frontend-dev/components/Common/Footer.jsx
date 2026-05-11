import React from 'react';
import PropTypes from 'prop-types';
import WebLogo from './WebLogo';

const footerTexts = [
  '상호명 : Makertion | 대표자명 : 황성현 | 사업자등록번호 : 627-11-03128 | 통신판매업신고번호 : (미정) | 본사 : 한라대길 28',
  '이용약관 | 개인정보처리방침 | 고객지원 센터 : novasub05@gmail.com | 운영 시간: (예: 평일 10:00 ~ 18:00)',
];

function Footer({ vw }) {
  return (
    <footer
      className="w-full bg-[#ffffff] border-t border-[#EAEAEA] flex items-center justify-center"
      style={{ padding: `${vw(40)} 0` }}
    >
      <div className="flex items-center" style={{ width: vw(1200), gap: vw(40) }}>
        <WebLogo targetPath="/" className="mb-0 grayscale opacity-70" />
        <div style={{ fontSize: vw(12), color: '#888', lineHeight: 1.6 }}>
          {footerTexts.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p className="mt-2">Copyright © Makertion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  vw: PropTypes.func.isRequired,
};

export default Footer;
