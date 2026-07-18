"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="site-nav">
        <a href="#hero" className="nav-logo">
          cocoti<span className="white">lo</span>
          <span>37</span>
        </a>
        <ul className="nav-links">
          <li><a href="#about">Sobre mí</a></li>
          <li><a href="#content">Contenido</a></li>
          <li><a href="#sponsorship">Patrocinio</a></li>
          <li><Link href="/coaching">Coaching</Link></li>
          <li><Link href="/links">Links</Link></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
      </nav>

      <section id="hero">
        <div className="hero-bg-text">SIM</div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-tag">Creador de contenido · Sevilla, España</p>
            <h1>
              COCOTI<span style={{ color: "var(--white)" }}>LO</span>
              <br />
              <span style={{ color: "var(--red)" }}>37</span>
            </h1>
            <p className="hero-desc">
              Simracing en iRacing y Assetto Corsa. Gameplays, técnicas de pilotaje y setups para ir más rápido.
            </p>
            <div className="hero-pill">27% engagement rate</div>
            <div className="hero-cta">
              <a href="https://instagram.com/cocotilo37" className="btn btn-red" target="_blank" rel="noreferrer">Instagram →</a>
              <Link href="/coaching" className="btn">Coaching</Link>
              <Link href="/links" className="btn">Todos mis links</Link>
            </div>
          </div>
          <div className="hero-logo-wrap">
            <img src="/logo.jpg" alt="Cocotilo37" className="hero-logo" />
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat-item reveal">
          <div className="stat-num">10.9K</div>
          <div className="stat-label">Seguidores</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">27%</div>
          <div className="stat-label">Engagement</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">4.5M</div>
          <div className="stat-label">Visitas totales</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">218</div>
          <div className="stat-label">Publicaciones</div>
        </div>
      </div>

      <section id="about">
        <p className="section-label reveal">Sobre mí</p>
        <div className="about-grid">
          <div className="reveal">
            <h2>PILOTO.<br />CREADOR.</h2>
            <div className="platforms-row">
              <span className="platform-tag active">iRacing</span>
              <span className="platform-tag active">Assetto Corsa</span>
            </div>
          </div>
          <div className="reveal">
            <p>Compito en simracing desde que descubrí que podía aprender a ir más rápido desde casa. iRacing y Assetto Corsa son mi pista de entrenamiento. Instagram es donde comparto cada décima que mejoro.</p>
            <p style={{ marginTop: "1rem" }}>Con base en Sevilla, compagino el simracing con sesiones reales de karting para trasladar lo aprendido en el simulador al asfalto. Mi objetivo es competir en más categorías y llevar el simracing hispanohablante a otro nivel.</p>
            <p style={{ marginTop: "1rem" }}>Mi audiencia no es casual — son simracers y apasionados del motor de España y LATAM que siguen el contenido de forma activa. Eso explica el 27% de engagement.</p>
          </div>
        </div>
      </section>

      <section id="content">
        <p className="section-label reveal">Contenido</p>
        <h2 className="reveal">LO QUE<br />PUBLICO</h2>
        <div className="content-grid">
          <div className="content-card reveal">
            <div className="card-num">01</div>
            <div className="card-title">Gameplays &amp; Carreras</div>
            <p className="card-desc">Onboards, batallas en pista y momentos clave de mis sesiones en iRacing y Assetto Corsa.</p>
          </div>
          <div className="content-card reveal">
            <div className="card-num">02</div>
            <div className="card-title">Tutoriales &amp; Técnica</div>
            <p className="card-desc">Consejos prácticos para mejorar el ritmo de vuelta: frenadas, trazadas, setup y mentalidad de piloto.</p>
          </div>
          <div className="content-card reveal">
            <div className="card-num">03</div>
            <div className="card-title">Setups</div>
            <p className="card-desc">Configuraciones y ajustes que uso en competición, explicados desde cero para que cualquiera los pueda aplicar.</p>
          </div>
          <div className="content-card reveal">
            <div className="card-num">04</div>
            <div className="card-title">Clips &amp; Highlights</div>
            <p className="card-desc">Los momentos que merece la pena guardar: adelantamientos, récords y caos en pista.</p>
          </div>
        </div>
      </section>

      <section id="sponsorship">
        <p className="section-label reveal">Patrocinio</p>
        <h2 className="reveal">TRABAJA<br />CONMIGO</h2>
        <div className="sponsorship-intro">
          <div className="reveal">
            <p>No son 10.900 seguidores cualquiera. Son simracers y aficionados al motor que interactúan, comentan y compran. Un nicho 100% cualificado, hispanohablante, con una comunidad que responde.</p>
            <p style={{ marginTop: "1rem" }}>La media de engagement en Instagram para creadores de este tamaño ronda el 3–6%. Aquí estamos en el 27%. Eso significa que cada publicación llega de verdad.</p>
          </div>
          <div className="engagement-callout reveal">
            <div className="big-num">27%</div>
            <div className="big-label">Engagement Rate</div>
            <div className="vs-line">vs. 3–6% media del sector</div>
          </div>
        </div>

        <p className="section-label reveal" style={{ marginBottom: "1.5rem" }}>Qué ofrezco</p>
        <ul className="offer-list">
          <li className="reveal">Mención y logo en directos en vivo</li>
          <li className="reveal">Livery del coche virtual personalizada</li>
          <li className="reveal">Clips y highlights con el producto integrado</li>
          <li className="reveal">Menciones en reels y vídeos</li>
          <li className="reveal">Posts y stories dedicados</li>
          <li className="reveal">Código de descuento de afiliado</li>
        </ul>

        <p className="section-label reveal" style={{ marginBottom: "1.5rem" }}>Mi audiencia</p>
        <div className="audience-grid">
          <div className="audience-item reveal">
            <div className="a-label">Nicho</div>
            <div className="a-value">100% Simracing &amp; Motor</div>
          </div>
          <div className="audience-item reveal">
            <div className="a-label">Idioma &amp; Región</div>
            <div className="a-value">Hispanohablante · España y LATAM</div>
          </div>
          <div className="audience-item reveal">
            <div className="a-label">Comunidad</div>
            <div className="a-value">Activa y comprometida</div>
          </div>
        </div>

        <div className="hero-cta reveal">
          <Link href="/links" className="btn btn-red">Ver media kit →</Link>
          <a href="#contact" className="btn">Contacto</a>
        </div>
      </section>

      <section id="contact">
        <p className="section-label reveal" style={{ justifyContent: "center" }}>Contacto</p>
        <h2 className="reveal">HABLEMOS.</h2>
        <p className="reveal">Para colaboraciones y patrocinios, escríbeme por Instagram o por email.</p>
        <div className="contact-links reveal">
          <a href="https://instagram.com/cocotilo37" className="btn btn-red" target="_blank" rel="noreferrer">@cocotilo37 — Instagram</a>
          <a href="https://youtube.com/@cocotilo37" className="btn btn-red" target="_blank" rel="noreferrer">@cocotilo37 — YouTube</a>
          <a href="https://tiktok.com/@cocotilo_37" className="btn btn-red" target="_blank" rel="noreferrer">@cocotilo_37 — TikTok</a>
        </div>
        <div className="contact-email reveal">
          <a href="mailto:cocotilo37@gmail.com">cocotilo37@gmail.com</a>
          &nbsp;·&nbsp;
          <Link href="/links">Todos mis links</Link>
        </div>
      </section>

      <footer>
        <p>© 2026 cocotilo37</p>
        <p>Sevilla, España · Simracing</p>
      </footer>

      <style jsx global>{`
        #hero, #about, #content, #sponsorship, #contact, .site-nav, footer {
          position: relative;
        }
      `}</style>

      <style jsx>{`
        .site-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          border-bottom: 1px solid var(--home-border);
          backdrop-filter: blur(12px);
          background: rgba(10,10,10,0.7);
        }
        .nav-logo {
          font-family: var(--font-bebas), sans-serif;
          font-size: 1.4rem;
          letter-spacing: 2px;
          color: var(--white);
          text-decoration: none;
        }
        .nav-logo .white { color: var(--white); }
        .nav-logo span:not(.white) { color: var(--red); }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a, .nav-links :global(a) {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.75rem;
          letter-spacing: 1px;
          color: var(--home-muted);
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links :global(a:hover) { color: var(--white); }

        #hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 2.5rem 4rem;
          overflow: hidden;
        }
        .hero-bg-text {
          position: absolute;
          top: 50%;
          left: -0.05em;
          transform: translateY(-50%);
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(12rem, 28vw, 26rem);
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.04);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4rem;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-text { max-width: 600px; }
        .hero-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          opacity: 0;
          animation: fadeUp 0.8s ease forwards 0.05s;
        }
        .hero-logo {
          width: clamp(240px, 28vw, 400px);
          height: clamp(240px, 28vw, 400px);
          border-radius: 50%;
          border: 2px solid rgba(224,32,32,0.5);
          object-fit: cover;
          display: block;
        }
        .hero-tag {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.7rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeUp 0.6s ease forwards 0.15s;
        }
        h1 {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(4rem, 12vw, 10rem);
          line-height: 0.9;
          letter-spacing: 2px;
          color: var(--white);
          opacity: 0;
          animation: fadeUp 0.7s ease forwards 0.25s;
        }
        .hero-desc {
          margin-top: 2rem;
          font-size: 1rem;
          color: var(--home-muted);
          max-width: 480px;
          opacity: 0;
          animation: fadeUp 0.7s ease forwards 0.4s;
        }
        .hero-pill {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 0.45rem 1rem;
          border: 1px solid rgba(224,32,32,0.4);
          background: rgba(224,32,32,0.08);
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--red);
          opacity: 0;
          animation: fadeUp 0.7s ease forwards 0.5s;
        }
        .hero-cta {
          margin-top: 2.5rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeUp 0.7s ease forwards 0.6s;
        }

        .btn, :global(.btn) {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid var(--white);
          color: var(--white);
          background: transparent;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn:hover, :global(.btn:hover) { background: var(--white); color: var(--black); }
        .btn-red, :global(.btn-red) { background: var(--red); border-color: var(--red); color: var(--white); }
        .btn-red:hover, :global(.btn-red:hover) { background: #c01818; border-color: #c01818; }

        .stats-bar {
          border-top: 1px solid var(--home-border);
          border-bottom: 1px solid var(--home-border);
          padding: 2rem 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 2rem;
        }
        .stat-item { text-align: center; }
        .stat-num {
          font-family: var(--font-bebas), sans-serif;
          font-size: 2.8rem;
          color: var(--white);
          line-height: 1;
        }
        .stat-label {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--home-muted);
          margin-top: 0.3rem;
        }

        .reveal {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .reveal:global(.visible) {
          opacity: 1;
          transform: translateY(0);
        }

        section { padding: 6rem 2.5rem; }
        .section-label {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .section-label::after {
          content: '';
          flex: 1;
          max-width: 60px;
          height: 1px;
          background: var(--red);
        }

        #about .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        #about h2 {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1;
          letter-spacing: 1px;
        }
        #about p { color: var(--home-muted); font-size: 0.95rem; margin-top: 1.5rem; }
        .platforms-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 2rem; }
        .platform-tag {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 0.4rem 0.9rem;
          border: 1px solid var(--home-border);
          color: var(--home-muted);
        }
        .platform-tag.active { border-color: var(--red); color: var(--red); }

        #content h2 {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          letter-spacing: 1px;
          margin-bottom: 3rem;
        }
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1px;
          background: var(--home-border);
          border: 1px solid var(--home-border);
        }
        .content-card { background: var(--black); padding: 2rem; transition: background 0.2s; }
        .content-card:hover { background: #111; }
        .card-num {
          font-family: var(--font-bebas), sans-serif;
          font-size: 3rem;
          color: var(--red);
          opacity: 0.4;
          line-height: 1;
        }
        .card-title {
          font-family: var(--font-bebas), sans-serif;
          font-size: 1.4rem;
          letter-spacing: 1px;
          margin: 0.5rem 0;
        }
        .card-desc { font-size: 0.85rem; color: var(--home-muted); }

        #sponsorship { border-top: 1px solid var(--home-border); }
        #sponsorship h2 {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }
        .sponsorship-intro {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: start;
          margin-bottom: 3rem;
        }
        #sponsorship p { color: var(--home-muted); font-size: 0.95rem; max-width: 500px; }
        .engagement-callout {
          text-align: center;
          padding: 1.75rem 2.5rem;
          border: 1px solid rgba(224,32,32,0.3);
          background: rgba(224,32,32,0.05);
          flex-shrink: 0;
        }
        .engagement-callout .big-num {
          font-family: var(--font-bebas), sans-serif;
          font-size: 4.5rem;
          color: var(--red);
          line-height: 1;
        }
        .engagement-callout .big-label {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.6rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--home-muted);
          margin-top: 0.25rem;
        }
        .engagement-callout .vs-line {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.6rem;
          letter-spacing: 1px;
          color: rgba(241,232,232,0.4);
          margin-top: 0.5rem;
        }
        .offer-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }
        .offer-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--home-muted);
          padding: 1.25rem;
          border: 1px solid var(--home-border);
        }
        .offer-list li::before {
          content: '→';
          color: var(--red);
          flex-shrink: 0;
          font-size: 0.8rem;
          margin-top: 0.15rem;
        }
        .audience-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1px;
          background: var(--home-border);
          border: 1px solid var(--home-border);
          margin-top: 2rem;
          margin-bottom: 3rem;
        }
        .audience-item { background: var(--black); padding: 1.5rem 2rem; }
        .audience-item .a-label {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.6rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 0.5rem;
        }
        .audience-item .a-value {
          font-family: var(--font-bebas), sans-serif;
          font-size: 1.2rem;
          letter-spacing: 1px;
          color: var(--white);
        }

        #contact { border-top: 1px solid var(--home-border); text-align: center; }
        #contact h2 {
          font-family: var(--font-bebas), sans-serif;
          font-size: clamp(3rem, 8vw, 7rem);
          letter-spacing: 2px;
          line-height: 1;
          margin-bottom: 1.5rem;
        }
        #contact p { color: var(--home-muted); margin-bottom: 2.5rem; font-size: 0.95rem; }
        .contact-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .contact-email {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.7rem;
          letter-spacing: 2px;
          color: var(--home-muted);
          opacity: 0.6;
          margin-top: 1rem;
        }
        .contact-email a, .contact-email :global(a) { color: var(--home-muted); text-decoration: none; transition: color 0.2s; }
        .contact-email a:hover, .contact-email :global(a:hover) { color: var(--white); }

        footer {
          border-top: 1px solid var(--home-border);
          padding: 1.5rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        footer p {
          font-family: var(--font-dm-mono), monospace;
          font-size: 0.65rem;
          letter-spacing: 1px;
          color: var(--home-muted);
          text-transform: uppercase;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .hero-content { grid-template-columns: 1fr; gap: 2.5rem; }
          .hero-logo-wrap { justify-content: flex-start; order: -1; }
          .hero-logo { width: clamp(140px, 40vw, 220px); height: clamp(140px, 40vw, 220px); }
        }
        @media (max-width: 700px) {
          .site-nav { padding: 1.2rem 1.5rem; }
          .nav-links { display: none; }
          #hero, section { padding-left: 1.5rem; padding-right: 1.5rem; }
          #about .about-grid { grid-template-columns: 1fr; gap: 2rem; }
          .stats-bar { padding: 1.5rem; }
          .sponsorship-intro { grid-template-columns: 1fr; }
          .engagement-callout { text-align: left; padding: 1.25rem 1.5rem; }
          footer { flex-direction: column; gap: 0.5rem; text-align: center; }
        }
      `}</style>
    </>
  );
}
