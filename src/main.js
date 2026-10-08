import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const sceneHost = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe8eff3);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 5, 21);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
sceneHost.appendChild(renderer.domElement);

const cameraControls = new OrbitControls(camera, renderer.domElement);
cameraControls.target.set(0, 0, 0);
cameraControls.enableDamping = true;
cameraControls.minDistance = 12;
cameraControls.maxDistance = 30;
cameraControls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x667681, 2.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
keyLight.position.set(-4, 7, 9);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x58b9db, 22, 16);
rimLight.position.set(2, 1, 3);
scene.add(rimLight);

const state = {
  voltage: 180,
  current: 2,
  fieldDirection: 1,
  showField: true
};

const constants = {
  electronMass: 9.1093837e-31,
  elementaryCharge: 1.602176634e-19,
  permeability: 4 * Math.PI * 1e-7,
  coilTurns: 130,
  coilRadius: 0.18,
  sceneScale: 20
};

const materials = {
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xb8e3e8,
    transparent: true,
    opacity: 0.13,
    roughness: 0.08,
    metalness: 0,
    transmission: 0.35,
    thickness: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  glassEdge: new THREE.MeshBasicMaterial({
    color: 0x80b9c2, transparent: true, opacity: 0.52
  }),
  copper: new THREE.MeshStandardMaterial({
    color: 0xb86c43, metalness: 0.72, roughness: 0.3
  }),
  metal: new THREE.MeshStandardMaterial({
    color: 0x84949d, metalness: 0.76, roughness: 0.26
  }),
  darkMetal: new THREE.MeshStandardMaterial({
    color: 0x344853, metalness: 0.58, roughness: 0.36
  }),
  electron: new THREE.MeshBasicMaterial({ color: 0x00d9ef, toneMapped: false }),
  beam: new THREE.MeshBasicMaterial({
    color: 0x00a9bf, transparent: true, opacity: 0.95, toneMapped: false
  }),
  field: new THREE.MeshBasicMaterial({
    color: 0x7d93d8, transparent: true, opacity: 0.55
  }),
  beamHalo: new THREE.MeshBasicMaterial({
    color: 0x00cfe8, transparent: true, opacity: 0.16,
    depthWrite: false, toneMapped: false
  }),
  beamMid: new THREE.MeshBasicMaterial({
    color: 0x16d7eb, transparent: true, opacity: 0.4,
    depthWrite: false, toneMapped: false
  }),
  red: new THREE.MeshStandardMaterial({ color: 0xd85753, roughness: 0.42 }),
  black: new THREE.MeshStandardMaterial({ color: 0x27323a, roughness: 0.48 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x3c79af, roughness: 0.44 }),
  case: new THREE.MeshStandardMaterial({ color: 0xe8ebeb, roughness: 0.52 }),
  panel: new THREE.MeshStandardMaterial({ color: 0xc9d0d0, roughness: 0.54 })
};

const apparatus = new THREE.Group();
scene.add(apparatus);

// A horizontal tube matches the electron-beam tube used in the bench setup.
const bulb = new THREE.Mesh(
  new THREE.CylinderGeometry(1.48, 1.48, 4.9, 48),
  materials.glass
);
bulb.rotation.z = Math.PI / 2;
apparatus.add(bulb);
for (const x of [-2.43, 2.43]) {
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.055, 8, 64),
    materials.glassEdge
  );
  rim.rotation.y = Math.PI / 2;
  rim.position.x = x;
  apparatus.add(rim);
}

const scaleGroup = new THREE.Group();
const scaleMaterial = new THREE.LineBasicMaterial({
  color: 0x8da5a8, transparent: true, opacity: 0.55
});
const axisMaterial = new THREE.LineBasicMaterial({
  color: 0x526f79, transparent: true, opacity: 0.95
});
const scaleDepth = -1.18;
const scaleHalfLength = 2.32;
const scaleHalfHeight = 1.28;
for (let i = -10; i <= 10; i++) {
  const x = i * 0.23;
  const vertical = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x, -scaleHalfHeight, scaleDepth),
    new THREE.Vector3(x, scaleHalfHeight, scaleDepth)
  ]);
  scaleGroup.add(new THREE.Line(vertical, x === 0 ? axisMaterial : scaleMaterial));
}
for (let i = -6; i <= 6; i++) {
  const y = i * 0.2;
  const horizontal = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-scaleHalfLength, y, scaleDepth),
    new THREE.Vector3(scaleHalfLength, y, scaleDepth)
  ]);
  scaleGroup.add(new THREE.Line(horizontal, y === 0 ? axisMaterial : scaleMaterial));
}
const xAxisArrow = new THREE.ArrowHelper(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, scaleDepth - 0.025),
  2.24,
  0x526f79,
  0.18,
  0.11
);
for (const material of [xAxisArrow.line.material, xAxisArrow.cone.material]) {
  material.depthTest = false;
}
const yAxisArrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, scaleDepth - 0.025),
  1.2,
  0x526f79,
  0.18,
  0.11
);
for (const material of [yAxisArrow.line.material, yAxisArrow.cone.material]) {
  material.depthTest = false;
}
scaleGroup.add(xAxisArrow, yAxisArrow);
const xAxisLabel = makeAxisLabel('x');
xAxisLabel.position.set(2.16, 0.18, scaleDepth - 0.05);
scaleGroup.add(xAxisLabel);
const yAxisLabel = makeAxisLabel('y');
yAxisLabel.position.set(0.16, 1.15, scaleDepth - 0.05);
scaleGroup.add(yAxisLabel);
apparatus.add(scaleGroup);

// A compact bench base, support column and clamp hold the tube and coil assembly.
const standBase = new THREE.Mesh(
  new THREE.BoxGeometry(11.8, 0.28, 3.8),
  new THREE.MeshStandardMaterial({ color: 0xd8dee0, metalness: 0.27, roughness: 0.38 })
);
standBase.position.set(0, -4.58, -0.2);
apparatus.add(standBase);
const baseTop = new THREE.Mesh(
  new THREE.BoxGeometry(11.45, 0.04, 3.5),
  new THREE.MeshStandardMaterial({ color: 0xf0f2f1, metalness: 0.15, roughness: 0.44 })
);
baseTop.position.set(0, -4.42, -0.2);
apparatus.add(baseTop);
const standFoot = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.5, 0.25, 24),
  materials.darkMetal
);
standFoot.position.set(0.25, -4.25, -1.48);
apparatus.add(standFoot);
const standPost = new THREE.Mesh(
  new THREE.CylinderGeometry(0.17, 0.2, 1.55, 20),
  materials.metal
);
standPost.position.set(0.25, -3.37, -1.48);
apparatus.add(standPost);
const standClamp = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 0.25, 0.5),
  materials.darkMetal
);
standClamp.position.set(0.25, -2.65, -1.48);
apparatus.add(standClamp);

// Helmholtz coils: two identical circular windings, separated along the field axis.
const coilGroup = new THREE.Group();
apparatus.add(coilGroup);
const coilRadius = 3.27;
for (const z of [-1.635, 1.635]) {
  for (let turn = 0; turn < 9; turn++) {
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(coilRadius + (turn - 4) * 0.045, 0.027, 8, 128),
      materials.copper
    );
    torus.position.z = z + (turn - 4) * 0.037;
    coilGroup.add(torus);
  }
}

// A simple electron gun gives the curved beam a visible point of origin.
const gun = new THREE.Group();
gun.position.set(-3.17, 0, 0);
gun.position.x += 0.3;
apparatus.add(gun);
const gunBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.33, 0.43, 1.18, 24),
  materials.darkMetal
);
gunBody.rotation.z = Math.PI / 2;
gun.add(gunBody);
const gunCollar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.45, 0.45, 0.16, 24),
  materials.metal
);
gunCollar.rotation.z = Math.PI / 2;
gunCollar.position.x = 0.46;
gun.add(gunCollar);
const cathode = new THREE.Mesh(
  new THREE.SphereGeometry(0.16, 18, 14),
  new THREE.MeshBasicMaterial({ color: 0x7ef7ff })
);
cathode.position.x = 0.62;
gun.add(cathode);
const gunLabel = makeLabel('ELEKTRONENKANONE', 1.55, 0.25);
gunLabel.position.set(-3.15, -0.72, 0.05);
apparatus.add(gunLabel);

const fieldGroup = new THREE.Group();
scene.add(fieldGroup);
const fieldMarkers = [];
for (const x of [-1.8, -0.6, 0.6, 1.8]) {
  for (const y of [-1.8, -0.6, 0.6, 1.8]) {
    const marker = new THREE.Group();
    marker.position.set(x, y, -0.15);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.018, 6, 24),
      materials.field
    );
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 10),
      materials.field
    );
    dot.position.z = 0.045;
    const crossA = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.024, 0.024),
      materials.field
    );
    const crossB = crossA.clone();
    crossA.rotation.z = Math.PI / 4;
    crossB.rotation.z = -Math.PI / 4;
    crossA.position.z = 0.045;
    crossB.position.z = 0.045;
    marker.add(ring, dot, crossA, crossB);
    fieldGroup.add(marker);
    fieldMarkers.push({ dot, crossA, crossB });
  }
}

const beamGroup = new THREE.Group();
scene.add(beamGroup);
let beamTubes = [];
let electronLabel;

function makeLabel(text, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(29, 47, 59, 0.83)';
  context.beginPath();
  context.roundRect(8, 8, 496, 80, 18);
  context.fill();
  context.fillStyle = '#f2fbff';
  context.font = 'bold 34px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 256, 48);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas),
    transparent: true,
    depthTest: false
  }));
  sprite.scale.set(width, height, 1);
  return sprite;
}

function makeAxisLabel(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#405d67';
  context.font = 'bold 92px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 64, 66);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas),
    transparent: true,
    depthTest: false
  }));
  sprite.scale.set(0.34, 0.34, 1);
  return sprite;
}

function makeDigitalDisplay(value, unit, tint = '#76e995') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 288;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  function draw(nextValue) {
    context.fillStyle = '#17221f';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#25312c';
    context.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fillStyle = tint;
    context.font = 'bold 170px Consolas, "Courier New", monospace';
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    context.fillText(nextValue, 772, 148);
    context.font = 'bold 78px Arial, sans-serif';
    context.textAlign = 'left';
    context.fillText(unit, 805, 160);
    texture.needsUpdate = true;
  }
  draw(value);
  return { texture, draw };
}

function makeFrontText(text, width = 512, height = 96) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#51616a';
  context.font = 'bold 32px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, width / 2, height / 2);
  return new THREE.CanvasTexture(canvas);
}

function createInstrument({ title, x, y, z, width, height, depth, value, unit }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  scene.add(group);
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    materials.case
  );
  group.add(housing);
  const front = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.14, height - 0.14, 0.075),
    materials.panel
  );
  front.position.z = depth / 2 + 0.035;
  group.add(front);

  const display = makeDigitalDisplay(value, unit);
  const displayBacking = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.82, height * 0.29, 0.07),
    new THREE.MeshStandardMaterial({ color: 0x18221f, roughness: 0.35 })
  );
  displayBacking.position.set(0, height * 0.2, depth / 2 + 0.105);
  group.add(displayBacking);
  const displaySurface = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.78, height * 0.25),
    new THREE.MeshBasicMaterial({
      map: display.texture,
      toneMapped: false
    })
  );
  displaySurface.position.set(0, height * 0.2, depth / 2 + 0.151);
  group.add(displaySurface);

  const titleTexture = makeFrontText(title);
  const titleMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.78, Math.min(0.24, height * 0.12)),
    new THREE.MeshBasicMaterial({ map: titleTexture, transparent: true })
  );
  titleMesh.position.set(0, height * 0.39, depth / 2 + 0.08);
  group.add(titleMesh);

  for (const knobX of [-width * 0.28, width * 0.28]) {
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.16, 0.13, 24),
      materials.darkMetal
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(knobX, -height * 0.12, depth / 2 + 0.12);
    group.add(knob);
    const knobFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.105, 24),
      materials.metal
    );
    knobFace.position.set(knobX, -height * 0.12, depth / 2 + 0.19);
    group.add(knobFace);
  }

  const ports = [];
  for (const [index, material] of [materials.red, materials.blue].entries()) {
    const portX = (index === 0 ? -1 : 1) * width * 0.3;
    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.11, 0.1, 20),
      materials.darkMetal
    );
    socket.rotation.x = Math.PI / 2;
    socket.position.set(portX, -height * 0.38, depth / 2 + 0.1);
    group.add(socket);
    const plug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.15, 16),
      material
    );
    plug.rotation.x = Math.PI / 2;
    plug.position.set(portX, -height * 0.38, depth / 2 + 0.2);
    group.add(plug);
    ports.push(new THREE.Vector3(
      x + portX,
      y - height * 0.38,
      z + depth / 2 + 0.26
    ));
  }

  for (const footX of [-width * 0.34, width * 0.34]) {
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.28, depth * 0.82),
      materials.darkMetal
    );
    foot.position.set(footX, -height / 2 - 0.11, 0);
    group.add(foot);
  }

  return { ports, display };
}

const acceleratingSupply = createInstrument({
  title: 'BESCHLEUNIGUNGSSPANNUNG',
  x: -6.15, y: -2.92, z: -0.25,
  width: 2.35, height: 2.55, depth: 1.35,
  value: '180', unit: 'V'
});
const coilSupply = createInstrument({
  title: 'SPULENSTROM',
  x: 6.15, y: -2.92, z: -0.25,
  width: 2.35, height: 2.55, depth: 1.35,
  value: '2.00', unit: 'A'
});
function addCable(points, material, radius = 0.045) {
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, radius, 8, false),
    material
  );
  cable.renderOrder = 2;
  scene.add(cable);
  return cable;
}

const coilTerminals = [
  new THREE.Vector3(-0.74, 3.35, 1.62),
  new THREE.Vector3(0.74, 3.35, -1.62)
];
coilTerminals.forEach((position, index) => {
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.36, 16),
    index === 0 ? materials.red : materials.blue
  );
  post.position.copy(position);
  scene.add(post);
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 12),
    index === 0 ? materials.red : materials.blue
  );
  cap.position.copy(position).add(new THREE.Vector3(0, 0.2, 0));
  scene.add(cap);
});

const gunTerminals = [
  new THREE.Vector3(-3.25, 0.34, -0.78),
  new THREE.Vector3(-3.25, -0.34, -0.78)
];
gunTerminals.forEach((position, index) => {
  const terminal = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 12),
    index === 0 ? materials.red : materials.blue
  );
  terminal.position.copy(position);
  scene.add(terminal);
});

// Color-coded leads make the two supply circuits legible in the apparatus view.
addCable([
  acceleratingSupply.ports[0],
  new THREE.Vector3(-6.45, -4.1, -0.5),
  new THREE.Vector3(-4.8, -4.55, -1.8),
  gunTerminals[0]
], materials.red);
addCable([
  acceleratingSupply.ports[1],
  new THREE.Vector3(-6.9, -4.2, -0.65),
  new THREE.Vector3(-4.6, -4.65, -1.9),
  gunTerminals[1]
], materials.blue);
addCable([
  coilSupply.ports[0],
  new THREE.Vector3(6.45, -4.12, -0.55),
  new THREE.Vector3(5.1, -4.55, -1.8),
  new THREE.Vector3(4.4, -2.2, -2.15),
  new THREE.Vector3(3.8, 1.7, -2.1),
  coilTerminals[0]
], materials.red);
addCable([
  coilTerminals[1],
  new THREE.Vector3(1.5, 2.6, -2.2),
  new THREE.Vector3(2.8, 1.1, -2.15),
  new THREE.Vector3(3.9, 0.5, -2.1),
  new THREE.Vector3(4.6, -2.0, -2.0),
  coilSupply.ports[1]
], materials.blue);

function disposeBeam() {
  for (const tube of beamTubes) {
    beamGroup.remove(tube);
    tube.geometry.dispose();
  }
  beamTubes = [];
  if (electronLabel) {
    beamGroup.remove(electronLabel);
    electronLabel.material.map.dispose();
    electronLabel.material.dispose();
    electronLabel = null;
  }
}

function getMeasurements() {
  const coilFieldPerAmp =
    constants.permeability * constants.coilTurns / constants.coilRadius *
    Math.pow(4 / 5, 1.5);
  const field = coilFieldPerAmp * state.current;
  const momentum = Math.sqrt(
    2 * constants.electronMass * constants.elementaryCharge * state.voltage
  );
  const radius = field === 0 ? Infinity : momentum / (constants.elementaryCharge * field);
  return { field, radius };
}

function createBeam(radius) {
  disposeBeam();

  const isFieldFree = state.current === 0;
  const points = [];
  const displayRadius = radius * constants.sceneScale;
  const bend = state.fieldDirection;
  const startX = -2.25;
  const innerEndX = 2.31;
  const innerRadius = 1.30;
  points.push(new THREE.Vector3(startX, 0, 0));

  if (isFieldFree) {
    points.push(new THREE.Vector3(innerEndX, 0, 0));
  } else {
    let reachedBoundary = false;
    const maxAngle = Math.PI * 2;
    const steps = 2400;
    for (let step = 1; step <= steps; step++) {
      const angle = maxAngle * step / steps;
      const point = new THREE.Vector3(
        startX + displayRadius * Math.sin(angle),
        bend * displayRadius * (1 - Math.cos(angle)),
        0
      );
      const inside = point.x <= innerEndX &&
        point.x >= -innerEndX &&
        Math.hypot(point.y, point.z) <= innerRadius;

      if (!inside) {
        const previousAngle = maxAngle * (step - 1) / steps;
        let low = previousAngle;
        let high = angle;
        for (let iteration = 0; iteration < 12; iteration++) {
          const middle = (low + high) / 2;
          const testX = startX + displayRadius * Math.sin(middle);
          const testY = bend * displayRadius * (1 - Math.cos(middle));
          if (testX <= innerEndX && testX >= -innerEndX &&
              Math.abs(testY) <= innerRadius) {
            low = middle;
          } else {
            high = middle;
          }
        }
        const boundaryAngle = (low + high) / 2;
        points.push(new THREE.Vector3(
          startX + displayRadius * Math.sin(boundaryAngle),
          bend * displayRadius * (1 - Math.cos(boundaryAngle)),
          0
        ));
        reachedBoundary = true;
        break;
      }
      points.push(point);
    }

    if (!reachedBoundary) {
      points.push(points[0].clone());
    }
  }

  const curve = new THREE.CatmullRomCurve3(points);
  beamTubes = [
    new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.14, 10, false), materials.beamHalo),
    new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.085, 10, false), materials.beamMid),
    new THREE.Mesh(new THREE.TubeGeometry(curve, 180, 0.043, 10, false), materials.beam)
  ];
  beamTubes.forEach(tube => beamGroup.add(tube));

  electronLabel = makeLabel(
    isFieldFree ? 'GERADLINIGER ELEKTRONENSTRAHL' : 'ABGELENKTER ELEKTRONENSTRAHL',
    2.1,
    0.25
  );
  const labelPoint = curve.getPointAt(isFieldFree ? 0.54 : 0.38);
  electronLabel.position.copy(labelPoint).add(
    new THREE.Vector3(0, isFieldFree ? 0.3 : 0.43 * bend, 0.15)
  );
  beamGroup.add(electronLabel);
}

function updateFieldDirection() {
  for (const marker of fieldMarkers) {
    marker.dot.visible = state.current > 0 && state.fieldDirection > 0;
    marker.crossA.visible = state.current > 0 && state.fieldDirection < 0;
    marker.crossB.visible = state.current > 0 && state.fieldDirection < 0;
  }
  fieldGroup.visible = state.showField && state.current > 0;
}

const voltageInput = document.querySelector('#voltage');
const currentInput = document.querySelector('#current');
const voltageValue = document.querySelector('#voltageValue');
const currentValue = document.querySelector('#currentValue');
const fieldValue = document.querySelector('#fieldValue');
const radiusValue = document.querySelector('#radiusValue');
const observation = document.querySelector('#observation');
const fieldToggle = document.querySelector('#fieldToggle');
const reverseFieldButton = document.querySelector('#reverseField');
const fieldDirectionLabel = document.querySelector('#fieldDirection');
const resetViewButton = document.querySelector('#resetView');

function formatGerman(number, digits = 1) {
  return number.toLocaleString('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

let previousVoltage = state.voltage;
let previousCurrent = state.current;
function update(changedParameter = '') {
  voltageValue.textContent = `${state.voltage} V`;
  currentValue.textContent = `${formatGerman(state.current)} A`;
  acceleratingSupply.display.draw(String(state.voltage));
  coilSupply.display.draw(state.current.toFixed(2));

  const { field, radius } = getMeasurements();
  fieldValue.textContent = `${formatGerman(field * 1000, 2)} mT`;
  radiusValue.textContent = Number.isFinite(radius)
    ? `${formatGerman(radius * 100, 1)} cm`
    : '∞ · gerade Bahn';
  createBeam(radius);
  updateFieldDirection();

  if (state.current === 0) {
    observation.textContent = changedParameter === 'direction'
      ? 'Ohne Spulenstrom gibt es kein Magnetfeld. Das Elektron fliegt geradeaus; die Feldrichtung hat keine Wirkung.'
      : 'Bei 0 A ist das Magnetfeld null. Ohne Lorentzkraft fliegen die Elektronen geradeaus.';
  } else if (changedParameter === 'voltage' && state.voltage > previousVoltage) {
    observation.textContent = 'Bei höherer Spannung bewegen sich die Elektronen schneller. Der Bahnradius wird größer.';
  } else if (changedParameter === 'voltage') {
    observation.textContent = 'Bei niedrigerer Spannung bewegen sich die Elektronen langsamer. Der Bahnradius wird kleiner.';
  } else if (changedParameter === 'current' && state.current > previousCurrent) {
    observation.textContent = 'Mehr Spulenstrom erzeugt ein stärkeres Magnetfeld. Die Bahn wird enger gekrümmt.';
  } else if (changedParameter === 'current') {
    observation.textContent = 'Weniger Spulenstrom schwächt das Magnetfeld. Der Bahnradius wird größer.';
  } else if (changedParameter === 'direction') {
    observation.textContent = 'Kehrst du das Magnetfeld um, ändert sich die Ablenkungsrichtung. Der Bahnradius bleibt gleich.';
  } else {
    observation.textContent = 'Vergleiche: Höhere Spannung vergrößert den Radius, stärkerer Spulenstrom verkleinert ihn.';
  }
  fieldDirectionLabel.textContent = state.fieldDirection > 0
    ? 'Aus der Ebene' : 'In die Ebene';
  reverseFieldButton.setAttribute('aria-pressed', String(state.fieldDirection < 0));
  previousVoltage = state.voltage;
  previousCurrent = state.current;
}

voltageInput.addEventListener('input', event => {
  state.voltage = Number(event.target.value);
  update('voltage');
});
currentInput.addEventListener('input', event => {
  state.current = Number(event.target.value);
  update('current');
});
reverseFieldButton.addEventListener('click', () => {
  state.fieldDirection *= -1;
  update('direction');
});
fieldToggle.addEventListener('change', event => {
  state.showField = event.target.checked;
  fieldGroup.visible = state.showField && state.current > 0;
});
resetViewButton.addEventListener('click', () => {
  camera.position.set(0, 5, 21);
  cameraControls.target.set(0, 0, 0);
  cameraControls.update();
});

function resize() {
  const bounds = sceneHost.getBoundingClientRect();
  renderer.setSize(bounds.width, bounds.height, false);
  camera.aspect = bounds.width / bounds.height;
  camera.updateProjectionMatrix();
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(sceneHost);
window.addEventListener('resize', resize);
resize();
update();

function animate() {
  requestAnimationFrame(animate);
  cameraControls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
