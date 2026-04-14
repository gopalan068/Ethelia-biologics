import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import './index.css';

/* ============================================================
   ETHELIA BIOLOGICS — "The Living Blueprint"
   Complete single-file React application
   ============================================================ */

// ─── CONSTANTS ───
const COLORS = {
  primary: '#88a3c8',
  accent: '#41ed28',
  text: '#1a2332',
  bg: '#f4f7fb',
};


const DNA_BASES = 'ATCGATCGTAGCTAGCATCGATCGATCGATCGTAGCTAGCATCGATCGAATTCCGGTTAA';

const GENE_TOOLTIPS = [
  'HER2 variant · rs1799950 · Pathogenic',
  'BRCA1 · rs80357906 · Likely pathogenic',
  'TP53 · rs28934578 · Pathogenic',
  'EGFR · rs121434568 · Drug response',
  'CYP2D6 · rs3892097 · Poor metabolizer',
  'MTHFR · rs1801133 · Risk variant',
  'DPYD · rs3918290 · Toxicity risk',
  'TPMT · rs1800462 · Dose adjustment',
];

const PROTEIN_LABELS = ['BRCA1', 'TP53', 'EGFR', 'CYP2D6', 'KRAS', 'HER2', 'ALK', 'BRAF', 'PIK3CA', 'MTOR', 'AKT1', 'JAK2'];

const SPECIALTIES = [
  {
    title: 'Personalized Medicine',
    desc: 'Tailoring treatment to each patient\'s unique molecular profile through comprehensive multi-omics analysis.',
    icon: 'dna',
  },
  {
    title: 'Precision Oncology',
    desc: 'Targeting cancer at its molecular roots with biomarker-driven therapy selection and resistance monitoring.',
    icon: 'target',
  },
  {
    title: 'Genomics',
    desc: 'Decoding the static blueprint — whole genome sequencing to map every variant that defines individual biology.',
    icon: 'genome',
  },
  {
    title: 'Biomarkers',
    desc: 'Identifying measurable indicators of biological states for early detection and therapeutic monitoring.',
    icon: 'marker',
  },
  {
    title: 'Pharmacogenomics',
    desc: 'Predicting drug response from genetic variation — right drug, right dose, right patient, first time.',
    icon: 'pharma',
  },
  {
    title: 'Data-Driven Therapeutics',
    desc: 'Leveraging computational models and simulation to optimize therapeutic strategies before administration.',
    icon: 'data',
  },
];

const DRUG_CARDS_DATA = [
  {
    gene: 'CYP2C19',
    drug: 'Clopidogrel',
    population: '~28% affected',
    action: 'Consider alternative antiplatelet therapy for poor metabolizers',
  },
  {
    gene: 'TPMT',
    drug: 'Mercaptopurine',
    population: '~10% affected',
    action: 'Reduce dose by 50-90% for intermediate/poor metabolizers',
  },
  {
    gene: 'DPYD',
    drug: 'Fluorouracil',
    population: '~5-8% affected',
    action: 'Contraindicated in complete DPD deficiency; reduce dose otherwise',
  },
];

const PATHWAY_NODES = [
  { title: 'Genome', desc: 'The static blueprint — 3.2 billion base pairs encoding potential.', icon: 'genome' },
  { title: 'Transcriptome', desc: 'Gene expression patterns revealing which blueprints are active.', icon: 'rna' },
  { title: 'Proteome', desc: 'The functional machinery — proteins executing biological instructions.', icon: 'protein' },
  { title: 'Metabolome', desc: 'The dynamic reality — metabolites reflecting real-time biology.', icon: 'metabolite' },
  { title: 'Therapy', desc: 'Precision outcome — treatment tailored to individual molecular reality.', icon: 'therapy' },
];

// ─── CUSTOM HOOKS ───

function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.once !== false) observer.unobserve(el);
        } else if (options.once === false) {
          setIsInView(false);
        }
      },
      { threshold: options.threshold || 0.3, rootMargin: options.rootMargin || '0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}

function useMousePosition() {
  const pos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
}

function useCountUp(end, duration = 1500, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, end, duration]);
  return count;
}

// ─── SVG ICONS ───

function DNAIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4v40M36 4v40" strokeLinecap="round" />
      <path d="M12 8h24M12 16h24M12 24h24M12 32h24M12 40h24" strokeLinecap="round" opacity="0.5" />
      <circle cx="12" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="36" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none" />
      <circle cx="36" cy="16" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="24" r="2" fill="currentColor" stroke="none" />
      <circle cx="36" cy="24" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="20" />
      <circle cx="24" cy="24" r="13" />
      <circle cx="24" cy="24" r="6" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      <line x1="24" y1="0" x2="24" y2="8" />
      <line x1="24" y1="40" x2="24" y2="48" />
      <line x1="0" y1="24" x2="8" y2="24" />
      <line x1="40" y1="24" x2="48" y2="24" />
    </svg>
  );
}

function GenomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 4c0 12 28 12 28 24s-28 12-28 24" strokeLinecap="round" />
      <path d="M38 4c0 12-28 12-28 24s28 12 28 24" strokeLinecap="round" />
      <line x1="16" y1="10" x2="32" y2="10" opacity="0.4" />
      <line x1="14" y1="16" x2="34" y2="16" opacity="0.4" />
      <line x1="14" y1="32" x2="34" y2="32" opacity="0.4" />
      <line x1="16" y1="38" x2="32" y2="38" opacity="0.4" />
    </svg>
  );
}

function MarkerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="18" r="14" />
      <circle cx="24" cy="18" r="5" fill="currentColor" opacity="0.3" stroke="none" />
      <line x1="24" y1="32" x2="24" y2="46" strokeLinecap="round" />
      <line x1="18" y1="40" x2="30" y2="40" strokeLinecap="round" />
    </svg>
  );
}

function PharmaIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="16" width="32" height="24" rx="4" />
      <path d="M16 16V12a8 8 0 0116 0v4" />
      <line x1="24" y1="24" x2="24" y2="32" strokeLinecap="round" />
      <line x1="20" y1="28" x2="28" y2="28" strokeLinecap="round" />
    </svg>
  );
}

function DataIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="40" height="40" rx="4" />
      <polyline points="12,34 18,24 24,28 30,16 36,20" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="24" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="28" r="2" fill="currentColor" stroke="none" />
      <circle cx="30" cy="16" r="2" fill="currentColor" stroke="none" />
      <circle cx="36" cy="20" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RNAIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4c4 8 -2 16 6 24s2 16 6 20" strokeLinecap="round" />
      <circle cx="18" cy="12" r="3" fill="currentColor" opacity="0.3" stroke="none" />
      <circle cx="14" cy="24" r="3" fill="currentColor" opacity="0.3" stroke="none" />
      <circle cx="20" cy="36" r="3" fill="currentColor" opacity="0.3" stroke="none" />
      <line x1="18" y1="12" x2="30" y2="12" opacity="0.4" />
      <line x1="14" y1="24" x2="34" y2="24" opacity="0.4" />
      <line x1="20" y1="36" x2="32" y2="36" opacity="0.4" />
    </svg>
  );
}

function ProteinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 24c4-12 12-12 16 0s12 12 16 0" strokeLinecap="round" />
      <circle cx="16" cy="18" r="4" opacity="0.3" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24" r="4" opacity="0.3" fill="currentColor" stroke="none" />
      <circle cx="32" cy="18" r="4" opacity="0.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MetaboliteIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" />
      <polygon points="24,12 34,18 34,30 24,36 14,30 14,18" opacity="0.3" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TherapyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="24" cy="24" r="18" />
      <path d="M24 12v24M12 24h24" strokeLinecap="round" strokeWidth="2" />
      <circle cx="24" cy="24" r="8" opacity="0.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICON_MAP = {
  dna: DNAIcon,
  target: TargetIcon,
  genome: GenomeIcon,
  marker: MarkerIcon,
  pharma: PharmaIcon,
  data: DataIcon,
  rna: RNAIcon,
  protein: ProteinIcon,
  metabolite: MetaboliteIcon,
  therapy: TherapyIcon,
};

function HexMolecule({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" stroke="#88a3c8" strokeWidth="0.8">
      <polygon points="30,5 52,17 52,42 30,55 8,42 8,17" />
      <polygon points="30,15 42,22 42,37 30,45 18,37 18,22" />
      <line x1="30" y1="5" x2="30" y2="15" />
      <line x1="52" y1="17" x2="42" y2="22" />
      <line x1="52" y1="42" x2="42" y2="37" />
      <line x1="30" y1="55" x2="30" y2="45" />
      <line x1="8" y1="42" x2="18" y2="37" />
      <line x1="8" y1="17" x2="18" y2="22" />
      <circle cx="30" cy="5" r="2" fill="#88a3c8" />
      <circle cx="52" cy="17" r="2" fill="#88a3c8" />
      <circle cx="52" cy="42" r="2" fill="#88a3c8" />
      <circle cx="30" cy="55" r="2" fill="#88a3c8" />
      <circle cx="8" cy="42" r="2" fill="#88a3c8" />
      <circle cx="8" cy="17" r="2" fill="#88a3c8" />
    </svg>
  );
}

// ═══════════════════════════════════════
// EKG LOADER
// ═══════════════════════════════════════
function EKGLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`ekg-loader fade-out`}>
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path
          className="ekg-path ekg-animate"
          d="M0,20 L100,20 L150,20 L180,20 L200,20 L220,8 L235,32 L250,5 L265,35 L280,20 L310,20 L350,20 L400,20 L450,20 L480,20 L500,20 L520,8 L535,32 L550,5 L565,35 L580,20 L610,20 L650,20 L700,20 L750,20 L780,20 L800,20 L820,8 L835,32 L850,5 L865,35 L880,20 L910,20 L950,20 L1000,20 L1050,20 L1080,20 L1100,20 L1120,8 L1135,32 L1150,5 L1165,35 L1180,20 L1200,20"
        />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════
function CustomCursor() {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const trailPositions = useRef([]);
  const [hovering, setHovering] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const NUM_TRAILS = 6;
    trailPositions.current = Array(NUM_TRAILS).fill({ x: 0, y: 0 });

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onHoverIn = () => setHovering(true);
    const onHoverOut = () => setHovering(false);

    const interactiveEls = document.querySelectorAll('a, button, .nav-link, .nav-cta, .toggle-switch, .specialty-card, .pathway-node, .patient-card, .drug-card, .btn-primary, .btn-text, .footer-btn');
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', onHoverIn);
      el.addEventListener('mouseleave', onHoverOut);
    });

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;
      }

      // Update trail
      for (let i = trailRefs.current.length - 1; i >= 0; i--) {
        const target = i === 0 ? { x: cursorX, y: cursorY } : trailPositions.current[i - 1];
        if (!trailPositions.current[i]) trailPositions.current[i] = { x: cursorX, y: cursorY };
        trailPositions.current[i] = {
          x: trailPositions.current[i].x + (target.x - trailPositions.current[i].x) * 0.12,
          y: trailPositions.current[i].y + (target.y - trailPositions.current[i].y) * 0.12,
        };
        const dot = trailRefs.current[i];
        if (dot) {
          dot.style.left = `${trailPositions.current[i].x}px`;
          dot.style.top = `${trailPositions.current[i].y}px`;
          dot.style.opacity = `${0.3 - i * 0.045}`;
          dot.style.transform = `translate(-50%, -50%) scale(${1 - i * 0.12})`;
        }
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
      interactiveEls.forEach((el) => {
        el.removeEventListener('mouseenter', onHoverIn);
        el.removeEventListener('mouseleave', onHoverOut);
      });
    };
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`trail-${i}`}
          className="cursor-trail-dot"
          ref={(el) => { trailRefs.current[i] = el; }}
          style={{ background: COLORS.primary }}
        />
      ))}
      <div
        className={`custom-cursor ${hovering ? 'hovering' : ''}`}
        ref={cursorRef}
      >
        <div className="cursor-nucleus" />
        <div className="cursor-orbit">
          <div className="cursor-electron" />
        </div>
        <div className="cursor-orbit">
          <div className="cursor-electron" />
        </div>
        <div className="cursor-orbit">
          <div className="cursor-electron" />
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// FLOATING MOLECULES
// ═══════════════════════════════════════
function FloatingMolecules() {
  return (
    <div className="floating-molecules">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="floating-molecule">
          <HexMolecule size={60 + (i % 3) * 15} />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`nav ${visible ? 'visible' : ''} ${scrolled ? 'scrolled' : ''}`} id="nav">
      <div className="nav-logo">
        <span className="nav-logo-name">Ethelia</span>
        <span className="nav-logo-suffix">Biologics</span>
      </div>
      <ul className="nav-links">
        <li><a className="nav-link" onClick={() => scrollTo('about')} href="#about">About</a></li>
        <li><a className="nav-link" onClick={() => scrollTo('science')} href="#science">Science</a></li>
        <li><a className="nav-link" onClick={() => scrollTo('approach')} href="#approach">Approach</a></li>
        <li><a className="nav-link" onClick={() => scrollTo('contact')} href="#contact">Contact</a></li>
        <li><button className="nav-cta">Request Early Access</button></li>
      </ul>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════
// MODERN INTERACTIVE DNA HELIX — Drop-in replacement
// Features: mouse drag rotation, scroll zoom, smooth inertia
// Replace the old DNAHelix and GenomeTicker with this one
// ═══════════════════════════════════════════════════════

function DNAHelix() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // ── Scene Setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = false;

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const keyLight = new THREE.DirectionalLight(0xc8deff, 1.8);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00ffb3, 0.6);
    fillLight.position.set(-10, -6, 8);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0x7b61ff, 0.5);
    backLight.position.set(0, -10, -8);
    scene.add(backLight);

    const pointA = new THREE.PointLight(0x00d4ff, 2.5, 35);
    pointA.position.set(5, 10, 5);
    scene.add(pointA);

    const pointB = new THREE.PointLight(0x00ffb3, 1.8, 30);
    pointB.position.set(-5, -10, 5);
    scene.add(pointB);

    // ── DNA Parameters ──
    const NUM_PTS = 500;
    const RADIUS = 3.0;
    const HEIGHT = 26;
    const TURNS = 5;
    const RUNG_STEP = 12; // every Nth point gets a rung

    // ── Build strand points ──
    const s1 = [], s2 = [];
    for (let i = 0; i < NUM_PTS; i++) {
      const t = i / (NUM_PTS - 1);
      const angle = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HEIGHT;
      s1.push(new THREE.Vector3(Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS));
      s2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * RADIUS, y, Math.sin(angle + Math.PI) * RADIUS));
    }

    const helixGroup = new THREE.Group();

    // ── Strand material factory ──
    const mkStrand = (hex, emHex) => new THREE.MeshPhysicalMaterial({
      color: hex,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.55,      // glass-like
      thickness: 0.8,
      ior: 1.5,
      transparent: true,
      opacity: 0.88,
      emissive: emHex,
      emissiveIntensity: 0.35,
      envMapIntensity: 1.0,
    });

    const matBlue = mkStrand(0x00d4ff, 0x0055aa);
    const matGreen = mkStrand(0x00ffb3, 0x005544);

    // ── Backbone tubes ──
    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s1), 400, 0.14, 14, false),
      matBlue
    );
    const tube2 = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(s2), 400, 0.14, 14, false),
      matGreen
    );
    helixGroup.add(tube1, tube2);

    // ── Nucleotide spheres + rungs ──
    const nodeGeoB = new THREE.SphereGeometry(0.20, 20, 14);
    const nodeGeoG = new THREE.SphereGeometry(0.20, 20, 14);

    const matNodeBlue = new THREE.MeshPhysicalMaterial({
      color: 0x55eeff, emissive: 0x00aadd, emissiveIntensity: 0.6,
      metalness: 0.1, roughness: 0.0, transmission: 0.3, thickness: 0.5,
    });
    const matNodeGreen = new THREE.MeshPhysicalMaterial({
      color: 0x55ffcc, emissive: 0x00ddaa, emissiveIntensity: 0.5,
      metalness: 0.1, roughness: 0.0, transmission: 0.3, thickness: 0.5,
    });
    const matRungInner = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, emissive: 0xaaddff, emissiveIntensity: 0.2,
      metalness: 0.0, roughness: 0.1, transparent: true, opacity: 0.25,
    });

    for (let i = 0; i < NUM_PTS; i += RUNG_STEP) {
      const p1 = s1[i];
      const p2 = s2[i];
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const norm = dir.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);

      // Blue node
      const nb = new THREE.Mesh(nodeGeoB, matNodeBlue);
      nb.position.copy(p1);
      helixGroup.add(nb);

      // Green node
      const ng = new THREE.Mesh(nodeGeoG, matNodeGreen);
      ng.position.copy(p2);
      helixGroup.add(ng);

      // Rung rod — two halves colored
      const halfLen = len / 2;
      const q1 = new THREE.Vector3().lerpVectors(p1, mid, 0.5);
      const q2 = new THREE.Vector3().lerpVectors(mid, p2, 0.5);

      const cylGeo = new THREE.CylinderGeometry(0.045, 0.045, halfLen, 8);

      const rBlue = new THREE.Mesh(cylGeo, new THREE.MeshPhysicalMaterial({
        color: 0x00d4ff, emissive: 0x003366, emissiveIntensity: 0.3,
        transparent: true, opacity: 0.55, roughness: 0.2,
      }));
      rBlue.position.copy(q1);
      rBlue.quaternion.setFromUnitVectors(up, norm);
      helixGroup.add(rBlue);

      const rGreen = new THREE.Mesh(cylGeo, new THREE.MeshPhysicalMaterial({
        color: 0x00ffb3, emissive: 0x003322, emissiveIntensity: 0.3,
        transparent: true, opacity: 0.55, roughness: 0.2,
      }));
      rGreen.position.copy(q2);
      rGreen.quaternion.setFromUnitVectors(up, norm);
      helixGroup.add(rGreen);

      // Center junction — glowing pearl
      const jct = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 8),
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff, emissive: 0xaaffee, emissiveIntensity: 0.9,
          transparent: true, opacity: 0.7, roughness: 0.0,
        })
      );
      jct.position.copy(mid);
      helixGroup.add(jct);
    }

    // ── Floating particles ──
    const PCNT = 260;
    const mkParticles = (offsetAngle, color) => {
      const pos = new Float32Array(PCNT * 3);
      for (let i = 0; i < PCNT; i++) {
        const t = Math.random();
        const angle = t * Math.PI * 2 * TURNS + offsetAngle + (Math.random() - 0.5) * 1.8;
        const y = (t - 0.5) * HEIGHT;
        const r = RADIUS + (Math.random() - 0.5) * 3.5;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(angle) * r;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color, size: 0.065, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
    };

    const pBlue = mkParticles(0, 0x00d4ff);
    const pGreen = mkParticles(Math.PI, 0x00ffb3);
    helixGroup.add(pBlue, pGreen);

    scene.add(helixGroup);

    // ── Interaction State ──
    const state = {
      isDragging: false,
      prevX: 0, prevY: 0,
      velX: 0, velY: 0,
      rotX: 0.08, rotY: 0,
      zoom: 26,
    };

    const onPointerDown = (e) => {
      state.isDragging = true;
      state.prevX = e.clientX;
      state.prevY = e.clientY;
      state.velX = 0;
      state.velY = 0;
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.prevX;
      const dy = e.clientY - state.prevY;
      state.velX = dx * 0.012;
      state.velY = dy * 0.010;
      state.rotY += state.velX;
      state.rotX += state.velY;
      state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX));
      state.prevX = e.clientX;
      state.prevY = e.clientY;
    };

    const onPointerUp = () => {
      state.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      state.zoom += e.deltaY * 0.03;
      state.zoom = Math.max(12, Math.min(40, state.zoom));
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });

    // ── Touch support ──
    let lastTouchX = 0, lastTouchY = 0;
    const onTouchStart = (e) => {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      state.rotY += dx * 0.012;
      state.rotX += dy * 0.010;
      state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX));
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    // ── Animation ──
    let frameId;
    const clock = new THREE.Clock();
    const autoRotSpeed = 0.004;

    const animateParticles = (geo, dt) => {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < PCNT; i++) {
        pos[i * 3 + 1] += dt * 0.9;
        if (pos[i * 3 + 1] > HEIGHT / 2) pos[i * 3 + 1] = -HEIGHT / 2;
      }
      geo.attributes.position.needsUpdate = true;
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Auto-rotate when not dragging, apply inertia when released
      if (!state.isDragging) {
        state.rotY += autoRotSpeed;
        state.velX *= 0.92;
        state.velY *= 0.92;
        state.rotY += state.velX;
        state.rotX += state.velY;
      }

      helixGroup.rotation.y = state.rotY;
      helixGroup.rotation.x = state.rotX;

      // Smooth zoom
      camera.position.z += (state.zoom - camera.position.z) * 0.08;

      // Subtle breathe
      const breathe = 1 + Math.sin(elapsed * 0.7) * 0.012;
      helixGroup.scale.setScalar(breathe);

      // Orbit point lights for shimmer
      pointA.position.x = Math.cos(elapsed * 0.4) * 10;
      pointA.position.z = Math.sin(elapsed * 0.4) * 8;
      pointB.position.x = Math.sin(elapsed * 0.3) * 9;
      pointB.position.z = Math.cos(elapsed * 0.3) * 7;

      animateParticles(pBlue.geometry, dt);
      animateParticles(pGreen.geometry, dt);

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-canvas-wrap visible">
      <canvas ref={canvasRef} />
    </div>
  );
}
// ═══════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════
function HeroSection() {
  const [wordsVisible, setWordsVisible] = useState(false);
  const [subVisible, setSubVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [terminalText, setTerminalText] = useState('');
  const [ctaVisible, setCtaVisible] = useState(false);

  const terminalFullText = "We don't just observe biology. We simulate its intent.";

  useEffect(() => {
    setTimeout(() => setWordsVisible(true), 600);
    setTimeout(() => setSubVisible(true), 800);
    setTimeout(() => setTerminalVisible(true), 1000);
    setTimeout(() => setCtaVisible(true), 1400);

    // Typewriter effect
    let charIdx = 0;
    const typeTimer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        charIdx++;
        setTerminalText(terminalFullText.slice(0, charIdx));
        if (charIdx >= terminalFullText.length) clearInterval(typeInterval);
      }, 40);
    }, 1200);

    return () => clearTimeout(typeTimer);
  }, []);

  const headlineWords = ['Defining', 'the', 'Individual.', 'Refining', 'the', 'Therapy.'];

  return (
    <section className="hero section" id="hero">
      {/* Cell Membrane Background */}
      <div className="cell-membrane">
        <div className="membrane-blob" />
        <div className="membrane-blob" />
        <div className="membrane-blob" />
        <div className="membrane-blob" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <h1 className="hero-headline">
            {headlineWords.map((word, i) => (
              <span key={i}>
                <span
                  className={`word ${wordsVisible ? 'visible' : ''}`}
                  style={{
                    transitionDelay: `${600 + i * 100}ms`,
                    fontStyle: (word === 'Individual.' || word === 'Therapy.') ? 'italic' : 'normal',
                    fontWeight: (word === 'Individual.' || word === 'Therapy.') ? 600 : 300,
                    color: (word === 'Individual.' || word === 'Therapy.') ? COLORS.primary : COLORS.text,
                  }}
                >
                  {word}
                </span>{' '}
              </span>
            ))}
          </h1>

          <p className={`hero-sub ${subVisible ? 'visible' : ''}`}>
            While the industry focuses on the shared patterns of the many, we focus on the irreducible complexity of the one.
          </p>

          <div className={`hero-terminal ${terminalVisible ? 'visible' : ''}`}>
            <span style={{ color: COLORS.accent, opacity: 0.6 }}>{'> '}</span>
            {terminalText}
            <span className="cursor-blink" />
          </div>

          <div className={`hero-ctas ${ctaVisible ? 'visible' : ''}`}>
            <button className="btn-primary" onClick={() => document.getElementById('science')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Our Science
            </button>
            <a className="btn-text" href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Our Philosophy <span className="arrow">→</span>
            </a>
          </div>
        </div>

        <DNAHelix />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// PROTEIN GLOBE (Three.js)
// ═══════════════════════════════════════
function ProteinGlobe() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const labelRef = useRef(null);
  const [labelData, setLabelData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const globeGroup = new THREE.Group();

    // Generate nodes on sphere surface using fibonacci sphere
    const nodeCount = PROTEIN_LABELS.length;
    const globeRadius = 3;
    const nodes = [];
    const nodeMeshes = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = globeRadius * Math.sin(phi) * Math.cos(theta);
      const y = globeRadius * Math.sin(phi) * Math.sin(theta);
      const z = globeRadius * Math.cos(phi);

      const nodeGeo = new THREE.SphereGeometry(0.15, 12, 8);
      const nodeMat = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x88a3c8 : 0x41ed28,
        emissive: i % 2 === 0 ? 0x88a3c8 : 0x41ed28,
        emissiveIntensity: 0.3,
        shininess: 80,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { label: PROTEIN_LABELS[i], index: i };
      globeGroup.add(nodeMesh);
      nodes.push(new THREE.Vector3(x, y, z));
      nodeMeshes.push(nodeMesh);
    }

    // Edges between nearby nodes
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x88a3c8,
      transparent: true,
      opacity: 0.2,
    });

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < globeRadius * 1.5) {
          const points = [nodes[i], nodes[j]];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, edgeMat);
          globeGroup.add(line);
        }
      }
    }

    // Traveling particles along edges
    const travelParticleCount = 20;
    const travelParticleGeo = new THREE.BufferGeometry();
    const travelPositions = new Float32Array(travelParticleCount * 3);
    const travelData = [];

    for (let i = 0; i < travelParticleCount; i++) {
      const startIdx = Math.floor(Math.random() * nodeCount);
      let endIdx = Math.floor(Math.random() * nodeCount);
      if (endIdx === startIdx) endIdx = (startIdx + 1) % nodeCount;
      travelData.push({
        start: nodes[startIdx].clone(),
        end: nodes[endIdx].clone(),
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
      });
    }

    travelParticleGeo.setAttribute('position', new THREE.BufferAttribute(travelPositions, 3));
    const travelMat = new THREE.PointsMaterial({
      color: 0x41ed28,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const travelParticles = new THREE.Points(travelParticleGeo, travelMat);
    globeGroup.add(travelParticles);

    scene.add(globeGroup);

    // Raycaster for hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMouse.x;
        const deltaY = e.clientY - previousMouse.y;
        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;
        previousMouse = { x: e.clientX, y: e.clientY };
      }

      // Raycast for labels
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const projected = hit.position.clone().applyMatrix4(globeGroup.matrixWorld);
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * rect.width;
        const y = (-projected.y * 0.5 + 0.5) * rect.height;
        setLabelData({ label: hit.userData.label, x, y });
      } else {
        setLabelData(null);
      }
    };

    const onPointerDown = (e) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => { isDragging = false; };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Auto-rotate when not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.003;
      }

      // Update traveling particles
      const positions = travelParticles.geometry.attributes.position.array;
      for (let i = 0; i < travelParticleCount; i++) {
        const data = travelData[i];
        data.progress += data.speed;
        if (data.progress >= 1) {
          data.progress = 0;
          data.start = data.end.clone();
          const newEnd = Math.floor(Math.random() * nodeCount);
          data.end = nodes[newEnd].clone();
        }
        const pos = new THREE.Vector3().lerpVectors(data.start, data.end, data.progress);
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      }
      travelParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="protein-globe-wrap" style={{ cursor: 'none' }}>
      <canvas ref={canvasRef} />
      {labelData && (
        <div
          ref={labelRef}
          className="globe-label visible"
          style={{ left: labelData.x, top: labelData.y - 30 }}
        >
          {labelData.label}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// ABOUT SECTION
// ═══════════════════════════════════════
function AboutSection() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const count1 = useCountUp(1, 1200, inView);

  return (
    <section className="about section" id="about" ref={ref}>
      <div className="about-bg-hex" />
      <div className="section-inner">
        <div className="about-grid">
          <div>
            <p className={`section-label reveal ${inView ? 'visible' : ''}`}>Our Philosophy</p>
            <blockquote className={`about-quote reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.15s' }}>
              "We don't just <span className="highlight">observe</span> biology.
              We <span className="highlight">simulate</span> its intent."
            </blockquote>
          </div>

          <ProteinGlobe />

          <div className="about-stats">
            <div className={`stat-item ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.3s' }}>
              <div className="stat-number">{count1}</div>
              <div className="stat-label">Patient</div>
            </div>
            <div className={`stat-item ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.5s' }}>
              <div className="stat-number">{count1}</div>
              <div className="stat-label">Blueprint</div>
            </div>
            <div className={`stat-item ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.7s' }}>
              <div className="stat-number">{count1}</div>
              <div className="stat-label">Therapy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// METABOLIC PATHWAY
// ═══════════════════════════════════════
function MetabolicPathway() {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <div className="pathway-container" ref={ref}>
      {PATHWAY_NODES.map((node, i) => {
        const IconComp = ICON_MAP[node.icon] || GenomeIcon;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className={`pathway-node ${inView ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.2}s` }}
            >
              <IconComp className="pathway-node-icon" />
              <div className="pathway-node-title">{node.title}</div>
              <div className="pathway-node-desc">{node.desc}</div>
            </div>
            {i < PATHWAY_NODES.length - 1 && (
              <div
                className={`pathway-arrow ${inView ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.2 + 0.1}s` }}
              >
                <div className="pathway-arrow-line" />
                <div className="pathway-arrow-head" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// SCIENCE SECTION
// ═══════════════════════════════════════
function ScienceSection() {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <section className="science section" id="science" ref={ref}>
      <div className="hex-lattice" />
      <div className="section-inner">
        <div className="science-header">
          <p className={`section-label reveal ${inView ? 'visible' : ''}`}>The Synchronization Model</p>
          <h2 className={`section-title reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            Synchronizing the static <em>blueprint</em> of the genome
            with the dynamic <em>reality</em> of the metabolism.
          </h2>
        </div>
        <MetabolicPathway />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// PATIENT COMPARISON (Value Prop)
// ═══════════════════════════════════════
function PatientComparison() {
  const [precision, setPrecision] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.2 });

  const data = {
    traditional: {
      a: { efficacy: 72, toxicity: 45, response: 58 },
      b: { efficacy: 71, toxicity: 42, response: 55 },
    },
    precision: {
      a: { efficacy: 94, toxicity: 12, response: 91 },
      b: { efficacy: 38, toxicity: 65, response: 22 },
    },
  };

  const current = precision ? data.precision : data.traditional;

  return (
    <div ref={ref}>
      <div className="patient-comparison">
        <div className="patient-card patient-a">
          <div className="patient-card-header">
            <div className="patient-avatar">A</div>
            <div>
              <div className="patient-name">Patient A</div>
              <div className="patient-diagnosis">HER2+ Breast Cancer · Stage II</div>
            </div>
          </div>
          <div className="patient-bar-group">
            <div className="patient-bar-label">
              <span>Drug Efficacy</span>
              <span className="counter-value">{inView ? current.a.efficacy : 0}%</span>
            </div>
            <div className="patient-bar-track">
              <div
                className="patient-bar-fill efficacy"
                style={{ width: inView ? `${current.a.efficacy}%` : '0%' }}
              />
            </div>
          </div>
          <div className="patient-bar-group">
            <div className="patient-bar-label">
              <span>Toxicity Risk</span>
              <span className="counter-value">{inView ? current.a.toxicity : 0}%</span>
            </div>
            <div className="patient-bar-track">
              <div
                className="patient-bar-fill toxicity"
                style={{ width: inView ? `${current.a.toxicity}%` : '0%' }}
              />
            </div>
          </div>
          <div className="patient-bar-group">
            <div className="patient-bar-label">
              <span>Treatment Response</span>
              <span className="counter-value">{inView ? current.a.response : 0}%</span>
            </div>
            <div className="patient-bar-track">
              <div
                className="patient-bar-fill response"
                style={{ width: inView ? `${current.a.response}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        <div className="patient-card patient-b">
          <div className="patient-card-header">
            <div className="patient-avatar">B</div>
            <div>
              <div className="patient-name">Patient B</div>
              <div className="patient-diagnosis">HER2+ Breast Cancer · Stage II</div>
            </div>
          </div>
          <div className="patient-bar-group">
            <div className="patient-bar-label">
              <span>Drug Efficacy</span>
              <span className="counter-value">{inView ? current.b.efficacy : 0}%</span>
            </div>
            <div className="patient-bar-track">
              <div
                className="patient-bar-fill efficacy"
                style={{ width: inView ? `${current.b.efficacy}%` : '0%' }}
              />
            </div>
          </div>
          <div className="patient-bar-group">
            <div className="patient-bar-label">
              <span>Toxicity Risk</span>
              <span className="counter-value">{inView ? current.b.toxicity : 0}%</span>
            </div>
            <div className="patient-bar-track">
              <div
                className="patient-bar-fill toxicity"
                style={{ width: inView ? `${current.b.toxicity}%` : '0%' }}
              />
            </div>
          </div>
          <div className="patient-bar-group">
            <div className="patient-bar-label">
              <span>Treatment Response</span>
              <span className="counter-value">{inView ? current.b.response : 0}%</span>
            </div>
            <div className="patient-bar-track">
              <div
                className="patient-bar-fill response"
                style={{ width: inView ? `${current.b.response}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="toggle-container">
        <span className={`toggle-label ${!precision ? 'active' : ''}`}>Traditional Medicine</span>
        <div
          className={`toggle-switch ${precision ? 'active' : ''}`}
          onClick={() => setPrecision(!precision)}
          role="button"
          tabIndex={0}
          aria-label="Toggle between Traditional and Precision Medicine"
        >
          <div className="toggle-knob" />
        </div>
        <span className={`toggle-label ${precision ? 'active' : ''}`}>Precision Medicine</span>
      </div>

      {precision && (
        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          marginTop: '20px',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.7',
        }}>
          Same diagnosis, same drug — but Patient B carries a CYP2D6 poor-metabolizer variant.
          Precision medicine reveals the divergence before treatment begins.
        </p>
      )}
    </div>
  );
}

function ValuePropSection() {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <section className="valueprop section" id="approach" ref={ref}>
      <div className="section-inner">
        <div className="valueprop-header">
          <p className={`section-label reveal ${inView ? 'visible' : ''}`}>Why It Matters</p>
          <h2 className={`section-title reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            Same Diagnosis. Different <em>Biology</em>. Different <em>Outcome</em>.
          </h2>
        </div>
        <PatientComparison />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// CHROMOSOME IDEOGRAM
// ═══════════════════════════════════════
function ChromosomeIdeogram() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [activeGenes, setActiveGenes] = useState([]);

  useEffect(() => {
    if (!inView) return;
    const genes = ['CYP2C19', 'TPMT', 'DPYD'];
    genes.forEach((gene, i) => {
      setTimeout(() => {
        setActiveGenes((prev) => [...prev, gene]);
      }, 800 + i * 600);
    });
  }, [inView]);

  // Gene loci positions on chromosome
  const loci = [
    { gene: 'CYP2C19', x: 200, y: 38, band: '10q23.33' },
    { gene: 'TPMT', x: 400, y: 38, band: '6p22.3' },
    { gene: 'DPYD', x: 600, y: 38, band: '1p21.3' },
  ];

  return (
    <div className="chromosome-container" ref={ref}>
      <svg viewBox="0 0 800 100" className="chromosome-svg">
        {/* Chromosome body */}
        <rect x="50" y="25" width="700" height="30" rx="15" className="chromosome-body"
          style={{
            strokeDasharray: inView ? 'none' : '1600',
            strokeDashoffset: inView ? '0' : '1600',
            transition: 'stroke-dashoffset 1.5s ease',
          }}
        />

        {/* Centromere */}
        <ellipse cx="350" cy="40" rx="8" ry="15" fill="rgba(136,163,200,0.2)" stroke="#88a3c8" strokeWidth="1" />

        {/* Banding pattern */}
        {[100, 150, 220, 280, 320, 420, 480, 540, 620, 680].map((x, i) => (
          <rect key={i} x={x} y="28" width={12 + (i % 3) * 4} height="24" rx="2"
            fill={`rgba(136,163,200,${0.06 + (i % 3) * 0.04})`}
          />
        ))}

        {/* Gene loci */}
        {loci.map((locus, i) => (
          <g key={locus.gene}>
            <circle
              cx={locus.x}
              cy={locus.y}
              r="6"
              className={`gene-locus ${activeGenes.includes(locus.gene) ? 'active' : ''}`}
              style={{ transitionDelay: `${i * 0.3}s` }}
            />
            <text
              x={locus.x}
              y={locus.y - 18}
              textAnchor="middle"
              className={`gene-label ${activeGenes.includes(locus.gene) ? 'active' : ''}`}
              style={{ transitionDelay: `${i * 0.3 + 0.2}s` }}
            >
              {locus.gene}
            </text>
            <text
              x={locus.x}
              y={locus.y + 28}
              textAnchor="middle"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                fill: '#8a9bb2',
                opacity: activeGenes.includes(locus.gene) ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.3 + 0.3}s`,
              }}
            >
              {locus.band}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function PharmacogenomicsSection() {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <section className="pharmaco section" id="pharmacogenomics" ref={ref}>
      <div className="section-inner">
        <div className="pharmaco-header">
          <p className={`section-label reveal ${inView ? 'visible' : ''}`}>Pharmacogenomics</p>
          <h2 className={`section-title reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            Your Genes. Your <em>Dose</em>. Your <em>Response</em>.
          </h2>
        </div>

        <ChromosomeIdeogram />

        <div className="drug-cards">
          {DRUG_CARDS_DATA.map((card, i) => (
            <div
              key={card.gene}
              className={`drug-card ${inView ? 'visible' : ''}`}
              style={{ transitionDelay: `${1.5 + i * 0.2}s` }}
            >
              <div className="drug-card-gene">{card.gene}</div>
              <div className="drug-card-name">{card.drug}</div>
              <div className="drug-card-stat">Affected: {card.population}</div>
              <div className="drug-card-action">↳ {card.action}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// SPECIALTIES SECTION
// ═══════════════════════════════════════
function SpecialtiesSection() {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <section className="specialties section" id="specialties" ref={ref}>
      <div className="section-inner">
        <div className="specialties-header">
          <p className={`section-label reveal ${inView ? 'visible' : ''}`}>What We Do</p>
          <h2 className={`section-title reveal ${inView ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
            Beyond populations. Beyond averages. Into the <em>biology of one</em>.
          </h2>
        </div>

        <div className="specialties-grid">
          {SPECIALTIES.map((spec, i) => {
            const IconComp = ICON_MAP[spec.icon] || GenomeIcon;
            return (
              <div
                key={spec.title}
                className={`specialty-card reveal ${inView ? 'visible' : ''}`}
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
              >
                <IconComp className="specialty-icon" />
                <h3 className="specialty-title">{spec.title}</h3>
                <p className="specialty-desc">{spec.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════
function Footer() {
  // Generate helix divider path
  const helixPath1 = useMemo(() => {
    let d = 'M0,20';
    for (let x = 0; x <= 1200; x += 2) {
      const y = 20 + Math.sin(x * 0.03) * 12;
      d += ` L${x},${y}`;
    }
    return d;
  }, []);

  const helixPath2 = useMemo(() => {
    let d = 'M0,20';
    for (let x = 0; x <= 1200; x += 2) {
      const y = 20 + Math.sin(x * 0.03 + Math.PI) * 12;
      d += ` L${x},${y}`;
    }
    return d;
  }, []);

  return (
    <footer className="footer" id="contact">
      <div className="footer-helix-divider">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d={helixPath1} className="helix-divider-path" />
          <path d={helixPath2} className="helix-divider-path" style={{ opacity: 0.15 }} />
        </svg>
      </div>

      <h2 className="footer-tagline">
        Defining the <em>Individual</em>.
      </h2>
      <p className="footer-cta-text">The future of medicine is personal. Be part of it.</p>

      <button className="footer-btn">Request Early Access</button>

      <div className="footer-links">
        <a href="https://linkedin.com" className="footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:contact@etheliabiologics.com" className="footer-link">contact@etheliabiologics.com</a>
      </div>

      <p className="footer-location">Erode, Tamil Nadu, India · Est. 2026</p>
    </footer>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  return (
    <>
      <EKGLoader />
      <CustomCursor />
      <FloatingMolecules />
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ScienceSection />
        <ValuePropSection />
        <PharmacogenomicsSection />
        <SpecialtiesSection />
        <Footer />
      </main>
    </>
  );
}
