// FormattedAI brand kit — Logo + Icon components shared across pages
// Loaded BEFORE other JSX scripts. Exports to window.

const FALogo = ({ size = 24, href = 'Home.html', wordmark = true, asLink = true }) => {
  const Tag = asLink ? 'a' : 'span';
  const linkProps = asLink ? { href } : {};
  return (
  <Tag {...linkProps} style={{display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', color:'#fff', whiteSpace:'nowrap'}}>
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="FormattedAI">
      <defs>
        <linearGradient id="fa-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a78bfa"/>
          <stop offset="1" stopColor="#5b4bd4"/>
        </linearGradient>
      </defs>
      {/* outer ring suggesting "container / format" */}
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#fa-grad)" strokeWidth="1.6" fill="rgba(124,108,240,.06)"/>
      {/* stylized F = three horizontal bars descending in length */}
      <rect x="9"  y="8"  width="14" height="2.4" rx="1.2" fill="url(#fa-grad)"/>
      <rect x="9"  y="14" width="10" height="2.4" rx="1.2" fill="url(#fa-grad)"/>
      <rect x="9"  y="20" width="6"  height="2.4" rx="1.2" fill="#a78bfa"/>
      {/* dot — "AI" pulse */}
      <circle cx="22.5" cy="21.2" r="1.8" fill="#a78bfa"/>
    </svg>
    {wordmark && (
      <span style={{fontFamily:'"Fraunces", serif', fontSize:18, fontWeight:500, letterSpacing:'-0.015em', color:'#fff'}}>
        formatted<span style={{fontStyle:'italic', color:'#a78bfa', fontWeight:400}}>ai</span>
      </span>
    )}
  </Tag>
  );
};

const FAIcon = ({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => {
  const s = strokeWidth;
  const sets = {
    // Categories
    text:    <g stroke={color} strokeWidth={s} strokeLinecap="round" fill="none"><path d="M4 6h16M4 12h12M4 18h16"/></g>,
    image:   <g stroke={color} strokeWidth={s} fill="none"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 15l-5-5-8 8" strokeLinejoin="round"/></g>,
    doc:     <g stroke={color} strokeWidth={s} fill="none" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6" strokeLinecap="round"/></g>,
    seo:     <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></g>,
    // Actions
    copy:    <g stroke={color} strokeWidth={s} fill="none"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></g>,
    paste:   <g stroke={color} strokeWidth={s} fill="none" strokeLinejoin="round"><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></g>,
    clear:   <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></g>,
    upload:  <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></g>,
    download:<g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></g>,
    arrow:   <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></g>,
    check:   <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6"/></g>,
    close:   <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round"><path d="M6 6l12 12M6 18 18 6"/></g>,
    search:  <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></g>,
    github:  <g fill={color}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.5 9.5 0 0 1 12 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></g>,
    rss:     <g fill={color}><circle cx="6" cy="18" r="2"/><path d="M4 4a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7zm0 6a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7z"/></g>,
    ext:     <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></g>,
    lock:    <g stroke={color} strokeWidth={s} fill="none" strokeLinecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g>,
    cmd:     <g stroke={color} strokeWidth={s} fill="none" strokeLinejoin="round"><path d="M9 9V6a2.5 2.5 0 1 0-2.5 2.5H9zm6 0V6a2.5 2.5 0 1 1 2.5 2.5H15zm0 6v3a2.5 2.5 0 1 0 2.5-2.5H15zm-6 0v3a2.5 2.5 0 1 1-2.5-2.5H9z M9 9h6v6H9z"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink: 0, display:'inline-block', verticalAlign:'middle'}}>
      {sets[name] || null}
    </svg>
  );
};

Object.assign(window, { FALogo, FAIcon });
