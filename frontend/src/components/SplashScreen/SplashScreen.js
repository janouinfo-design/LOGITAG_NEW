const SplashScreen = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0F172A',
      gap: '32px',
    }}>
      <style>{`
        @keyframes splashPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes splashSpin { to{transform:rotate(360deg)} }
        .splash-logo-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: rgba(37,99,235,0.12);
          border: 1px solid rgba(37,99,235,0.25);
          animation: splashPulse 2s ease-in-out infinite;
        }
        .splash-title {
          font-family: 'Manrope', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .splash-title span { color: #2563EB; }
        .splash-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(37,99,235,0.2);
          border-top-color: #2563EB;
          border-radius: 50%;
          animation: splashSpin 0.8s linear infinite;
        }
        .splash-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #64748B;
          margin: 0;
        }
      `}</style>
      <div className="splash-logo-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <h1 className="splash-title">Logi<span>TAG</span></h1>
      <div className="splash-spinner" />
      <p className="splash-text">Chargement de la plateforme...</p>
    </div>
  )
}

export default SplashScreen
