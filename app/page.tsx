"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll(".reveal"));
    // Only hide-then-reveal if IntersectionObserver is actually available.
    if (!("IntersectionObserver" in window)) return;

    revealEls.forEach((el) => el.classList.add("pre-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("pre-reveal");
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="site-nav">
        <a href="#hero" className="nav-logo">
          <span>the</span>cocotilo
        </a>
        <ul className="nav-links">
          <li><a href="#about">Sobre mí</a></li>
          <li><a href="#content">Contenido</a></li>
          <li><a href="#sponsorship">Patrocinio</a></li>
          <li><a href="#support">Marcas</a></li>
          <li><Link href="/coaching">Coaching</Link></li>
          <li><Link href="/links">Links</Link></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
      </nav>

      <section id="hero">
        <div className="hero-bg-text">SIM</div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-tag">Creador de contenido</p>
            <h1>
			Víctor Salmerón
            </h1>
            <p className="hero-name">COCOTILO</p>
            <p className="hero-desc">
              Simracing en iRacing y Assetto Corsa. Gameplays, técnicas de pilotaje y setups para ir más rápido.
            </p>
            <div className="hero-pill">11% engagement rate</div>
            <div className="hero-cta">
              <a href="https://instagram.com/thecocotilo" className="btn btn-red" target="_blank" rel="noreferrer">Instagram →</a>
              <Link href="/coaching" className="btn">Coaching</Link>
              <Link href="/links" className="btn">Todos mis links</Link>
            </div>
          </div>
          <div className="hero-logo-wrap">
            <img src="/logo.jpg" alt="Cocotilo — Víctor Salmerón" className="hero-logo" />
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat-item reveal">
          <div className="stat-num">10.9K</div>
          <div className="stat-label">Seguidores</div>
        </div>
        <div className="stat-item reveal">
          <div className="stat-num">11%</div>
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
            <p style={{ marginTop: "1rem" }}>Mi audiencia no es casual — son simracers y apasionados del motor de España y LATAM que siguen el contenido de forma activa. Eso explica el 11% de engagement.</p>
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
            <p style={{ marginTop: "1rem" }}>La media de engagement en Instagram para creadores de este tamaño ronda el 3–6%. Aquí estamos en el 11%. Eso significa que cada publicación llega de verdad.</p>
          </div>
          <div className="engagement-callout reveal">
            <div className="big-num">11%</div>
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

      <section id="support">
        <p className="section-label reveal">Apoya el canal</p>
        <h2 className="reveal">MARCAS QUE<br />USO Y RECOMIENDO</h2>
        <p className="support-intro reveal">Usando mis enlaces me ayudas a seguir creando contenido, sin que te cueste nada extra — algunas incluso te dan descuento a ti también.</p>

        <div className="sponsor-grid">
          <a href="https://bolori.es?ref=cocotilo" target="_blank" rel="noreferrer" className="sponsor-card reveal accent">
            <span className="sponsor-badge">5% DTO.</span>
            <div className="sponsor-logo"><img src="/sponsors/bolori.png" alt="Bolori" /></div>
            <span className="sponsor-word">Bolori</span>
            <span className="sponsor-code">Código <strong>COCOTILO</strong> → 5% de descuento</span>
            <span className="sponsor-desc">Úsalo en tu compra para conseguirlo</span>
            <span className="sponsor-cta">Comprar con descuento →</span>
          </a>
          <a href="https://www.iracing.com/membership/?refid=1189216" target="_blank" rel="noreferrer" className="sponsor-card reveal">
            <div className="sponsor-logo"><img src="/sponsors/iracing.png" alt="iRacing" /></div>
            <span className="sponsor-word">iRacing</span>
            <span className="sponsor-desc">El simulador donde compito. Únete con mi enlace</span>
            <span className="sponsor-cta">Hazte miembro →</span>
          </a>
          <a href="https://www.instant-gaming.com/?igr=Cocotilo" target="_blank" rel="noreferrer" className="sponsor-card reveal">
            <div className="sponsor-logo"><img src="/sponsors/instant-gaming.png" alt="Instant Gaming" /></div>
            <span className="sponsor-word">Instant Gaming</span>
            <span className="sponsor-desc">Claves de juegos al mejor precio. Apoya el canal con tu compra</span>
            <span className="sponsor-cta">Ver ofertas →</span>
          </a>
          <a href="https://simufy.com/?ref=Cocotilo" target="_blank" rel="noreferrer" className="sponsor-card reveal">
            <div className="sponsor-logo"><img src="/sponsors/simufy.png" alt="Simufy" /></div>
            <span className="sponsor-word">Simufy</span>
            <span className="sponsor-desc">Volantes, pedales, cockpits y todo el hardware de simracing. Distribuidor oficial en Europa</span>
            <span className="sponsor-cta">Descubrir →</span>
          </a>
        </div>
      </section>

      <section id="contact">
        <p className="section-label reveal" style={{ justifyContent: "center" }}>Contacto</p>
        <h2 className="reveal">HABLEMOS.</h2>
        <p className="reveal">Para colaboraciones y patrocinios, escríbeme por Instagram o por email.</p>
        <div className="contact-links reveal">
          <a href="https://instagram.com/thecocotilo" className="btn btn-red" target="_blank" rel="noreferrer">@thecocotilo — Instagram</a>
          <a href="https://youtube.com/@thecocotilo" className="btn btn-red" target="_blank" rel="noreferrer">@thecocotilo — YouTube</a>
          <a href="https://tiktok.com/@thecocotilo" className="btn btn-red" target="_blank" rel="noreferrer">@thecocotilo — TikTok</a>
        </div>
        <div className="contact-email reveal">
          <a href="mailto:cocotilo37@gmail.com">cocotilo37@gmail.com</a>
          &nbsp;·&nbsp;
          <Link href="/links">Todos mis links</Link>
        </div>
      </section>

      <footer>
        <p>© 2026 thecocotilo</p>
        <p>Sevilla, España · Simracing</p>
      </footer>
    </>
  );
}
