import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const SANS = 'Geist, Helvetica, Arial, sans-serif';
const MONO = '"Geist Mono", ui-monospace, monospace';

// Frasco 50 ml em 3D, mesmas proporções do desenho em SVG (bottle.js).
export function createBottle(canvas, { background = '#EDECE9' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0.15, 11);

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 4, 5);
  scene.add(key);

  const bottle = new THREE.Group();
  scene.add(bottle);

  const W = 1.9, H = 2.76, D = 1.05;
  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(W, H, D, 6, 0.09),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, thickness: 1.2, roughness: 0, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1 }),
  );
  bottle.add(glass);

  const juiceH = H * 0.76;
  const juiceMat = new THREE.MeshPhysicalMaterial({ color: 0xe9e6ee, roughness: 0.3, envMapIntensity: 0.35 });
  const juice = new THREE.Mesh(new RoundedBoxGeometry(W - 0.24, juiceH, D - 0.22, 4, 0.04), juiceMat);
  juice.position.y = H / 2 - H * 0.16 - juiceH / 2;
  bottle.add(juice);

  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, H - 0.35, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
  tube.position.set(0, 0.06, D / 2 - 0.12);
  bottle.add(tube);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 48), new THREE.MeshStandardMaterial({ color: 0xd3d0ca, metalness: 1, roughness: 0.28 }));
  neck.position.y = H / 2 + 0.07;
  bottle.add(neck);

  const capMat = new THREE.MeshStandardMaterial({ color: 0xf1efea, roughness: 0.55 });
  const cap = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.69, 1.0, 4, 0.025), capMat);
  cap.position.y = H / 2 + 0.14 + 0.345;
  bottle.add(cap);

  // Etiqueta de papel
  const lc = document.createElement('canvas');
  lc.width = 1024; lc.height = 885;
  const lt = new THREE.CanvasTexture(lc);
  lt.colorSpace = THREE.SRGBColorSpace;
  lt.anisotropy = 8;
  const labelW = W * 0.7;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(labelW, labelW * 0.865), new THREE.MeshBasicMaterial({ map: lt, toneMapped: false }));
  label.position.set(0, H / 2 - H * 0.3 - (labelW * 0.865) / 2, D / 2 + 0.004);
  bottle.add(label);

  // Sombra de contato
  const sc = document.createElement('canvas');
  sc.width = sc.height = 256;
  const sg = sc.getContext('2d');
  const grd = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.28)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = grd;
  sg.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  function drawLabel(name, size = '50 ML') {
    const g = lc.getContext('2d');
    const w = lc.width, h = lc.height, px = w * 0.09;
    g.fillStyle = '#F8F7F3';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#111111';
    g.font = `400 44px ${MONO}`;
    g.fillText('LE SENSIER', px, h * 0.2);
    g.font = `500 82px ${SANS}`;
    const lines = [];
    let cur = '';
    for (const wd of name.toUpperCase().split(' ')) {
      const test = (cur + ' ' + wd).trim();
      if (g.measureText(test).width > w * 0.82 && cur) { lines.push(cur); cur = wd; } else cur = test;
    }
    lines.push(cur);
    lines.slice(0, 3).forEach((l, i) => g.fillText(l, px, h * 0.43 + i * 92));
    g.font = `400 44px ${MONO}`;
    g.fillText('PARFUM', px, h * 0.88);
    g.textAlign = 'right';
    g.fillText(size, w - px, h * 0.88);
    g.textAlign = 'left';
    lt.needsUpdate = true;
  }

  const state = { spin: 0, px: 0, py: 0, drag: 0 };
  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    const s = Math.min(0.88, camera.aspect * 0.95);
    bottle.scale.setScalar(s);
    shadow.scale.setScalar(s);
    shadow.position.y = (-H / 2 - 0.01) * s;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    state.px = (e.clientX / window.innerWidth) * 2 - 1;
    state.py = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let running = false, raf = 0;
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    bottle.rotation.y = state.spin + state.drag + Math.sin(t * 0.4) * 0.22 + state.px * 0.2;
    bottle.rotation.x = state.py * 0.05;
    bottle.position.y = Math.sin(t * 0.9) * 0.03;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; frame(); }
    else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
  }).observe(canvas);

  // Arrastar para girar
  let dragX = null;
  canvas.addEventListener('pointerdown', (e) => { dragX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (dragX !== null) { state.drag += (e.clientX - dragX) * 0.01; dragX = e.clientX; } });
  canvas.addEventListener('pointerup', () => (dragX = null));

  resize();
  return { state, drawLabel, juice: juiceMat, cap: capMat, scene };
}
