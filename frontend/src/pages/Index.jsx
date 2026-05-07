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
          display: flex; align-items: center; gap: 1rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.6rem; font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .mn-nav-logo img { width: 64px; height: 64px; object-fit: contain; }
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
          gap: 1px; background: rgba(99, 102, 241, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
        }
        .mn-stat-card {
          background: rgba(3, 7, 18, 0.8); padding: 2.5rem 1.5rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          text-align: center; transition: background 0.3s;
        }
        .mn-stat-card:hover { background: rgba(99, 102, 241, 0.05); }
        .mn-stat-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800;
          background: linear-gradient(135deg, #fff, #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mn-stat-label { font-size: 0.9rem; color: #94a3b8; font-weight: 500; letter-spacing: 0.02em; }

        /* ── SECTION HEADERS ── */
        .mn-section {
          padding: 8rem 1.5rem;
          max-width: 1300px; margin: 0 auto;
        }
        .mn-section-header {
          margin-bottom: 5rem;
          max-width: 800px;
        }
        .mn-section-label {
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #818cf8; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.75rem;
        }
        .mn-section-label::after {
          content: ""; height: 1px; width: 40px; background: rgba(129, 140, 248, 0.4);
        }
        .mn-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 800;
          color: #fff; margin-bottom: 1.5rem; line-height: 1.1;
          letter-spacing: -1px;
        }
        .mn-section-sub { color: #94a3b8; font-size: 1.15rem; max-width: 600px; line-height: 1.6; }

        /* ── ASYMMETRICAL BENTO FEATURES ── */
        .mn-features-bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(180px, auto);
          gap: 1.5rem;
        }
        .mn-feature-item {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px; padding: 2.5rem;
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          backdrop-filter: blur(10px);
          display: flex; flex-direction: column;
        }
        .mn-feature-item:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(15, 23, 42, 0.6);
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 18px 36px -18px rgba(99, 102, 241, 0.3);
        }
        .mn-feature-item::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 60%);
          opacity: 0; transition: opacity 0.4s;
        }
        .mn-feature-item:hover::before { opacity: 1; }

        .mn-feature-icon-wrapper {
          width: 56px; height: 56px; border-radius: 14px;
          background: rgba(99, 102, 241, 0.1);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.75rem; margin-bottom: 1.5rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
          transition: transform 0.4s;
        }
        .mn-feature-item:hover .mn-feature-icon-wrapper { transform: rotate(10deg) scale(1.1); }

        .mn-feature-item h3 { font-size: 1.4rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.75rem; }
        .mn-feature-item p { font-size: 1rem; color: #94a3b8; line-height: 1.6; }

        /* Bento Spans */
        .feat-lg { grid-column: span 8; }
        .feat-md { grid-column: span 4; }
        .feat-sm { grid-column: span 6; }

        /* ── MODERN STEPS (How It Works) ── */
        .mn-steps-modern {
          display: flex; flex-direction: column; gap: 4rem; margin-top: 4rem;
        }
        .mn-modern-step {
          display: flex; align-items: center; gap: 4rem;
        }
        
        .mn-step-visual {
          flex: 1; height: 320px; border-radius: 24px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(34, 211, 238, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .mn-step-visual::after {
          content: ""; position: absolute; width: 150%; height: 150%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          animation: slowRotate 20s linear infinite;
        }
        @keyframes slowRotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        .mn-step-content { flex: 1; }
        .mn-step-index {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 4rem; font-weight: 800;
          color: rgba(99, 102, 241, 0.15);
          line-height: 1; margin-bottom: -1.5rem;
        }
        .mn-step-content h3 { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
        .mn-step-content p { font-size: 1.1rem; color: #94a3b8; line-height: 1.7; max-width: 480px; }

        /* ── PREMIUM CTA SECTION ── */
        .mn-cta-wrapper {
          padding: 10rem 1.5rem; position: relative;
        }
        .mn-cta-card {
          max-width: 1000px; margin: 0 auto;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1));
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 40px; padding: 6rem 2rem;
          text-align: center; position: relative; overflow: hidden;
          backdrop-filter: blur(20px);
        }
        .mn-cta-card::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2), transparent 70%);
          pointer-events: none;
        }
        .mn-cta-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800;
          color: #fff; margin-bottom: 1.5rem; letter-spacing: -2px;
        }
        .mn-cta-sub {
          font-size: 1.25rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 3rem;
          line-height: 1.6;
        }

        /* ── FOOTER ── */
        .mn-footer {
          background: #030712;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 6rem 2rem 3rem;
        }
        .mn-footer-container {
          max-width: 1300px; margin: 0 auto;
          display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 4rem;
        }
        .mn-footer-brand { display: flex; flex-direction: column; gap: 1.5rem; }
        .mn-footer-logo {
          display: flex; align-items: center; gap: 1rem;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.6rem;
          color: #fff;
        }
        .mn-footer-logo img { width: 80px; height: 80px; object-fit: contain; }
        .mn-footer-desc {
          color: #94a3b8; font-size: 1rem; line-height: 1.6; max-width: 320px;
        }
        .mn-footer-col h4 {
          color: #fff; font-size: 0.9rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }
        .mn-footer-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
        .mn-footer-link {
          font-size: 0.95rem; color: #64748b; text-decoration: none;
          transition: color 0.2s, transform 0.2s; display: inline-block;
        }
        .mn-footer-link:hover { color: #fff; transform: translateX(4px); }

        .mn-footer-bottom {
          max-width: 1300px; margin: 4rem auto 0;
          padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1.5rem;
        }
        .mn-footer-copy { font-size: 0.9rem; color: #475569; }
        .mn-footer-legal { display: flex; gap: 2rem; }
        .mn-footer-legal-link { font-size: 0.9rem; color: #475569; text-decoration: none; transition: color 0.2s; }
        .mn-footer-legal-link:hover { color: #94a3b8; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .feat-lg, .feat-md, .feat-sm { grid-column: span 12; }
          .mn-modern-step, .mn-modern-step:nth-child(even) { flex-direction: column; text-align: center; gap: 2rem; }
          .mn-modern-step p { margin: 0 auto; }
          .mn-step-visual { width: 100%; height: 240px; }
        }
        @media (max-width: 768px) {
          .mn-stats { grid-template-columns: repeat(2, 1fr); }
          .mn-cta-card { padding: 4rem 1.5rem; border-radius: 24px; }
          .mn-footer { flex-direction: column; gap: 2rem; text-align: center; }
          .mn-section { padding: 5rem 1.5rem; }
        }
      `}</style>

      <div className="mn-page">
        {/* ── Navbar ── */}
        <nav className="mn-nav">
          <div className="mn-nav-logo">
            <img src="/logo.png" alt="MartNexus Logo" />
            MartNexus
          </div>
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

            <h1 className="mn-hero-title">
              The Future of
              <br />
              Inventory Management
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

        {/* ── Capabilities (Bento Grid) ── */}
        <section id="mn-features" className="mn-section">
          <div className="mn-section-header">
            <span className="mn-section-label">Capabilities</span>
            <h2 className="mn-section-title">Everything your business needs</h2>
            <p className="mn-section-sub">
              Purpose-built tools that grow with you — from a single shop to a
              nationwide retail empire.
            </p>
          </div>

          <div className="mn-features-bento">
            <div className="mn-feature-item feat-lg">
              <div className="mn-feature-icon-wrapper">📦</div>
              <h3>Real-Time Inventory</h3>
              <p>
                Track every item across all branches with live stock updates,
                low-stock alerts, and sophisticated batch management. Never miss
                a sale due to out-of-stock items again.
              </p>
            </div>
            <div className="mn-feature-item feat-md">
              <div className="mn-feature-icon-wrapper">🏪</div>
              <h3>Multi-Branch POS</h3>
              <p>
                A lightning-fast point-of-sale experience across unlimited
                branches with robust offline support.
              </p>
            </div>
            <div className="mn-feature-item feat-md">
              <div className="mn-feature-icon-wrapper">📊</div>
              <h3>Advanced Analytics</h3>
              <p>
                Deep sales insights and interactive dashboards to drive smarter,
                data-backed business decisions.
              </p>
            </div>
            <div className="mn-feature-item feat-lg">
              <div className="mn-feature-icon-wrapper">🔐</div>
              <h3>Role-Based Access</h3>
              <p>
                Granular permissions for admins, managers, and staff with
                complete audit logging for total transparency. Secure your
                operations with enterprise-grade security protocols.
              </p>
            </div>
            <div className="mn-feature-item feat-sm">
              <div className="mn-feature-icon-wrapper">🧾</div>
              <h3>Smart Invoicing</h3>
              <p>
                Generate professional invoices and receipts instantly. Full PDF
                export and integrated barcode support for seamless checkout.
              </p>
            </div>
            <div className="mn-feature-item feat-sm">
              <div className="mn-feature-icon-wrapper">🔔</div>
              <h3>Instant Notifications</h3>
              <p>
                Stay informed with real-time push alerts for low stock, new
                orders, and critical operational events across your empire.
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works (Modern Alternating) ── */}
        <section className="mn-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="mn-section-header">
            <span className="mn-section-label">Process</span>
            <h2 className="mn-section-title">Up and running in minutes</h2>
            <p className="mn-section-sub">
              No complicated setup. No steep learning curve. Just a powerful
              system ready to dominate the market.
            </p>
          </div>

          <div className="mn-steps-modern">
            <div className="mn-modern-step">
              <div className="mn-step-content">
                <div className="mn-step-index">01</div>
                <h3>Create your account</h3>
                <p>
                  Sign up in seconds with just your email. No credit card
                  required to explore the full power of MartNexus.
                </p>
              </div>
              <div className="mn-step-visual">
                <div style={{ fontSize: "4rem" }}>⚡</div>
              </div>
            </div>

            <div className="mn-modern-step" style={{ flexDirection: "row-reverse" }}>
              <div className="mn-step-content">
                <div className="mn-step-index">02</div>
                <h3>Add your shop & products</h3>
                <p>
                  Configure branches, add inventory items, set prices and
                  categories with an intuitive, drag-and-drop interface.
                </p>
              </div>
              <div className="mn-step-visual">
                <div style={{ fontSize: "4rem" }}>🏪</div>
              </div>
            </div>

            <div className="mn-modern-step">
              <div className="mn-step-content">
                <div className="mn-step-index">03</div>
                <h3>Sell, track & scale</h3>
                <p>
                  Use the POS to process sales, monitor stock in real time, and
                  export detailed reports to scale your business.
                </p>
              </div>
              <div className="mn-step-visual">
                <div style={{ fontSize: "4rem" }}>🚀</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA (Premium Card) ── */}
        <section className="mn-cta-wrapper">
          <div className="mn-cta-card">
            <span className="mn-section-label" style={{ justifyContent: "center" }}>Ready to level up?</span>
            <h2 className="mn-cta-title">Take control of your inventory today</h2>
            <p className="mn-cta-sub">
              Join thousands of businesses that trust MartNexus to manage their
              operations with absolute precision and efficiency.
            </p>
            <button
              className="mn-btn-cta-primary"
              style={{ fontSize: "1.1rem", padding: "1.2rem 3.5rem" }}
              onClick={() => navigate("/auth")}
            >
              Get Started Free Today <span>→</span>
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mn-footer">
          <div className="mn-footer-container">
            <div className="mn-footer-brand">
              <div className="mn-footer-logo">
                <img src="/logo.png" alt="MartNexus Logo" />
                MartNexus
              </div>
              <p className="mn-footer-desc">
                The operating system for retail businesses. Trusted by modern shop owners worldwide.
              </p>
            </div>

            <div className="mn-footer-col">
              <h4>Platform</h4>
              <ul className="mn-footer-list">
                <li><a href="#" className="mn-footer-link">Features</a></li>
                <li><a href="#" className="mn-footer-link">Integrations</a></li>
                <li><a href="#" className="mn-footer-link">Security</a></li>
              </ul>
            </div>

            <div className="mn-footer-col">
              <h4>Company</h4>
              <ul className="mn-footer-list">
                <li><a href="#" className="mn-footer-link">About</a></li>
                <li><a href="#" className="mn-footer-link">Career</a></li>
                <li><a href="#" className="mn-footer-link">Press</a></li>
              </ul>
            </div>

            <div className="mn-footer-col">
              <h4>Support</h4>
              <ul className="mn-footer-list">
                <li><a href="#" className="mn-footer-link">Help Center</a></li>
                <li><a href="#" className="mn-footer-link">Community</a></li>
                <li><a href="#" className="mn-footer-link">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="mn-footer-bottom">
            <p className="mn-footer-copy">
              © 2026 MartNexus Logistics Inc. All rights reserved.
            </p>
            <div className="mn-footer-legal">
              <a href="#" className="mn-footer-legal-link">Privacy Policy</a>
              <a href="#" className="mn-footer-legal-link">Terms of Service</a>
              <a href="#" className="mn-footer-legal-link">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
