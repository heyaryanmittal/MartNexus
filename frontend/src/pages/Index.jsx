import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { 
  Package, Store, BarChart3, ShieldCheck, FileText, Bell, 
  PlusCircle, ShoppingBag, Cpu, ShoppingCart, Wine, Settings2,
  ArrowRight
} from "lucide-react";

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

function CheckIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" style={{ width: "18px", height: "18px", marginTop: "2px", flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   Landing Page
───────────────────────────────────────── */
const Index = () => {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const spotlightRef = useRef(null);
  useThreeScene(sceneRef);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`;
        spotlightRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
        body { 
          font-family: 'Inter', sans-serif; 
          background-color: #030712;
          background-image: 
            radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 32px 32px;
          color: #e2e8f0;
        }

        /* ── NAVBAR ── */
        .mn-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 2rem;
          background: rgba(3, 7, 18, 0.6);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .mn-nav-logo {
          display: flex; align-items: center; gap: 0.75rem;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.4rem; font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          cursor: pointer;
        }
        .mn-nav-logo img { width: 48px; height: 48px; object-fit: contain; }
        
        .mn-nav-links {
          display: flex; gap: 2.5rem;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .mn-nav-link {
          font-size: 0.9rem; font-weight: 500; color: #94a3b8;
          text-decoration: none; transition: all 0.2s;
          cursor: pointer;
        }
        .mn-nav-link:hover { color: #fff; }

        .mn-nav-actions { display: flex; gap: 0.75rem; align-items: center; }
        .mn-btn-ghost {
          background: transparent; border: none;
          color: #94a3b8; padding: 0.5rem 1.25rem; border-radius: 10px;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .mn-btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .mn-btn-primary {
          background: #fff;
          border: none; color: #000; padding: 0.6rem 1.5rem; border-radius: 10px;
          font-size: 0.9rem; font-weight: 700; cursor: pointer;
          transition: all 0.25s;
        }
        .mn-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 20px -10px rgba(255,255,255,0.3); background: #f8fafc; }

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
        
        /* ── CURSOR SPOTLIGHT ── */
        .mn-spotlight {
          position: fixed; top: 0; left: 0; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none; z-index: 99;
          transform: translate(-50%, -50%);
          mix-blend-mode: plus-lighter;
          transition: opacity 0.3s;
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
          background: linear-gradient(135deg, #fff, #6366f1, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mn-stat-label { font-size: 0.9rem; color: #94a3b8; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }

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
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px; padding: 3rem;
          position: relative; overflow: hidden;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          backdrop-filter: blur(12px);
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
          flex: 1; height: 350px; border-radius: 28px;
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          backdrop-filter: blur(10px);
        }
        .mn-step-visual:hover {
          border-color: rgba(99, 102, 241, 0.4);
          transform: scale(1.02);
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
        }
        .mn-step-visual img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.85; transition: opacity 0.5s, transform 0.5s;
        }
        .mn-step-visual:hover img {
          opacity: 1; transform: scale(1.05);
        }
        .mn-step-visual::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at center, transparent 30%, rgba(3, 7, 18, 0.4) 100%);
          pointer-events: none;
        }

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

        /* ── SOLUTIONS GRID ── */
        .mn-solutions-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; margin-top: 4rem;
        }
        .mn-solution-card {
          padding: 3.5rem 2.5rem; border-radius: 28px;
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          backdrop-filter: blur(8px);
          position: relative; overflow: hidden;
        }
        .mn-solution-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent);
          opacity: 0; transition: opacity 0.4s;
        }
        .mn-solution-card:hover {
          background: rgba(15, 23, 42, 0.5);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.5);
        }
        .mn-solution-card:hover::before { opacity: 1; }
        .mn-solution-card h3 { font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
        .mn-solution-card p { color: #94a3b8; font-size: 1rem; line-height: 1.7; position: relative; z-index: 1; }

        /* ── PRICING ── */
        .mn-pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2rem; margin-top: 4rem;
        }
        .mn-price-card {
          padding: 3.5rem 2.5rem; border-radius: 32px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex; flex-direction: column; gap: 2.5rem;
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .mn-price-card:hover {
          transform: translateY(-12px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.6);
        }
        
        /* Individual Card Themes */
        .mn-price-card.starter { border-top: 4px solid #6366f1; }
        .mn-price-card.pro { border-top: 4px solid #10b981; background: rgba(16, 185, 129, 0.05); }
        .mn-price-card.enterprise { border-top: 4px solid #8b5cf6; }

        .mn-popular-badge {
          position: absolute; top: 1.5rem; right: 1.5rem;
          padding: 0.35rem 1rem; border-radius: 100px;
          background: #10b981; color: #fff; font-size: 0.75rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        
        .mn-price-header h3 { color: #fff; font-size: 1.75rem; margin-bottom: 0.5rem; font-family: 'Space Grotesk', sans-serif; }
        .mn-price-header p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
        .mn-price-amount { font-size: 3.5rem; font-weight: 800; color: #fff; margin-top: 1.5rem; font-family: 'Space Grotesk', sans-serif; letter-spacing: -2px; }
        .mn-price-amount span { font-size: 1.25rem; color: #64748b; font-weight: 400; letter-spacing: 0; }
        
        .mn-price-features { list-style: none; display: flex; flex-direction: column; gap: 1.25rem; }
        .mn-price-feature { color: #cbd5e1; font-size: 1rem; display: flex; align-items: flex-start; gap: 1rem; line-height: 1.4; }
        .mn-price-feature svg { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; }
        .mn-price-feature.starter-icon svg { color: #6366f1; }
        .mn-price-feature.pro-icon svg { color: #10b981; }
        .mn-price-feature.enterprise-icon svg { color: #8b5cf6; }

        /* ── ABOUT ── */
        .mn-about-content {
          display: flex; gap: 4rem; align-items: center; margin-top: 4rem;
        }
        .mn-about-text { flex: 1; }
        .mn-about-visual {
          flex: 1; height: 450px; border-radius: 32px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          position: relative;
        }
        .mn-about-visual img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.8; transition: all 0.5s;
        }
        .mn-about-visual:hover img { transform: scale(1.05); opacity: 1; }
        .mn-about-overlay {
          position: absolute; bottom: 2rem; left: 2rem;
          background: rgba(3, 7, 18, 0.6); backdrop-filter: blur(10px);
          padding: 1rem 1.5rem; border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          .mn-nav-links { display: none; }
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
        <div className="mn-spotlight" ref={spotlightRef} />
        {/* ── Navbar ── */}
        <nav className="mn-nav">
          <div className="mn-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/logo.png" alt="MartNexus Logo" />
            MartNexus
          </div>

          <div className="mn-nav-links">
            <a className="mn-nav-link" onClick={() => document.getElementById("mn-features").scrollIntoView({ behavior: "smooth" })}>Features</a>
            <a className="mn-nav-link" onClick={() => document.getElementById("mn-solutions").scrollIntoView({ behavior: "smooth" })}>Solutions</a>
            <a className="mn-nav-link" onClick={() => document.getElementById("mn-pricing").scrollIntoView({ behavior: "smooth" })}>Pricing</a>
            <a className="mn-nav-link" onClick={() => document.getElementById("mn-about").scrollIntoView({ behavior: "smooth" })}>About</a>
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
            <h2 className="mn-section-title">The Operating System for Modern Retail</h2>
            <p className="mn-section-sub">
              MartNexus provides the architectural foundation for high-velocity retail operations, 
              integrating financial precision with deep operational intelligence.
            </p>
          </div>

          <div className="mn-features-bento">
            <div className="mn-feature-item feat-lg">
              <div className="mn-feature-icon-wrapper"><Package className="w-8 h-8 text-indigo-400" /></div>
              <h3>Intelligent Inventory Control</h3>
              <p>
                Beyond simple tracking. Automated reorder logic, multi-unit quantity support (KG, Liters, Pieces), 
                and granular stock movement logs with full audit-ready accuracy.
              </p>
            </div>
            <div className="mn-feature-item feat-md">
              <div className="mn-feature-icon-wrapper"><FileText className="w-8 h-8 text-cyan-400" /></div>
              <h3>GST-Compliant POS Engine</h3>
              <p>
                Engineered for speed and compliance. Full support for CGST, SGST, and IGST calculations.
              </p>
            </div>
            <div className="mn-feature-item feat-md">
              <div className="mn-feature-icon-wrapper"><BarChart3 className="w-8 h-8 text-purple-400" /></div>
              <h3>Strategic Growth Analytics</h3>
              <p>
                Dynamic sales analysis and performance monitoring. Translate transaction data 
                into actionable growth strategies.
              </p>
            </div>
            <div className="mn-feature-item feat-lg">
              <div className="mn-feature-icon-wrapper"><ShieldCheck className="w-8 h-8 text-indigo-400" /></div>
              <h3>Enterprise Security & Auditing</h3>
              <p>
                Complete financial accountability with full audit trails (AuditLog) of every record change. 
                Role-based permissions and encrypted transaction logging.
              </p>
            </div>
            <div className="mn-feature-item feat-sm">
              <div className="mn-feature-icon-wrapper"><Settings2 className="w-8 h-8 text-cyan-400" /></div>
              <h3>Procurement Automation</h3>
              <p>
                End-to-end supply chain management with Purchase Order tracking and supplier management.
              </p>
            </div>
            <div className="mn-feature-item feat-sm">
              <div className="mn-feature-icon-wrapper"><PlusCircle className="w-8 h-8 text-purple-400" /></div>
              <h3>Automated Data Resilience</h3>
              <p>
                Peace of mind with scheduled database and inventory backups. 
                Full recovery protocols ensuring zero downtime.
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works (Modern Alternating) ── */}
        <section className="mn-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="mn-section-header">
            <span className="mn-section-label">Process</span>
            <h2 className="mn-section-title">Institutional deployment in minutes</h2>
            <p className="mn-section-sub">
              MartNexus is designed for rapid onboarding. Transition from legacy spreadsheets 
              to enterprise intelligence without the operational downtime.
            </p>
          </div>

          <div className="mn-steps-modern">
            <div className="mn-modern-step">
              <div className="mn-step-content">
                <div className="mn-step-index">01</div>
                <h3>Configure Identity & Security</h3>
                <p>
                  Initialize your enterprise profile and secure your credentials. 
                  MartNexus employs industrial-grade encryption for all user and shop data.
                </p>
              </div>
              <div className="mn-step-visual">
                <img src="/security_step.png" alt="Security & Identity" />
              </div>
            </div>

            <div className="mn-modern-step" style={{ flexDirection: "row-reverse" }}>
              <div className="mn-step-content">
                <div className="mn-step-index">02</div>
                <h3>Synchronize Inventory & Supply Chain</h3>
                <p>
                  Import existing product catalogs, configure tax categories, and link suppliers. 
                  Our intelligent mapper handles complex SKU structures automatically.
                </p>
              </div>
              <div className="mn-step-visual">
                <img src="/inventory_step.png" alt="Supply Chain Sync" />
              </div>
            </div>

            <div className="mn-modern-step">
              <div className="mn-step-content">
                <div className="mn-step-index">03</div>
                <h3>Execute & Analyze</h3>
                <p>
                  Go live with our lightning-fast POS. Monitor real-time stock movements and 
                  leverage automated audit logs to maintain total operational control.
                </p>
              </div>
              <div className="mn-step-visual">
                <img src="/analytics_step.png" alt="Execute & Analyze" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Solutions (Verticals) ── */}
        <section id="mn-solutions" className="mn-section">
          <div className="mn-section-header">
            <span className="mn-section-label">Solutions</span>
            <h2 className="mn-section-title">Modular. Industry-Specific.</h2>
            <p className="mn-section-sub">
              Our architecture adapts to the specialized requirements of your 
              vertical, ensuring zero friction and maximum compliance.
            </p>
          </div>

          <div className="mn-solutions-grid">
            <div className="mn-solution-card">
              <h3><PlusCircle className="w-6 h-6 text-red-400" /> Pharmaceutical Retail</h3>
              <p>Batch-level tracking and expiry alerts. Maintain strict health regulatory compliance and safety standards with automated logging.</p>
            </div>
            <div className="mn-solution-card">
              <h3><ShoppingBag className="w-6 h-6 text-pink-400" /> Fashion & Lifestyle</h3>
              <p>Multi-variant SKU management. Handle thousands of style, size, and color combinations with integrated inventory logic.</p>
            </div>
            <div className="mn-solution-card">
              <h3><Cpu className="w-6 h-6 text-blue-400" /> Electronics & Appliances</h3>
              <p>Serial number tracking and precision warranty management. Protect high-value assets with unique identifier logging.</p>
            </div>
            <div className="mn-solution-card">
              <h3><ShoppingCart className="w-6 h-6 text-emerald-400" /> Grocery & Perishables</h3>
              <p>High-velocity POS and FIFO-based stock management. Optimize shelf-life and maximize operational throughput daily.</p>
            </div>
            <div className="mn-solution-card">
              <h3><Wine className="w-6 h-6 text-purple-400" /> Wine & Specialty Spirits</h3>
              <p>Sophisticated cataloging and customer-specific pricing structures for unique, high-engagement retail environments.</p>
            </div>
            <div className="mn-solution-card">
              <h3><Settings2 className="w-6 h-6 text-orange-400" /> Industrial & Hardware</h3>
              <p>Bulk purchasing logic and precision bin tracking. Scale your industrial supply chain with automated reorder levels.</p>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="mn-pricing" className="mn-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="mn-section-header" style={{ margin: "0 auto 5rem", textAlign: "center" }}>
            <span className="mn-section-label" style={{ justifyContent: "center" }}>Strategic Investment</span>
            <h2 className="mn-section-title">Predictable Pricing. Infinite Scale.</h2>
            <p className="mn-section-sub" style={{ margin: "0 auto" }}>
              Invest in a system that scales with your ambition. No hidden overheads, 
              just pure operational power for your retail empire.
            </p>
          </div>

          <div className="mn-pricing-grid">
            {/* Starter Plan */}
            <div className="mn-price-card starter">
              <div className="mn-price-header">
                <h3>Starter</h3>
                <p>The foundation for independent boutiques and shops</p>
                <div className="mn-price-amount">$29<span>/mo</span></div>
              </div>
              <ul className="mn-price-features">
                <li className="mn-price-feature starter-icon"><CheckIcon /> Full Inventory & POS Engine</li>
                <li className="mn-price-feature starter-icon"><CheckIcon /> GST-Ready Invoicing (PDF)</li>
                <li className="mn-price-feature starter-icon"><CheckIcon /> Up to 5,000 Products</li>
                <li className="mn-price-feature starter-icon"><CheckIcon /> Daily Automated Backups</li>
                <li className="mn-price-feature starter-icon"><CheckIcon /> Standard Email Support</li>
              </ul>
              <button className="mn-btn-cta-ghost" style={{ width: "100%", marginTop: "auto" }} onClick={() => navigate("/auth")}>Get Started</button>
            </div>

            {/* Professional Plan */}
            <div className="mn-price-card pro">
              <div className="mn-popular-badge">Best for Growth</div>
              <div className="mn-price-header">
                <h3>Professional</h3>
                <p>The institutional standard for multi-branch retail</p>
                <div className="mn-price-amount">$79<span>/mo</span></div>
              </div>
              <ul className="mn-price-features">
                <li className="mn-price-feature pro-icon"><CheckIcon /> Multi-Branch Syncing (Up to 10)</li>
                <li className="mn-price-feature pro-icon"><CheckIcon /> Advanced Procurement (Purchase Orders)</li>
                <li className="mn-price-feature pro-icon"><CheckIcon /> Customer Loyalty & CRM Engine</li>
                <li className="mn-price-feature pro-icon"><CheckIcon /> Real-time Analytics Dashboard</li>
                <li className="mn-price-feature pro-icon"><CheckIcon /> Priority 24/7 Technical Support</li>
              </ul>
              <button className="mn-btn-cta-primary" style={{ width: "100%", marginTop: "auto" }} onClick={() => navigate("/auth")}>Scale Enterprise</button>
            </div>

            {/* Enterprise Plan */}
            <div className="mn-price-card enterprise">
              <div className="mn-price-header">
                <h3>Enterprise</h3>
                <p>Custom infrastructure for nationwide empires</p>
                <div className="mn-price-amount">Custom</div>
              </div>
              <ul className="mn-price-features">
                <li className="mn-price-feature enterprise-icon"><CheckIcon /> Unlimited Branches & Scale</li>
                <li className="mn-price-feature enterprise-icon"><CheckIcon /> Full Audit Log & Compliance Access</li>
                <li className="mn-price-feature enterprise-icon"><CheckIcon /> Custom API & ERP Integrations</li>
                <li className="mn-price-feature enterprise-icon"><CheckIcon /> Dedicated Success Manager</li>
                <li className="mn-price-feature enterprise-icon"><CheckIcon /> On-site Onboarding & Training</li>
              </ul>
              <button className="mn-btn-cta-ghost" style={{ width: "100%", marginTop: "auto" }} onClick={() => navigate("/auth")}>Contact Strategy Team</button>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section id="mn-about" className="mn-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="mn-about-content">
            <div className="mn-about-text">
              <span className="mn-section-label">Our Philosophy</span>
              <h2 className="mn-section-title">Redefining Retail Intelligence</h2>
              <p className="mn-section-sub" style={{ marginBottom: "2rem" }}>
                MartNexus was founded to solve a critical market failure: the gap 
                between high-end enterprise ERPs and simple POS apps. We provide 
                the world's most intuitive and powerful retail operating system.
              </p>
              <p className="mn-section-sub">
                Our team of engineers, data scientists, and retail veterans work 
                to ensure your business is always one step ahead, utilizing 
                modern cloud architecture to protect your financial and operational 
                integrity globally.
              </p>
            </div>
            <div className="mn-about-visual">
              <img src="/about_visual.png" alt="Global Retail Network" />
              <div className="mn-about-overlay">
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>Global Intelligence Network</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.25rem" }}>Real-time synchronization across 50+ countries</div>
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
