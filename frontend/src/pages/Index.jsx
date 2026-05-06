import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   Three.js Scene (runs once after mount)
───────────────────────────────────────── */
function useThreeScene(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof THREE === "undefined") return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 1. Outer Icosahedron
    const geometry = new THREE.IcosahedronGeometry(2.2, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 2. Inner Core
    const coreGeometry = new THREE.IcosahedronGeometry(1.5, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // 3. Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };
    document.addEventListener("mousemove", onMouseMove);

    // Animation
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.001;
      core.rotation.x -= 0.002;
      core.rotation.y -= 0.002;
      particlesMesh.rotation.y += 0.0002;
      sphere.rotation.x += mouseY * 0.5;
      sphere.rotation.y += mouseX * 0.5;
      particlesMesh.rotation.x -= mouseY * 0.2;
      particlesMesh.rotation.y -= mouseX * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [containerRef]);
}

/* ─────────────────────────────────────────
   Feature Card
───────────────────────────────────────── */
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="mn-feature-card">
      <div className="mn-feature-icon">{icon}</div>
      <h3 className="mn-feature-title">{title}</h3>
      <p className="mn-feature-desc">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Stat Card
───────────────────────────────────────── */
function StatCard({ value, label }) {
  return (
    <div className="mn-stat-card">
      <span className="mn-stat-value">{value}</span>
      <span className="mn-stat-label">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Landing Page
───────────────────────────────────────── */
const Index = () => {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  useThreeScene(sceneRef);

  const features = [
    {
      icon: "📦",
      title: "Real-Time Inventory",
      desc: "Track every item across all branches with live stock updates, low-stock alerts, and batch management.",
    },
    {
      icon: "🏪",
      title: "Multi-Branch POS",
      desc: "A lightning-fast point-of-sale experience across unlimited shop branches with offline support.",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      desc: "Interactive dashboards and deep sales insights to drive smarter business decisions.",
    },
    {
      icon: "🔐",
      title: "Role-Based Access",
      desc: "Granular permissions for admins, managers, and staff with complete audit logging.",
    },
    {
      icon: "🧾",
      title: "Smart Invoicing",
      desc: "Generate professional invoices and receipts instantly. PDF export, barcode support.",
    },
    {
      icon: "🔔",
      title: "Instant Notifications",
      desc: "Stay informed with real-time alerts for low stock, new orders, and critical events.",
    },
  ];

  return (
    <>
      {/* ── Global Page Styles ── */}
      <style>{`
        /* Fonts */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        /* ── NAVBAR ── */
        .mn-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(3, 7, 18, 0.6);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.15);
        }
        .mn-nav-logo {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.4rem; font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .mn-nav-actions { display: flex; gap: 0.75rem; align-items: center; }
        .mn-btn-ghost {
          background: transparent; border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc; padding: 0.45rem 1.1rem; border-radius: 8px;
          font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: all 0.2s;
        }
        .mn-btn-ghost:hover { border-color: #6366f1; color: #fff; background: rgba(99,102,241,0.1); }
        .mn-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; color: #fff; padding: 0.45rem 1.25rem; border-radius: 8px;
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: all 0.25s; box-shadow: 0 4px 15px rgba(99,102,241,0.35);
        }
        .mn-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(99,102,241,0.5); }

        /* ── PAGE WRAPPER ── */
        .mn-page {
          background: #030712; color: #e2e8f0; min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .mn-hero {
          position: relative; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 6rem 1.5rem 3rem;
          overflow: hidden;
        }
        #hero-3d-scene {
          position: absolute; inset: 0; z-index: 0;
        }
        .mn-hero-glow-a {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -10%; left: -10%; pointer-events: none; z-index: 1;
          animation: pulseGlow 6s ease-in-out infinite;
        }
        .mn-hero-glow-b {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%);
          bottom: -5%; right: -5%; pointer-events: none; z-index: 1;
          animation: pulseGlow 8s ease-in-out infinite reverse;
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .mn-hero-content {
          position: relative; z-index: 2; text-align: center; max-width: 820px;
        }
        .mn-hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc; padding: 0.35rem 1rem; border-radius: 100px;
          font-size: 0.8rem; font-weight: 500; margin-bottom: 1.5rem;
          letter-spacing: 0.03em;
          animation: fadeSlideUp 0.8s ease both;
        }
        .mn-hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800; line-height: 1.05; letter-spacing: -2px;
          background: linear-gradient(135deg, #fff 30%, #a5b4fc 65%, #22d3ee 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 1.5rem;
          animation: fadeSlideUp 0.9s 0.1s ease both;
        }
        .mn-hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.25rem); color: #94a3b8;
          max-width: 560px; margin: 0 auto 2.5rem; line-height: 1.7;
          animation: fadeSlideUp 1s 0.2s ease both;
        }
        .mn-hero-cta {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          animation: fadeSlideUp 1s 0.3s ease both;
        }
        .mn-btn-cta-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; color: #fff; padding: 0.85rem 2.2rem; border-radius: 12px;
          font-size: 1rem; font-weight: 700; cursor: pointer;
          transition: all 0.25s; box-shadow: 0 8px 30px rgba(99,102,241,0.4);
          display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .mn-btn-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.55); }
        .mn-btn-cta-ghost {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
          color: #e2e8f0; padding: 0.85rem 2.2rem; border-radius: 12px;
          font-size: 1rem; font-weight: 600; cursor: pointer;
          transition: all 0.25s;
        }
        .mn-btn-cta-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── STATS STRIP ── */
        .mn-stats {
          position: relative; z-index: 10;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: rgba(99,102,241,0.12);
          border-top: 1px solid rgba(99,102,241,0.15);
          border-bottom: 1px solid rgba(99,102,241,0.15);
        }
        .mn-stat-card {
          background: rgba(3,7,18,0.92); padding: 2rem 1.5rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
          text-align: center;
        }
        .mn-stat-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mn-stat-label { font-size: 0.85rem; color: #64748b; font-weight: 500; }

        /* ── SECTION ── */
        .mn-section {
          padding: 6rem 1.5rem;
          max-width: 1200px; margin: 0 auto;
        }
        .mn-section-label {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #6366f1; margin-bottom: 0.75rem;
          display: block;
        }
        .mn-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.75rem); font-weight: 700;
          color: #f1f5f9; margin-bottom: 1rem; line-height: 1.2;
        }
        .mn-section-sub { color: #64748b; font-size: 1rem; max-width: 520px; line-height: 1.7; }

        /* ── FEATURES GRID ── */
        .mn-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; margin-top: 3.5rem;
        }
        .mn-feature-card {
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 16px; padding: 2rem;
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .mn-feature-card:hover {
          border-color: rgba(99,102,241,0.4);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(99,102,241,0.12);
        }
        .mn-feature-icon { font-size: 2rem; margin-bottom: 1rem; }
        .mn-feature-title { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.5rem; }
        .mn-feature-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── HOW IT WORKS ── */
        .mn-how-wrapper {
          background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,211,238,0.04) 100%);
          border-top: 1px solid rgba(99,102,241,0.1);
          border-bottom: 1px solid rgba(99,102,241,0.1);
          padding: 6rem 1.5rem;
        }
        .mn-steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2rem; margin-top: 3.5rem; max-width: 1200px; margin-left: auto; margin-right: auto;
        }
        .mn-step {
          display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;
        }
        .mn-step-num {
          width: 48px; height: 48px; border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.1rem; color: #fff;
          flex-shrink: 0;
        }
        .mn-step-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
        .mn-step-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── CTA SECTION ── */
        .mn-cta-section {
          text-align: center; padding: 7rem 1.5rem;
          max-width: 700px; margin: 0 auto;
        }
        .mn-cta-section .mn-section-title { text-align: center; }
        .mn-cta-section .mn-section-sub { margin: 0 auto 2.5rem; text-align: center; }

        /* ── FOOTER ── */
        .mn-footer {
          background: rgba(3,7,18,0.95);
          border-top: 1px solid rgba(99,102,241,0.1);
          padding: 2.5rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
        }
        .mn-footer-copy { font-size: 0.82rem; color: #475569; }
        .mn-footer-links { display: flex; gap: 1.5rem; }
        .mn-footer-link { font-size: 0.82rem; color: #475569; text-decoration: none; transition: color 0.2s; }
        .mn-footer-link:hover { color: #a5b4fc; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .mn-features-grid { grid-template-columns: repeat(2, 1fr); }
          .mn-steps { grid-template-columns: 1fr; gap: 2rem; }
          .mn-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .mn-nav { padding: 0.85rem 1.25rem; }
          .mn-features-grid { grid-template-columns: 1fr; }
          .mn-stats { grid-template-columns: repeat(2, 1fr); }
          .mn-hero { padding: 5rem 1.25rem 2.5rem; }
          .mn-footer { flex-direction: column; text-align: center; }
          .mn-footer-links { justify-content: center; }
          .mn-nav-actions .mn-btn-ghost { display: none; }
        }
      `}</style>

      <div className="mn-page">
        {/* ── Navbar ── */}
        <nav className="mn-nav">
          <div className="mn-nav-logo">MartNexus</div>
          <div className="mn-nav-actions">
            <button className="mn-btn-ghost" onClick={() => navigate("/auth")}>
              Log In
            </button>
            <button
              className="mn-btn-primary"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="mn-hero">
          <div id="hero-3d-scene" ref={sceneRef} />
          <div className="mn-hero-glow-a" />
          <div className="mn-hero-glow-b" />

          <div className="mn-hero-content">
            <div className="mn-hero-badge">
              <span>✦</span> Advanced Inventory Intelligence
            </div>

            <h1 className="mn-hero-title">
              The Future of
              <br />
              Retail Management
            </h1>

            <p className="mn-hero-sub">
              MartNexus unifies your inventory, sales, suppliers, and analytics
              into one seamless platform — built for modern businesses that
              demand speed and precision.
            </p>

            <div className="mn-hero-cta">
              <button
                className="mn-btn-cta-primary"
                onClick={() => navigate("/auth")}
              >
                Start Free Today <span>→</span>
              </button>
              <button
                className="mn-btn-cta-ghost"
                onClick={() =>
                  document
                    .getElementById("mn-features")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Features
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <div className="mn-stats">
          <StatCard value="50K+" label="Items Tracked" />
          <StatCard value="99.9%" label="Uptime SLA" />
          <StatCard value="5,000+" label="Active Businesses" />
          <StatCard value="∞" label="Branch Support" />
        </div>

        {/* ── Features ── */}
        <section id="mn-features">
          <div className="mn-section">
            <span className="mn-section-label">Capabilities</span>
            <h2 className="mn-section-title">
              Everything your business needs
            </h2>
            <p className="mn-section-sub">
              Purpose-built tools that grow with you — from a single shop to a
              nationwide retail empire.
            </p>

            <div className="mn-features-grid">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <div className="mn-how-wrapper">
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
            <span className="mn-section-label">How It Works</span>
            <h2 className="mn-section-title">Up and running in minutes</h2>
            <p className="mn-section-sub">
              No complicated setup. No steep learning curve. Just a powerful
              system ready to go.
            </p>
          </div>

          <div className="mn-steps">
            {[
              {
                n: "01",
                title: "Create your account",
                desc: "Sign up in seconds with just your email. No credit card required to get started.",
              },
              {
                n: "02",
                title: "Add your shop & products",
                desc: "Configure branches, add inventory items, set prices and categories with ease.",
              },
              {
                n: "03",
                title: "Sell, track & scale",
                desc: "Use the POS to process sales, monitor stock in real time, and export reports.",
              },
            ].map((step) => (
              <div className="mn-step" key={step.n}>
                <div className="mn-step-num">{step.n}</div>
                <div>
                  <div className="mn-step-title">{step.title}</div>
                  <div className="mn-step-desc" style={{ marginTop: "0.4rem" }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div className="mn-cta-section">
          <span className="mn-section-label">Ready to level up?</span>
          <h2 className="mn-section-title">
            Take control of your inventory today
          </h2>
          <p className="mn-section-sub">
            Join thousands of businesses that trust MartNexus to manage their
            operations efficiently.
          </p>
          <button
            className="mn-btn-cta-primary"
            style={{ fontSize: "1.05rem", padding: "1rem 2.75rem" }}
            onClick={() => navigate("/auth")}
          >
            Get Started Free →
          </button>
        </div>

        {/* ── Footer ── */}
        <footer className="mn-footer">
          <span className="mn-footer-copy">
            © 2025 MartNexus. All rights reserved.
          </span>
          <div className="mn-footer-links">
            <a href="#" className="mn-footer-link">Privacy</a>
            <a href="#" className="mn-footer-link">Terms</a>
            <a href="#" className="mn-footer-link">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
