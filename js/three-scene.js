/**
 * ShopEasy 3D Hero Scene
 * A soft, glossy "clay and glass" scene using Three.js:
 * Floating rounded objects (large sphere, torus, capsule, rounded cube, satellite spheres)
 * in sage, cream, terracotta and mustard.
 * Features:
 * - Gentle sine-wave floating and multi-axis rotation
 * - Smooth lerped mouse parallax and tilt
 * - Scroll drift and separation
 * - Hover reaction (scale and faster spin)
 * - Click reaction on big sphere cycling palette colors
 * - Transparent canvas
 * - Performance: max pixel ratio 2, pauses when tab is hidden or off-screen, handles resize,
 *   clean fallback for reduced motion or missing WebGL.
 */
(function initThreeHeroScene() {
  const container = document.getElementById("hero-canvas-wrap");
  const canvas = document.getElementById("hero-canvas");
  if (!container || !canvas) return;

  // 1. Check prefers-reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    container.classList.add("reduced-motion-fallback");
    return;
  }

  // 2. Check WebGL support
  function isWebGLSupported() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  if (typeof THREE === "undefined" || !isWebGLSupported()) {
    console.info("[ShopEasy 3D] WebGL unavailable or Three.js not loaded. Showing static gradient.");
    container.classList.add("static-fallback");
    return;
  }

  let scene, camera, renderer, masterGroup;
  let bigSphere, torus, capsuleGroup, roundedCube, satellites = [];
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0, targetRotationY = 0;
  let isHovered = false;
  let hoverSpeedMultiplier = 1.0;
  let hoverScaleMultiplier = 1.0;
  let scrollProgress = 0;
  let isTabActive = true;
  let isVisibleOnScreen = true;
  let animationFrameId = null;
  const clock = new THREE.Clock();

  // Color Palette
  const PALETTE = {
    sage: 0x4a7c59,
    cream: 0xfaf3dd,
    terracotta: 0xc8553d,
    mustard: 0xe0a458,
    mint: 0xb8d8be,
    forest: 0x1f3a2b
  };

  const sphereColors = [PALETTE.sage, PALETTE.terracotta, PALETTE.mustard, PALETTE.mint, PALETTE.cream];
  let currentSphereColorIndex = 0;

  try {
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const isMobile = window.innerWidth < 768;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 11 : 9);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 3. Lighting (Soft key, fill, and warm rim)
    const ambientLight = new THREE.AmbientLight(0xfffbf5, 1.1);
    scene.add(ambientLight);

    // Soft Key Light (top-right front)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);

    // Soft Mint Fill Light (bottom-left front)
    const fillLight = new THREE.DirectionalLight(0xb8d8be, 1.2);
    fillLight.position.set(-6, -3, 5);
    scene.add(fillLight);

    // Warm Mustard Rim Light (behind)
    const rimLight = new THREE.DirectionalLight(0xe0a458, 2.4);
    rimLight.position.set(2, -6, -7);
    scene.add(rimLight);

    // 4. Object Geometries & Clay/Glass Materials
    masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Material Helper: Soft glossy clay/ceramic feel
    function createClayMaterial(color, roughness = 0.28, metalness = 0.08) {
      return new THREE.MeshPhysicalMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness,
        clearcoat: 0.65,
        clearcoatRoughness: 0.15,
        reflectivity: 0.8
      });
    }

    // A. Central Big Sphere (Glossy Sage)
    const sphereGeo = new THREE.SphereGeometry(1.6, isMobile ? 32 : 64, isMobile ? 32 : 64);
    const sphereMat = createClayMaterial(sphereColors[0], 0.22, 0.05);
    bigSphere = new THREE.Mesh(sphereGeo, sphereMat);
    bigSphere.position.set(isMobile ? 0 : 1.4, 0.1, 0);
    masterGroup.add(bigSphere);

    // B. Torus (Terracotta)
    const torusGeo = new THREE.TorusGeometry(1.8, 0.42, 24, isMobile ? 48 : 80);
    const torusMat = createClayMaterial(PALETTE.terracotta, 0.25, 0.06);
    torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(isMobile ? 0 : 1.3, 0.2, -0.6);
    torus.rotation.x = Math.PI / 3;
    torus.rotation.y = Math.PI / 6;
    masterGroup.add(torus);

    // C. Floating Capsule (Warm Mustard)
    capsuleGroup = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.4, 32);
    const capTopGeo = new THREE.SphereGeometry(0.48, 32, 16);
    const capMat = createClayMaterial(PALETTE.mustard, 0.26, 0.08);

    const cylMesh = new THREE.Mesh(cylGeo, capMat);
    const topMesh = new THREE.Mesh(capTopGeo, capMat);
    topMesh.position.y = 0.7;
    const botMesh = new THREE.Mesh(capTopGeo, capMat);
    botMesh.position.y = -0.7;

    capsuleGroup.add(cylMesh, topMesh, botMesh);
    capsuleGroup.position.set(isMobile ? -1.8 : -1.5, 1.4, 0.8);
    capsuleGroup.rotation.z = Math.PI / 4;
    capsuleGroup.rotation.x = 0.4;
    masterGroup.add(capsuleGroup);

    // D. Rounded Soft Cube (Cream)
    const cubeGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1, 8, 8, 8);
    // Smooth vertices slightly to round edges
    const pos = cubeGeo.attributes.position;
    const tempV = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      tempV.fromBufferAttribute(pos, i);
      tempV.normalize().multiplyScalar(0.78);
      // Blend original box pos with sphere pos for soft rounded cube
      pos.setXYZ(
        i,
        pos.getX(i) * 0.75 + tempV.x * 0.25,
        pos.getY(i) * 0.75 + tempV.y * 0.25,
        pos.getZ(i) * 0.75 + tempV.z * 0.25
      );
    }
    cubeGeo.computeVertexNormals();

    const cubeMat = createClayMaterial(PALETTE.cream, 0.32, 0.04);
    roundedCube = new THREE.Mesh(cubeGeo, cubeMat);
    roundedCube.position.set(isMobile ? 1.6 : 3.4, -1.2, 0.5);
    roundedCube.rotation.set(0.6, 0.7, 0.3);
    masterGroup.add(roundedCube);

    // E. Satellite Spheres (Soft Mint & Accent)
    const satConfigs = [
      { radius: 0.4, color: PALETTE.mint, pos: [-2.4, -1.4, 1.2], speed: 1.2 },
      { radius: 0.28, color: PALETTE.terracotta, pos: [3.2, 1.6, -1.0], speed: 0.85 },
      { radius: 0.22, color: PALETTE.mustard, pos: [-0.6, 2.2, -0.8], speed: 1.4 }
    ];

    if (!isMobile) {
      satConfigs.forEach(cfg => {
        const geo = new THREE.SphereGeometry(cfg.radius, 32, 32);
        const mat = createClayMaterial(cfg.color, 0.2, 0.05);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...cfg.pos);
        mesh.userData = { initialPos: mesh.position.clone(), speed: cfg.speed };
        masterGroup.add(mesh);
        satellites.push(mesh);
      });
    }

    // 5. Mouse Parallax & Raycaster
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2(-999, -999);

    window.addEventListener("mousemove", (e) => {
      // Normalize mouse (-1 to 1)
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      targetRotationY = mouseX * 0.45;
      targetRotationX = -mouseY * 0.35;

      mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Hover detection over hero container
    container.addEventListener("mouseenter", () => {
      isHovered = true;
    });
    container.addEventListener("mouseleave", () => {
      isHovered = false;
      mouseVector.set(-999, -999);
    });

    // Click reaction: cycle big sphere color
    window.addEventListener("click", (e) => {
      // Only react if click is within hero area
      const rect = container.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        return;
      }

      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObject(bigSphere);

      if (intersects.length > 0) {
        currentSphereColorIndex = (currentSphereColorIndex + 1) % sphereColors.length;
        const newColor = sphereColors[currentSphereColorIndex];

        // Animate color change and slight pulse
        bigSphere.material.color.setHex(newColor);
        bigSphere.scale.set(1.15, 1.15, 1.15);
        setTimeout(() => {
          bigSphere.scale.set(1, 1, 1);
        }, 220);

        if (typeof UI !== "undefined") {
          UI.toast("Clay sphere color updated ✨", "info");
        }
      }
    });

    // 6. Scroll Reaction (drift and separate objects)
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const heroHeight = container.clientHeight || 700;
      scrollProgress = Math.min(scrollY / heroHeight, 1.5);
    }, { passive: true });

    // 7. Animation Loop
    function animate() {
      if (!isTabActive || !isVisibleOnScreen) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = clock.getElapsedTime();

      // Smooth hover transitions
      const targetSpeed = isHovered ? 1.6 : 1.0;
      hoverSpeedMultiplier += (targetSpeed - hoverSpeedMultiplier) * 0.05;

      const targetScale = isHovered ? 1.04 : 1.0;
      hoverScaleMultiplier += (targetScale - hoverScaleMultiplier) * 0.05;

      // Smooth lerp parallax rotation
      masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.04;
      masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.04;

      // Scroll separation: drift camera and separate objects slightly
      camera.position.y = -scrollProgress * 2.5;
      camera.position.z = (isMobile ? 11 : 9) + scrollProgress * 1.5;

      // Floating sine-wave motion for each object
      const t = elapsed * hoverSpeedMultiplier;

      // Big sphere
      bigSphere.position.y = 0.1 + Math.sin(t * 1.1) * 0.18;
      bigSphere.rotation.y += 0.003 * hoverSpeedMultiplier;
      bigSphere.rotation.x += 0.002 * hoverSpeedMultiplier;

      // Torus
      torus.position.y = 0.2 + Math.cos(t * 0.9) * 0.16 + scrollProgress * 0.4;
      torus.rotation.z += 0.006 * hoverSpeedMultiplier;
      torus.rotation.x += 0.004 * hoverSpeedMultiplier;

      // Capsule
      capsuleGroup.position.y = 1.4 + Math.sin(t * 1.3 + 1) * 0.22 - scrollProgress * 0.6;
      capsuleGroup.rotation.y += 0.008 * hoverSpeedMultiplier;
      capsuleGroup.rotation.z += 0.005 * hoverSpeedMultiplier;

      // Rounded Cube
      roundedCube.position.y = -1.2 + Math.cos(t * 1.2 + 2) * 0.2 + scrollProgress * 0.5;
      roundedCube.rotation.x += 0.007 * hoverSpeedMultiplier;
      roundedCube.rotation.y += 0.009 * hoverSpeedMultiplier;

      // Satellite spheres
      satellites.forEach((sat, idx) => {
        const initPos = sat.userData.initialPos;
        const spd = sat.userData.speed;
        sat.position.y = initPos.y + Math.sin(t * spd + idx) * 0.25;
        sat.position.x = initPos.x + Math.cos(t * spd * 0.7 + idx) * 0.18;
      });

      masterGroup.scale.set(hoverScaleMultiplier, hoverScaleMultiplier, hoverScaleMultiplier);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // 8. Visibility & Intersection Observers
    document.addEventListener("visibilitychange", () => {
      isTabActive = !document.hidden;
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        isVisibleOnScreen = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    // 9. Resize Handling
    function handleResize() {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener("resize", handleResize, { passive: true });

  } catch (err) {
    console.error("[ShopEasy 3D] Failed to initialize Three.js hero scene:", err);
    container.classList.add("static-fallback");
  }
})();
