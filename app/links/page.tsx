import Link from "next/link";

const links = [
  { label: "Instagram", sub: "@cocotilo37", href: "https://instagram.com/cocotilo37", accent: true },
  { label: "YouTube", sub: "@cocotilo37", href: "https://youtube.com/@cocotilo37", accent: true },
  { label: "TikTok", sub: "@cocotilo_37", href: "https://tiktok.com/@cocotilo_37", accent: true },
  { label: "Plataforma de Coaching", sub: "Reserva sesiones y consulta tu progreso", href: "/coaching", accent: false, internal: true },
  { label: "Media Kit", sub: "Estadísticas y propuesta de patrocinio", href: "/assets/mediakit.png", accent: false },
  { label: "Contacto", sub: "cocotilo37@gmail.com", href: "mailto:cocotilo37@gmail.com", accent: false },
];

export const metadata = {
  title: "Links · Cocotilo37",
};

export default function LinksPage() {
  return (
    <div className="links-page">
      <Link href="/" className="back-link">← cocotilo37</Link>

      <div className="links-header">
        <img src="/logo.jpg" alt="Cocotilo37" className="links-logo" />
        <p className="links-tag">Creador de contenido · Sevilla, España</p>
        <h1>COCOTI<span className="white">LO</span><span className="red">37</span></h1>
        <p className="links-desc">Simracing · iRacing · Assetto Corsa</p>
      </div>

      <div className="links-list">
        {links.map((link) => {
          const content = (
            <>
              <span className="link-label">{link.label}</span>
              <span className="link-sub">{link.sub}</span>
            </>
          );
          return link.internal ? (
            <Link key={link.label} href={link.href} className={`link-item ${link.accent ? "accent" : ""}`}>
              {content}
            </Link>
          ) : (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={`link-item ${link.accent ? "accent" : ""}`}>
              {content}
            </a>
          );
        })}
      </div>

      <footer className="links-footer">
        <p>© 2026 cocotilo37 · Sevilla, España</p>
      </footer>

      <style>{`
        .links-page {
          min-height: 100vh;
          background: var(--black);
          color: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem 1.5rem 3rem;
          position: relative;
        }
        .back-link {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.7rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--home-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--white); }

        .links-header {
          text-align: center;
          margin-bottom: 2.5rem;
          max-width: 420px;
        }
        .links-logo {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 2px solid rgba(224,32,32,0.5);
          object-fit: cover;
          margin: 0 auto 1.25rem;
          display: block;
        }
        .links-tag {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 0.75rem;
        }
        .links-header h1 {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(2.5rem, 10vw, 3.5rem);
          letter-spacing: 2px;
          line-height: 1;
        }
        .links-header h1 .white { color: var(--white); }
        .links-header h1 .red { color: var(--red); }
        .links-desc {
          margin-top: 0.75rem;
          font-size: 0.9rem;
          color: var(--home-muted);
        }

        .links-list {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .link-item {
          display: flex;
          flex-direction: column;
          padding: 1rem 1.25rem;
          border: 1px solid var(--home-border);
          text-decoration: none;
          color: var(--white);
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .link-item:hover {
          border-color: var(--red);
          background: rgba(224,32,32,0.05);
          transform: translateY(-1px);
        }
        .link-item.accent {
          border-color: rgba(224,32,32,0.4);
          background: rgba(224,32,32,0.06);
        }
        .link-label {
          font-family: var(--font-bebas), sans-serif;
          font-size: 1.3rem;
          letter-spacing: 1px;
        }
        .link-sub {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.7rem;
          color: var(--home-muted);
          margin-top: 0.15rem;
        }

        .links-footer {
          margin-top: 3rem;
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--home-muted);
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
