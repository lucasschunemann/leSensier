import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { caps } from './families.js';

const SERIF = '"Bodoni Moda", serif';
const SANS = 'Geist, sans-serif';

function travertine(w = 512, h = 512) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  // veios horizontais e poros: a textura multiplica a cor da tampa
  for (let i = 0; i < 140; i++) {
    const y = Math.random() * h;
    g.strokeStyle = `rgba(120,105,85,${Math.random() * 0.12})`;
    g.lineWidth = Math.random() * 3 + 0.5;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3);
    g.stroke();
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(90,78,60,${Math.random() * 0.25})`;
    g.beginPath();
    g.ellipse(Math.random() * w, Math.random() * h, Math.random() * 3 + 0.4, Math.random() * 1.2 + 0.2, 0, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function createStage(canvas, { onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);

  // Fundo: plano opaco com o nome em tipografia grande, para o vidro refratar.
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d');
  const bgTex = new THREE.CanvasTexture(bgCanvas);
  bgTex.colorSpace = THREE.SRGBColorSpace;
  const bgMat = new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false });
  const bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bgPlane.position.z = -4;
  scene.add(bgPlane);

  // Frasco
  const bottle = new THREE.Group();
  scene.add(bottle);

  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(2.0, 2.4, 1.15, 8, 0.14),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 1, thickness: 1.6, roughness: 0, ior: 1.5, dispersion: 0.4,
      metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, envMapIntensity: 0.9,
    }),
  );
  bottle.add(glass);

  const juiceMat = new THREE.MeshPhysicalMaterial({ color: 0xc3d0d3, roughness: 0.32, metalness: 0, clearcoat: 0.3, envMapIntensity: 0.55 });
  const juice = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.62, 0.66, 6, 0.05), juiceMat);
  juice.position.y = 0.2;
  bottle.add(juice);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.14, 64),
    new THREE.MeshStandardMaterial({ color: 0xd8d2c6, metalness: 1, roughness: 0.32 }),
  );
  collar.position.y = 1.27;
  bottle.add(collar);

  const stone = travertine();
  const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(caps.autoral.mid), roughness: 0.82, map: stone });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.92, 96), capMat);
  cap.position.y = 1.8;
  bottle.add(cap);

  // Impressão no vidro (frente)
  const printCanvas = document.createElement('canvas');
  printCanvas.width = 1024; printCanvas.height = 1024;
  const printTex = new THREE.CanvasTexture(printCanvas);
  printTex.colorSpace = THREE.SRGBColorSpace;
  printTex.anisotropy = 8;
  const print = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshBasicMaterial({ map: printTex, transparent: true, toneMapped: false, depthWrite: false }),
  );
  print.position.set(0, 0.15, 0.578);
  bottle.add(print);

  const state = {
    bg: new THREE.Color('#F3F0EA'),
    ink: new THREE.Color('#141311'),
    words: [{ text: 'LE SENSIER', a: 1, tracking: 0.14 }],
    printName: '',
    printInk: '#141311',
    w: 1, h: 1,
    pointer: { x: 0, y: 0 },
    spin: 0,
    scale: 1,
    lift: 0,
  };

  function drawPrint() {
    const g = printCanvas.getContext('2d');
    g.clearRect(0, 0, 1024, 1024);
    g.fillStyle = state.printInk;
    g.textAlign = 'center';
    g.globalAlpha = 0.85;
    g.font = `400 46px ${SANS}`;
    g.letterSpacing = '18px';
    g.fillText('LE SENSIER', 512, 330);
    g.globalAlpha = 1;
    g.letterSpacing = '0px';
    g.font = `400 96px ${SERIF}`;
    g.fillText(state.printName, 512, 500);
    g.globalAlpha = 0.7;
    g.font = `400 38px ${SANS}`;
    g.letterSpacing = '12px';
    g.fillText('PARFUM 50 ML', 512, 640);
    printTex.needsUpdate = true;
  }

  function drawBg() {
    const { w, h } = state;
    const g = bgCtx;
    g.fillStyle = '#' + state.bg.getHexString();
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#' + state.ink.getHexString();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const word of state.words) {
      if (word.a <= 0.001) continue;
      g.globalAlpha = word.a;
      g.letterSpacing = '0px';
      let size = h * 0.42;
      g.font = `400 ${size}px ${SERIF}`;
      const track = word.tracking * size;
      g.letterSpacing = `${track}px`;
      const mw = g.measureText(word.text).width;
      const max = w * 0.92;
      if (mw > max) {
        size *= max / mw;
        g.font = `400 ${size}px ${SERIF}`;
        g.letterSpacing = `${word.tracking * size}px`;
      }
      // compensa o espaçamento após a última letra
      g.fillText(word.text, w / 2 + (word.tracking * size) / 2, h * 0.5 + (word.dy || 0) * h);
    }
    g.globalAlpha = 1;
    bgTex.needsUpdate = true;
  }

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    const W = r.width, H = r.height;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const dist = camera.position.z - bgPlane.position.z;
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    bgPlane.scale.set(vh * camera.aspect, vh, 1);
    const k = Math.min(window.devicePixelRatio, 1.5);
    state.w = bgCanvas.width = Math.round(Math.min(2400, W * k));
    state.h = bgCanvas.height = Math.round(state.w * (H / W));
    state.scale = Math.min(0.82, Math.max(0.42, camera.aspect * 0.62));
    drawBg();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    state.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let running = false;
  let raf = 0;
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    bottle.rotation.y = state.spin + Math.sin(t * 0.35) * 0.18 + state.pointer.x * 0.25;
    bottle.rotation.x = -0.06 + state.pointer.y * 0.08;
    bottle.rotation.z = Math.sin(t * 0.5) * 0.015;
    bottle.position.y = 0.12 + Math.sin(t * 0.8) * 0.04 + state.lift;
    bottle.scale.setScalar(state.scale);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; clock.start(); frame(); }
    else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(canvas);

  resize();
  drawPrint();
  onReady?.();

  return {
    state,
    drawBg,
    drawPrint,
    juice: juiceMat,
    cap: capMat,
    stone,
    resize,
  };
}
