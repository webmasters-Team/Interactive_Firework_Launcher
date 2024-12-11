const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fullscreenBtn = document.getElementById("fullscreenBtn");

// Fullscreen handling
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "⤡";
  } else {
    document.exitFullscreen();
    fullscreenBtn.textContent = "⤢";
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    fullscreenBtn.textContent = "⤢";
  } else {
    fullscreenBtn.textContent = "⤡";
  }
});

// Enable motion blur
ctx.globalCompositeOperation = "lighter";

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

class Smoke {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 10 + 5; // Reduced from 20+10 to 10+5
    this.speed = {
      x: (Math.random() - 0.5) * 1, // Reduced from 2 to 1
      y: -Math.random() * 1 // Reduced from 2 to 1
    };
    this.alpha = 0.25; // Reduced from 0.5 to 0.25
    this.decay = Math.random() * 0.01 + 0.005;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100, 100, 100, 0.25)"; // Reduced from 0.5 to 0.25
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;
    this.alpha -= this.decay;
    this.size += 0.2;
  }
}

class Raindrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.speed = Math.random() * 10;
    this.length = Math.random() * 10 + 10;
  }

  draw() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.length);
    ctx.strokeStyle = "rgba(174, 194, 224, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.reset();
    }
  }
}

class Particle {
  constructor(x, y, color, velocity, type) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity;
    this.type = type;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.015;
    this.hasSmokeEmitted = false;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.velocity.y += 0.05;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;

    // Emit smoke when particle starts to fade
    if (!this.hasSmokeEmitted && this.alpha < 0.8) {
      smoke.push(new Smoke(this.x, this.y));
      this.hasSmokeEmitted = true;
    }
  }
}

let particles = [];
let smoke = [];
const raindrops = Array(200)
  .fill()
  .map(() => new Raindrop());

function createParticles(x, y, type) {
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    let velocity;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / particleCount;

    switch (type) {
      case 1: // Burst
        velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        };
        break;
      case 2: // Spider
        velocity = {
          x: Math.cos(angle) * 5,
          y: Math.sin(angle) * 5
        };
        break;
      case 3: // Circle
        velocity = {
          x: Math.cos(angle) * 3,
          y: Math.sin(angle) * 3
        };
        break;
      case 4: // Heart
        const t = (Math.PI * 2 * i) / particleCount;
        const scale = 16;
        velocity = {
          x: scale * Math.pow(Math.sin(t), 3),
          y:
            (scale *
              (13 * Math.cos(t) -
                5 * Math.cos(2 * t) -
                2 * Math.cos(3 * t) -
                Math.cos(4 * t))) /
            16
        };
        break;
      case 5: // Spiral
        const radius = (i / particleCount) * 5;
        velocity = {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
        break;
      case 6: // Double Ring
        const ringRadius = i % 2 === 0 ? 3 : 6;
        velocity = {
          x: Math.cos(angle) * ringRadius,
          y: Math.sin(angle) * ringRadius
        };
        break;
      case 7: // Cross
        velocity = {
          x: i % 2 === 0 ? Math.cos(angle) * 5 : Math.sin(angle) * 5,
          y: i % 2 === 0 ? Math.sin(angle) * 5 : Math.cos(angle) * 5
        };
        break;
      case 8: // Star
        const starAngle = angle + Math.PI / 2;
        const starRadius = i % 2 === 0 ? 6 : 3;
        velocity = {
          x: Math.cos(starAngle) * starRadius,
          y: Math.sin(starAngle) * starRadius
        };
        break;
      case 9: // Wave
        velocity = {
          x: Math.cos(angle) * 4,
          y: Math.sin(i * 0.1) * 4
        };
        break;
      case 10: // Explosion
        const explosionSpeed = Math.random() * 10 + 5;
        velocity = {
          x: Math.cos(angle) * explosionSpeed,
          y: Math.sin(angle) * explosionSpeed
        };
        break;
    }

    particles.push(new Particle(x, y, color, velocity, type));
  }
}

function launchFirework(type) {
  const x = Math.random() * canvas.width;
  const y = canvas.height;
  const targetY = canvas.height * 0.3;
  const launchParticle = new Particle(x, y, "#ffffff", { x: 0, y: -10 }, 0);

  const animate = () => {
    if (launchParticle.y > targetY) {
      launchParticle.update();
      launchParticle.draw();
      requestAnimationFrame(animate);
    } else {
      createParticles(launchParticle.x, launchParticle.y, type);
    }
  };

  animate();
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 20, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  raindrops.forEach((raindrop) => {
    raindrop.update();
    raindrop.draw();
  });

  particles = particles.filter((particle) => particle.alpha > 0);
  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  smoke = smoke.filter((smoke) => smoke.alpha > 0);
  smoke.forEach((smoke) => {
    smoke.update();
    smoke.draw();
  });

  requestAnimationFrame(animate);
}

animate();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  createParticles(x, y, Math.floor(Math.random() * 10) + 1);
});
