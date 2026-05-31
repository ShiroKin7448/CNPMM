import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";

const PALETTES = {
  home: {
    primary: "#C0FF6B",
    secondary: "#2dd4bf",
    hot: "#ffffff",
    fog: "#edf5ee",
    camera: [2.1, 2.2, 9.6],
  },
  shop: {
    primary: "#C0FF6B",
    secondary: "#60a5fa",
    hot: "#fff6bf",
    fog: "#f2f6f2",
    camera: [2.6, 2.7, 10.2],
  },
  detail: {
    primary: "#C0FF6B",
    secondary: "#38bdf8",
    hot: "#ffffff",
    fog: "#edf3f5",
    camera: [2.45, 2.9, 9.4],
  },
  auth: {
    primary: "#C0FF6B",
    secondary: "#a7f3d0",
    hot: "#ffffff",
    fog: "#101513",
    camera: [1.85, 1.4, 8.8],
  },
  profile: {
    primary: "#C0FF6B",
    secondary: "#22d3ee",
    hot: "#ffffff",
    fog: "#eef6f6",
    camera: [2.15, 2.2, 9.3],
  },
  users: {
    primary: "#C0FF6B",
    secondary: "#facc15",
    hot: "#ffffff",
    fog: "#f4f4ef",
    camera: [2.3, 2.35, 9.7],
  },
};

const getSceneKey = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/product")) return "detail";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/user")) return "users";
  return "auth";
};

const material = (color, options = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    metalness: options.metalness ?? 0.45,
    roughness: options.roughness ?? 0.34,
    transparent: options.opacity !== undefined,
    opacity: options.opacity ?? 1,
    emissive: options.emissive || "#000000",
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transmission: options.transmission ?? 0,
    clearcoat: options.clearcoat ?? 0.45,
    clearcoatRoughness: 0.35,
    side: options.side || THREE.FrontSide,
  });

const glowMaterial = (color, opacity = 0.72) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

const addMotion = (object, motion) => {
  object.userData.motion = motion;
  return object;
};

const createLaptop = (palette, scale = 1) => {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const dark = material("#111111", { metalness: 0.82, roughness: 0.28 });
  const graphite = material("#565f62", { metalness: 0.74, roughness: 0.3 });
  const limeGlow = glowMaterial(palette.primary, 0.62);

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 2.35), graphite);
  base.position.set(0, -0.18, 0.2);
  base.rotation.x = -0.06;
  group.add(base);

  const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.025, 0.5), material("#d5d5d5", { opacity: 0.34 }));
  trackpad.position.set(0, -0.06, 0.78);
  group.add(trackpad);

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.028, 0.12),
        material(row % 2 ? "#222222" : "#0c0c0c", {
          emissive: col % 3 === 0 ? palette.primary : "#000000",
          emissiveIntensity: col % 3 === 0 ? 0.22 : 0,
        })
      );
      key.position.set(-1.25 + col * 0.28, -0.02, -0.48 + row * 0.18);
      key.userData.motion = { type: "keyPulse", offset: row * 0.28 + col * 0.08 };
      group.add(key);
    }
  }

  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(3.28, 2.05, 0.14), dark);
  screenFrame.position.set(0, 1.02, -0.92);
  screenFrame.rotation.x = -0.42;
  group.add(screenFrame);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.82, 1.56), limeGlow);
  screen.position.set(0, 1.06, -0.835);
  screen.rotation.x = -0.42;
  screen.userData.motion = { type: "screenPulse", offset: 0 };
  group.add(screen);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.05, 24), material("#000000", { metalness: 0.8 }));
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.15, -0.83);
  group.add(hinge);

  return addMotion(group, { type: "float", amp: 0.18, speed: 0.85, offset: 0.2 });
};

const createProductCard = (palette, index) => {
  const group = new THREE.Group();
  const card = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.45, 0.08),
    material("#ffffff", { opacity: 0.78, metalness: 0.18, roughness: 0.24 })
  );
  const image = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.58), glowMaterial(index % 2 ? palette.secondary : palette.primary, 0.48));
  const price = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.035), material("#000000", { emissive: palette.primary, emissiveIntensity: 0.28 }));
  const lineA = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.045, 0.03), material("#656565", { opacity: 0.42 }));
  const lineB = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.045, 0.03), material("#656565", { opacity: 0.28 }));

  image.position.set(0, 0.31, 0.055);
  price.position.set(-0.1, -0.48, 0.07);
  lineA.position.set(0, -0.1, 0.065);
  lineB.position.set(-0.14, -0.25, 0.065);
  group.add(card, image, price, lineA, lineB);
  group.userData.baseIndex = index;
  return group;
};

const createParticleField = (palette, count = 150) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const speeds = [];

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = Math.random() * 7 - 2.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 11;
    speeds.push(0.35 + Math.random() * 0.8);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: palette.primary,
      size: 0.035,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  points.userData.motion = { type: "particles", speeds };
  return points;
};

const createGrid = (palette) => {
  const grid = new THREE.GridHelper(22, 34, new THREE.Color(palette.primary), new THREE.Color("#0b0b0b"));
  grid.position.y = -2.2;
  grid.material.transparent = true;
  grid.material.opacity = 0.17;
  grid.userData.motion = { type: "grid" };
  return grid;
};

const addDataRings = (root, palette, radius = 2.5) => {
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius + i * 0.36, 0.012, 10, 120),
      glowMaterial(i === 1 ? palette.secondary : palette.primary, 0.45 - i * 0.09)
    );
    ring.rotation.x = Math.PI / 2 + i * 0.28;
    ring.rotation.y = i * 0.42;
    ring.userData.motion = { type: "spin", axis: i % 2 ? "y" : "z", speed: 0.16 + i * 0.05 };
    root.add(ring);
  }
};

const buildHomeScene = (palette) => {
  const root = new THREE.Group();
  root.position.set(3.15, -0.15, -1.6);
  const laptop = createLaptop(palette, 1.12);
  laptop.position.set(0, -0.7, 0);
  laptop.rotation.y = -0.18;
  root.add(laptop);
  addDataRings(root, palette, 2.45);

  for (let i = 0; i < 8; i += 1) {
    const card = createProductCard(palette, i);
    const angle = (i / 8) * Math.PI * 2;
    card.position.set(Math.cos(angle) * 3.4, 0.2 + Math.sin(i) * 0.24, Math.sin(angle) * 2.2);
    card.rotation.y = -angle + Math.PI / 2;
    card.userData.motion = { type: "orbit", radiusX: 3.4, radiusZ: 2.2, speed: 0.22, angle, bob: 0.18 };
    root.add(card);
  }
  return root;
};

const buildShopScene = (palette) => {
  const root = new THREE.Group();
  root.position.set(3.05, -0.42, -1.35);
  root.scale.setScalar(0.88);
  const beltMat = material("#111111", { metalness: 0.72, roughness: 0.38, emissive: palette.primary, emissiveIntensity: 0.05 });
  const belt = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.22, 1.28), beltMat);
  belt.position.set(0, -1.05, 0);
  root.add(belt);

  for (let i = 0; i < 10; i += 1) {
    const box = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.52, 0.78),
      material(i % 2 ? "#ffffff" : "#d5d5d5", { metalness: 0.18, roughness: 0.26 })
    );
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.1, 0.84), glowMaterial(i % 3 ? palette.primary : palette.secondary, 0.72));
    band.position.y = 0.03;
    box.add(body, band);
    box.position.set(-4 + i * 0.9, -0.58, Math.sin(i) * 0.12);
    box.rotation.y = i * 0.35;
    box.userData.motion = { type: "conveyor", speed: 0.55, offset: i * 0.9 };
    root.add(box);
  }

  const scanner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 1.8), glowMaterial(palette.primary, 0.42));
  scanner.position.set(0, -0.04, 0);
  scanner.userData.motion = { type: "scanner" };
  root.add(scanner);

  const laptop = createLaptop(palette, 0.72);
  laptop.position.set(3.2, 0.35, -1.15);
  laptop.rotation.y = -0.75;
  root.add(laptop);
  return root;
};

const buildDetailScene = (palette) => {
  const root = new THREE.Group();
  root.position.set(3.05, -0.08, -1.4);
  root.scale.setScalar(0.92);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.85, 0.12), material("#0f1111", { metalness: 0.86, roughness: 0.24 }));
  const display = new THREE.Mesh(new THREE.PlaneGeometry(2.65, 1.38), glowMaterial(palette.secondary, 0.6));
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.16, 2.1), material("#596164", { metalness: 0.82, roughness: 0.27 }));
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.07, 0.78), material("#101010", { emissive: palette.primary, emissiveIntensity: 0.18 }));
  const chip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), material("#000000", { emissive: palette.primary, emissiveIntensity: 0.35 }));

  screen.position.set(0, 1.15, -0.9);
  display.position.set(0, 1.15, -0.82);
  base.position.set(0, -0.68, 0.35);
  board.position.set(-1.05, 0.05, 0.48);
  chip.position.set(0.62, 0.2, 0.15);
  screen.rotation.x = -0.38;
  display.rotation.x = -0.38;
  board.userData.motion = { type: "float", amp: 0.12, speed: 1.1, offset: 0.4 };
  chip.userData.motion = { type: "componentSpin", speed: 0.45 };

  root.add(screen, display, base, board, chip);

  const lineMat = new THREE.LineBasicMaterial({ color: palette.primary, transparent: true, opacity: 0.44 });
  const points = [
    new THREE.Vector3(-1.05, 0.05, 0.48), new THREE.Vector3(0, -0.68, 0.35),
    new THREE.Vector3(0.62, 0.2, 0.15), new THREE.Vector3(0, -0.68, 0.35),
    new THREE.Vector3(0, 1.15, -0.82), new THREE.Vector3(0, -0.68, 0.35),
  ];
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), lineMat);
  lines.userData.motion = { type: "linePulse", material: lineMat };
  root.add(lines);
  addDataRings(root, palette, 2.15);
  return root;
};

const buildAuthScene = (palette) => {
  const root = new THREE.Group();
  root.position.set(2.75, -0.22, -1.2);
  root.scale.setScalar(0.88);

  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05 + i * 0.34, 0.025, 16, 120), glowMaterial(i % 2 ? palette.secondary : palette.primary, 0.55 - i * 0.08));
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = i * 0.42;
    ring.userData.motion = { type: "spin", axis: "z", speed: (i % 2 ? -1 : 1) * (0.24 + i * 0.08) };
    root.add(ring);
  }

  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.78, 0.28), material("#101010", { emissive: palette.primary, emissiveIntensity: 0.22 }));
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.055, 16, 64, Math.PI), material("#d5d5d5", { metalness: 0.86, roughness: 0.22 }));
  shackle.rotation.z = Math.PI;
  shackle.position.y = 0.42;
  lockBody.userData.motion = { type: "float", amp: 0.08, speed: 1.35, offset: 0 };
  shackle.userData.motion = { type: "float", amp: 0.08, speed: 1.35, offset: 0 };
  root.add(lockBody, shackle);

  for (let i = 0; i < 6; i += 1) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.04), material("#ffffff", { opacity: 0.38, metalness: 0.1, roughness: 0.2 }));
    const angle = (i / 6) * Math.PI * 2;
    panel.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 1.2, Math.sin(angle) * 0.36);
    panel.rotation.y = -angle;
    panel.userData.motion = { type: "orbit", radiusX: 2.2, radiusZ: 0.45, speed: 0.18, angle, bob: 0.12 };
    root.add(panel);
  }
  return root;
};

const buildNetworkScene = (palette, dense = false) => {
  const root = new THREE.Group();
  root.position.set(3.0, -0.12, -1.45);
  root.scale.setScalar(dense ? 0.82 : 0.9);
  const count = dense ? 18 : 11;
  const nodes = [];
  const nodeMat = material("#ffffff", { metalness: 0.2, roughness: 0.2, emissive: palette.primary, emissiveIntensity: 0.14 });

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.58, 36, 24), material("#111111", { emissive: palette.primary, emissiveIntensity: 0.3 }));
  center.userData.motion = { type: "componentSpin", speed: 0.12 };
  root.add(center);

  for (let i = 0; i < count; i += 1) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.025, 24, 16), nodeMat.clone());
    const angle = (i / count) * Math.PI * 2;
    const radius = dense ? 2.15 + (i % 4) * 0.28 : 1.85 + (i % 3) * 0.25;
    node.position.set(Math.cos(angle) * radius, Math.sin(i * 0.7) * 1.2, Math.sin(angle) * radius * 0.7);
    node.userData.motion = { type: "node", angle, radius, speed: 0.16 + (i % 5) * 0.02, y: node.position.y };
    nodes.push(node);
    root.add(node);
  }

  const linePoints = [];
  nodes.forEach((node) => {
    linePoints.push(new THREE.Vector3(0, 0, 0), node.position.clone());
  });
  const lineMat = new THREE.LineBasicMaterial({ color: palette.secondary, transparent: true, opacity: 0.35 });
  const network = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(linePoints), lineMat);
  network.userData.motion = { type: "networkLines", nodes, material: lineMat };
  root.add(network);
  addDataRings(root, palette, dense ? 2.75 : 2.25);
  return root;
};

const buildSceneRoot = (key, palette) => {
  switch (key) {
    case "shop":
      return buildShopScene(palette);
    case "detail":
      return buildDetailScene(palette);
    case "auth":
      return buildAuthScene(palette);
    case "profile":
      return buildNetworkScene(palette, false);
    case "users":
      return buildNetworkScene(palette, true);
    case "home":
    default:
      return buildHomeScene(palette);
  }
};

const disposeObject = (object) => {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((item) => item.dispose());
    }
  });
};

const animateMotion = (object, elapsed) => {
  const motion = object.userData.motion;
  if (!motion) return;

  if (motion.type === "float") {
    if (object.userData.baseY === undefined) object.userData.baseY = object.position.y;
    object.position.y = object.userData.baseY + Math.sin(elapsed * motion.speed + motion.offset) * motion.amp;
    object.rotation.y += 0.0025;
  }
  if (motion.type === "spin") object.rotation[motion.axis] += motion.speed * 0.01;
  if (motion.type === "componentSpin") {
    object.rotation.x += motion.speed * 0.008;
    object.rotation.y += motion.speed * 0.012;
  }
  if (motion.type === "screenPulse" && object.material) {
    object.material.opacity = 0.44 + Math.sin(elapsed * 1.8) * 0.18;
  }
  if (motion.type === "keyPulse" && object.material?.emissiveIntensity !== undefined) {
    object.material.emissiveIntensity = Math.max(0, 0.12 + Math.sin(elapsed * 3.2 + motion.offset) * 0.18);
  }
  if (motion.type === "orbit") {
    if (object.userData.baseY === undefined) object.userData.baseY = object.position.y;
    const angle = motion.angle + elapsed * motion.speed;
    object.position.x = Math.cos(angle) * motion.radiusX;
    object.position.z = Math.sin(angle) * motion.radiusZ;
    object.position.y = object.userData.baseY + Math.sin(elapsed * 1.2 + motion.angle) * motion.bob;
    object.rotation.y = -angle + Math.PI / 2;
  }
  if (motion.type === "conveyor") {
    object.position.x -= motion.speed * 0.018;
    if (object.position.x < -4.4) object.position.x = 4.4;
    object.rotation.y += 0.012;
  }
  if (motion.type === "scanner") {
    object.position.x = Math.sin(elapsed * 1.55) * 3.2;
    object.material.opacity = 0.24 + Math.abs(Math.sin(elapsed * 1.55)) * 0.26;
  }
  if (motion.type === "linePulse" && motion.material) {
    motion.material.opacity = 0.26 + Math.abs(Math.sin(elapsed * 2.3)) * 0.34;
  }
  if (motion.type === "node") {
    const angle = motion.angle + elapsed * motion.speed;
    object.position.x = Math.cos(angle) * motion.radius;
    object.position.z = Math.sin(angle) * motion.radius * 0.7;
    object.position.y = motion.y + Math.sin(elapsed * 1.5 + motion.angle) * 0.2;
  }
  if (motion.type === "networkLines" && object.geometry) {
    const values = [];
    motion.nodes.forEach((node) => {
      values.push(new THREE.Vector3(0, 0, 0), node.position.clone());
    });
    object.geometry.setFromPoints(values);
    motion.material.opacity = 0.22 + Math.abs(Math.sin(elapsed * 1.6)) * 0.2;
  }
  if (motion.type === "particles") {
    const attr = object.geometry.attributes.position;
    for (let i = 0; i < attr.count; i += 1) {
      const y = attr.getY(i) + 0.002 * motion.speeds[i];
      attr.setY(i, y > 4.8 ? -2.3 : y);
    }
    attr.needsUpdate = true;
  }
  if (motion.type === "grid") {
    object.position.z = ((elapsed * 0.18) % 1) - 2.2;
  }
};

const TechScene3D = () => {
  const mountRef = useRef(null);
  const location = useLocation();
  const sceneKey = useMemo(() => getSceneKey(location.pathname), [location.pathname]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const palette = PALETTES[sceneKey] || PALETTES.home;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(palette.fog), 7, 17);

    const camera = new THREE.PerspectiveCamera(44, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(...palette.camera);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;
    renderer.domElement.className = "tech-scene-canvas";
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight("#ffffff", sceneKey === "auth" ? 1.4 : 1.05);
    const keyLight = new THREE.DirectionalLight(palette.hot, 2.4);
    const rimLight = new THREE.PointLight(palette.primary, 5, 9);
    keyLight.position.set(4, 7, 5);
    rimLight.position.set(-3, 1.8, 3.5);
    scene.add(ambient, keyLight, rimLight);

    const root = buildSceneRoot(sceneKey, palette);
    const grid = createGrid(palette);
    const particles = createParticleField(palette, sceneKey === "shop" || sceneKey === "users" ? 130 : 100);
    scene.add(root, grid, particles);

    const pointer = { x: 0, y: 0 };
    const handlePointer = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", handlePointer);

    const handleResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      root.rotation.y = Math.sin(elapsed * 0.16) * 0.14;
      root.rotation.x = Math.sin(elapsed * 0.11) * 0.035;
      scene.traverse((item) => animateMotion(item, elapsed));

      camera.position.x += ((palette.camera[0] + pointer.x * 0.38) - camera.position.x) * 0.045;
      camera.position.y += ((palette.camera[1] - pointer.y * 0.24) - camera.position.y) * 0.045;
      camera.lookAt(0, -0.15, 0);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", handleResize);
      disposeObject(scene);
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [sceneKey]);

  return (
    <div ref={mountRef} className={`tech-scene-3d tech-scene-${sceneKey}`} aria-hidden="true" />
  );
};

export default TechScene3D;
