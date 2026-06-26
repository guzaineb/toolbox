'use client';

export function LoginSVG() {
  return (
    <svg viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2d7a52" stopOpacity=".35"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity=".2"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="180" rx="200" ry="180" fill="url(#glow1)"/>
      <ellipse cx="300" cy="420" rx="160" ry="140" fill="url(#glow2)"/>
      <g className="animate-float" style={{ transformOrigin: '180px 200px' }}>
        <polygon points="180,80 260,128 260,224 180,272 100,224 100,128" fill="none" stroke="#2d7a52" strokeWidth="1" opacity=".5"/>
      </g>
      <g className="animate-float-delayed" style={{ transformOrigin: '180px 200px' }}>
        <polygon points="180,105 242,140 242,210 180,245 118,210 118,140" fill="none" stroke="#5d9e78" strokeWidth=".7" opacity=".4"/>
      </g>
      <g className="animate-float" style={{ transformOrigin: '270px 160px' }}>
        <rect x="250" y="140" width="40" height="40" rx="8" fill="none" stroke="#c9a84c" strokeWidth="1" opacity=".5"/>
        <rect x="258" y="148" width="24" height="24" rx="5" fill="#c9a84c" opacity=".12"/>
      </g>
      <g className="animate-float-slow" style={{ transformOrigin: '60px 300px' }}>
        <circle cx="60" cy="300" r="24" fill="none" stroke="#2d7a52" strokeWidth="1" opacity=".5"/>
        <circle cx="60" cy="300" r="12" fill="#2d7a52" opacity=".15"/>
      </g>
      <g className="animate-float-reverse" style={{ transformOrigin: '290px 370px' }}>
        <polygon points="290,350 310,380 270,380" fill="none" stroke="#5d9e78" strokeWidth="1" opacity=".4"/>
      </g>
      <g style={{ transformOrigin: '180px 200px' }}>
        <circle cx="180" cy="200" r="60" fill="#162d1f" stroke="#2d7a52" strokeWidth="1"/>
        <text x="180" y="220" textAnchor="middle" dominantBaseline="middle" fontFamily="Syne" fontSize="24" fontWeight="700" letterSpacing=".5">
    <tspan fill="#a0e0b8">Project</tspan>
    <tspan fill="#c9a84c">Struct</tspan>
  </text>  </g>
      <line x1="180" y1="152" x2="180" y2="80" stroke="#2d7a52" strokeWidth=".7" opacity=".4"/>
      <line x1="180" y1="248" x2="180" y2="340" stroke="#2d7a52" strokeWidth=".7" opacity=".3"/>
      <line x1="132" y1="176" x2="70" y2="150" stroke="#2d7a52" strokeWidth=".7" opacity=".3"/>
      <line x1="228" y1="176" x2="290" y2="150" stroke="#5d9e78" strokeWidth=".7" opacity=".3"/>
      <circle cx="180" cy="200" r="70" fill="none" stroke="#2d7a52" strokeWidth=".5" strokeDasharray="8 6" opacity=".3"
        className="animate-spin-slow" style={{ transformOrigin: '180px 200px' }}/>
      <circle cx="180" cy="200" r="90" fill="none" stroke="#5d9e78" strokeWidth=".5" strokeDasharray="4 10" opacity=".2"
        className="animate-spin-reverse" style={{ transformOrigin: '180px 200px' }}/>
      <circle cx="180" cy="70" r="5" fill="#2d7a52" opacity=".7" className="animate-pulse-slow"/>
      <circle cx="100" cy="128" r="4" fill="#5d9e78" opacity=".5" className="animate-pulse-slow" style={{ animationDelay: '.8s' }}/>
      <circle cx="260" cy="128" r="4" fill="#c9a84c" opacity=".5" className="animate-pulse-slow" style={{ animationDelay: '1.4s' }}/>
      <path d="M0,480 Q180,420 360,480 L360,600 L0,600 Z" fill="#0a1810" opacity=".8"/>
    </svg>
  );
}

export function RegisterSVG() {
  return (
    <svg viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="glow3" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1a5c3a" stopOpacity=".5"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
        {/* Flèche gradient */}
        <linearGradient id="arrowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d7a52" stopOpacity=".6"/>
          <stop offset="100%" stopColor="#c9a84c" stopOpacity=".6"/>
        </linearGradient>
        <linearGradient id="arrowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity=".6"/>
          <stop offset="100%" stopColor="#5d9e78" stopOpacity=".6"/>
        </linearGradient>
      </defs>
      
      {/* Fond avec effet de glow */}
      <ellipse cx="180" cy="200" rx="220" ry="200" fill="url(#glow3)"/>
      
      {/* Cercles concentriques animés */}
      <g className="animate-float" style={{ transformOrigin: '180px 220px' }}>
        <circle cx="180" cy="220" r="120" fill="none" stroke="#2d7a52" strokeWidth=".8" opacity=".3" strokeDasharray="6 8"/>
        <circle cx="180" cy="220" r="95" fill="none" stroke="#5d9e78" strokeWidth=".6" opacity=".4"/>
        <circle cx="180" cy="220" r="70" fill="none" stroke="#c9a84c" strokeWidth=".7" opacity=".3" strokeDasharray="4 6"/>
        <circle cx="180" cy="220" r="70" fill="#162d1f" stroke="#2d7a52" strokeWidth="1.5"/>
      </g>
<g className="animate-pulse-slow" style={{ transformOrigin: "180px 220px" }}>
  <text x="180" y="220" textAnchor="middle" dominantBaseline="middle" fontFamily="Syne" fontSize="24" fontWeight="700" letterSpacing=".5">
    <tspan fill="#a0e0b8">Project</tspan>
    <tspan fill="#c9a84c">Struct</tspan>
  </text>
</g>
      {/* Particules animées */}
      <circle cx="140" cy="140" r="5" fill="#5d9e78" opacity=".6" />
      <circle cx="230" cy="160" r="4" fill="#c9a84c" opacity=".5" />
      <circle cx="120" cy="300" r="3" fill="#2d7a52" opacity=".5" />
      <circle cx="250" cy="320" r="4" fill="#5d9e78" opacity=".4" />
      
      <g opacity=".5">
        {/* Ligne Porteur ←→ Projet */}
        <line x1="95" y1="420" x2="155" y2="405" stroke="#2d7a52" strokeWidth="1.2" strokeDasharray="4 3" className="animate-float"/>
        {/* Ligne Projet ←→ Expert */}
        <line x1="205" y1="405" x2="265" y2="420" stroke="#5d9e78" strokeWidth="1.2" strokeDasharray="4 3" className="animate-float-delayed"/>
        {/* Ligne Porteur ←→ Expert */}
        <line x1="100" y1="440" x2="260" y2="440" stroke="#c9a84c" strokeWidth=".8" strokeDasharray="3 5" opacity=".4"/>
      </g>
      {/* Cercle Porteur de projet (gauche) */}
      <g className="animate-float-slow" style={{ transformOrigin: '60px 420px' }}>
        <circle cx="60" cy="420" r="32" fill="#162d1f" stroke="#2d7a52" strokeWidth="1.5"/>
        <circle cx="60" cy="420" r="38" fill="none" stroke="#2d7a52" strokeWidth=".5" strokeDasharray="3 3" opacity=".4"/>
        <text x="60" y="416" textAnchor="middle" fontFamily="DM Sans" fontSize="14" fill="#5d9e78">💡</text>
        <text x="60" y="438" textAnchor="middle" fontFamily="DM Sans" fontSize="9" fontWeight="600" fill="#5d9e78">Porteur</text>
      </g>
      
      {/* Cercle Projet (centre) */}
      <g className="animate-float" style={{ transformOrigin: '180px 400px' }}>
        <circle cx="180" cy="400" r="32" fill="#162d1f" stroke="#c9a84c" strokeWidth="1.5"/>
        <circle cx="180" cy="400" r="38" fill="none" stroke="#c9a84c" strokeWidth=".5" strokeDasharray="3 3" opacity=".4"/>
        <text x="180" y="396" textAnchor="middle" fontFamily="DM Sans" fontSize="14" fill="#c9a84c">🏢</text>
        <text x="180" y="418" textAnchor="middle" fontFamily="DM Sans" fontSize="9" fontWeight="600" fill="#c9a84c">Incubation</text>
      </g>
      
      {/* Cercle Expert (droite) */}
      <g className="animate-float-delayed" style={{ transformOrigin: '300px 420px' }}>
        <circle cx="300" cy="420" r="32" fill="#162d1f" stroke="#5d9e78" strokeWidth="1.5"/>
        <circle cx="300" cy="420" r="38" fill="none" stroke="#5d9e78" strokeWidth=".5" strokeDasharray="3 3" opacity=".4"/>
        <text x="300" y="416" textAnchor="middle" fontFamily="DM Sans" fontSize="14" fill="#5d9e78">🎓</text>
        <text x="300" y="438" textAnchor="middle" fontFamily="DM Sans" fontSize="9" fontWeight="600" fill="#5d9e78">Expert</text>
      </g>      
      {/* Étoiles décoratives */}
      <text x="30" y="180" fontSize="12" fill="#c9a84c" opacity=".4" className="animate-float">✦</text>
      <text x="310" y="200" fontSize="10" fill="#5d9e78" opacity=".5" className="animate-float-delayed">✦</text>
      <text x="170" y="100" fontSize="8" fill="#2d7a52" opacity=".6" className="animate-pulse-slow">✦</text>
      <text x="280" y="350" fontSize="11" fill="#c9a84c" opacity=".3" className="animate-float-reverse">✦</text>
      <text x="50" y="350" fontSize="9" fill="#5d9e78" opacity=".4" className="animate-float-slow">✦</text>
      
      {/* Vague de fond */}
      <path d="M0,500 Q180,460 360,500 L360,600 L0,600 Z" fill="#0a1810" opacity=".9"/>
    </svg>
  );
}
export function VerifySVG() {
  return (
    <svg viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="glow4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity=".3"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="300" rx="180" ry="200" fill="url(#glow4)"/>
      <g className="animate-float-delayed" style={{ transformOrigin: '180px 280px' }}>
        <rect x="80" y="220" width="200" height="140" rx="12" fill="#162d1f" stroke="#c9a84c" strokeWidth="1.5"/>
        <polyline points="80,220 180,290 280,220" fill="none" stroke="#c9a84c" strokeWidth="1.5"/>
        <circle cx="180" cy="350" r="8" fill="#c9a84c" opacity=".6" className="animate-pulse-slow"/>
      </g>
      <circle cx="60" cy="160" r="5" fill="#2d7a52" opacity=".5" className="animate-pulse-slow"/>
      <circle cx="300" cy="180" r="4" fill="#5d9e78" opacity=".5" className="animate-pulse-slow" style={{ animationDelay: '.5s' }}/>
      <circle cx="100" cy="420" r="6" fill="#c9a84c" opacity=".4" className="animate-pulse-slow" style={{ animationDelay: '1s' }}/>
      <text x="50" y="200" fontSize="14" fill="#c9a84c" opacity=".4" className="animate-float">✦</text>
      <text x="290" y="150" fontSize="10" fill="#5d9e78" opacity=".5" className="animate-float-delayed">✦</text>
      <text x="310" y="440" fontSize="12" fill="#c9a84c" opacity=".4" className="animate-float-reverse">✦</text>
      <path d="M0,520 Q180,470 360,520 L360,600 L0,600 Z" fill="#0a1810" opacity=".9"/>
    </svg>
  );
}

export function Onboard1SVG() {
  return (
    <svg viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="glow5" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#2d7a52" stopOpacity=".4"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="200" rx="220" ry="180" fill="url(#glow5)"/>
      <g className="animate-float" style={{ transformOrigin: '180px 180px' }}>
        <circle cx="180" cy="130" r="40" fill="#162d1f" stroke="#2d7a52" strokeWidth="1.5"/>
        <text x="180" y="138" textAnchor="middle" fontFamily="DM Sans" fontSize="24" fill="#5d9e78">👤</text>
        <path d="M110,220 Q180,200 250,220" stroke="#2d7a52" strokeWidth="1.5" fill="none"/>
        <path d="M80,260 Q180,230 280,260" stroke="#5d9e78" strokeWidth="1" fill="none" opacity=".6"/>
      </g>
      <g transform="translate(30,300)">
        <rect x="0" y="0" width="8" height="160" rx="4" fill="#162d1f" stroke="#2d7a52" strokeWidth=".5"/>
        <rect x="0" y="0" width="8" height="54" rx="4" fill="#2d7a52"/>
        <circle cx="4" cy="0" r="6" fill="#2d7a52"/>
        <circle cx="4" cy="54" r="4" fill="#5d9e78"/>
        <circle cx="4" cy="108" r="3" fill="#162d1f" stroke="#2d7a52" strokeWidth=".5"/>
        <circle cx="4" cy="160" r="3" fill="#162d1f" stroke="#2d7a52" strokeWidth=".5"/>
        <text x="20" y="4" fontFamily="DM Sans" fontSize="10" fill="#5d9e78">Profil</text>
        <text x="20" y="58" fontFamily="DM Sans" fontSize="10" fill="#6b8f7a">Rôle</text>
        <text x="20" y="112" fontFamily="DM Sans" fontSize="10" fill="#3a4d3f">Confirmation</text>
      </g>
      <path d="M0,500 Q180,450 360,500 L360,600 L0,600 Z" fill="#0a1810" opacity=".9"/>
    </svg>
  );
}

export function Onboard2SVG() {
  return (
    <svg viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="glow6" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity=".25"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="280" rx="200" ry="180" fill="url(#glow6)"/>
      <g className="animate-float" style={{ transformOrigin: '90px 220px' }}>
        <circle cx="90" cy="220" r="36" fill="#162d1f" stroke="#2d7a52" strokeWidth="1.2"/>
        <text x="90" y="228" textAnchor="middle" fontSize="20" fill="#5d9e78">💡</text>
      </g>
      <g className="animate-float-delayed" style={{ transformOrigin: '180px 150px' }}>
        <circle cx="180" cy="150" r="44" fill="#162d1f" stroke="#c9a84c" strokeWidth="1.5"/>
        <text x="180" y="160" textAnchor="middle" fontSize="24" fill="#c9a84c">◈</text>
      </g>
      <g className="animate-float-reverse" style={{ transformOrigin: '270px 220px' }}>
        <circle cx="270" cy="220" r="36" fill="#162d1f" stroke="#5d9e78" strokeWidth="1.2"/>
        <text x="270" y="228" textAnchor="middle" fontSize="20" fill="#5d9e78">🏢</text>
      </g>
      <line x1="122" y1="204" x2="143" y2="165" stroke="#c9a84c" strokeWidth=".8" opacity=".5" strokeDasharray="4 3"/>
      <line x1="238" y1="204" x2="217" y2="165" stroke="#c9a84c" strokeWidth=".8" opacity=".5" strokeDasharray="4 3"/>
      <line x1="126" y1="220" x2="234" y2="220" stroke="#2d7a52" strokeWidth=".8" opacity=".4" strokeDasharray="4 3"/>
      <text x="90" y="268" textAnchor="middle" fontFamily="DM Sans" fontSize="11" fill="#6b8f7a">Porteur</text>
      <text x="180" y="206" textAnchor="middle" fontFamily="DM Sans" fontSize="11" fill="#9a7a30">Sélectionné</text>
      <text x="270" y="268" textAnchor="middle" fontFamily="DM Sans" fontSize="11" fill="#6b8f7a">Incubateur</text>
      <circle cx="60" cy="380" r="4" fill="#2d7a52" opacity=".5" className="animate-pulse-slow"/>
      <circle cx="300" cy="380" r="4" fill="#5d9e78" opacity=".5" className="animate-pulse-slow" style={{ animationDelay: '.8s' }}/>
      <circle cx="180" cy="360" r="4" fill="#c9a84c" opacity=".5" className="animate-pulse-slow" style={{ animationDelay: '1.4s' }}/>
      <path d="M0,500 Q180,460 360,500 L360,600 L0,600 Z" fill="#0a1810" opacity=".9"/>
    </svg>
  );
}

export function ForgotSVG() {
  return (
    <svg viewBox="0 0 360 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="glow7" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#2d7a52" stopOpacity=".3"/>
          <stop offset="100%" stopColor="#0f1f16" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="230" rx="200" ry="180" fill="url(#glow7)"/>
      <g className="animate-float-delayed" style={{ transformOrigin: '180px 240px' }}>
        <rect x="130" y="220" width="100" height="80" rx="12" fill="#162d1f" stroke="#2d7a52" strokeWidth="1.5"/>
        <path d="M155,220 L155,195 Q155,170 180,170 Q205,170 205,195 L205,220"
          fill="none" stroke="#2d7a52" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="180" cy="258" r="10" fill="#2d7a52"/>
        <rect x="177" y="257" width="6" height="16" rx="2" fill="#162d1f"/>
      </g>
      <g className="animate-float" style={{ transformOrigin: '60px 140px' }}>
        <text x="60" y="148" fontSize="28" fill="#c9a84c" opacity=".5">🔑</text>
      </g>
      <text x="280" y="180" fontSize="12" fill="#5d9e78" opacity=".5" className="animate-pulse-slow">✦</text>
      <text x="100" y="380" fontSize="10" fill="#c9a84c" opacity=".4" className="animate-pulse-slow" style={{ animationDelay: '.6s' }}>✦</text>
      <text x="300" y="380" fontSize="14" fill="#2d7a52" opacity=".4" className="animate-pulse-slow" style={{ animationDelay: '1.2s' }}>✦</text>
      <circle cx="60" cy="350" r="20" fill="#162d1f" stroke="#2d7a52" strokeWidth=".8" opacity=".6"/>
      <circle cx="300" cy="430" r="16" fill="#162d1f" stroke="#5d9e78" strokeWidth=".8" opacity=".5"/>
      <path d="M0,510 Q180,470 360,510 L360,600 L0,600 Z" fill="#0a1810" opacity=".9"/>
    </svg>
  );
}