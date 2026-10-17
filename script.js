
"use strict";

/* =========================================
   MYWEBSITE — INTERACTIVE JAVASCRIPT
   ========================================= */

const $ = (selector) => document.querySelector(selector);

/* 1. Footer yilini avtomatik yangilash */

const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* 2. Dark / Light theme */

const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");
const themeColorMeta = $('meta[name="theme-color"]');

function setTheme(theme) {
  const isLight = theme === "light";

  document.body.classList.toggle("light-theme", isLight);

  if (themeIcon) {
    themeIcon.textContent = isLight ? "☾" : "☀";
  }

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isLight
        ? "Qorong‘i rejimga o‘tish"
        : "Yorug‘ rejimga o‘tish"
    );
  }

  if (themeColorMeta) {
    themeColorMeta.content = isLight ? "#f5f7ff" : "#080b14";
  }
}

let savedTheme = null;

try {
  savedTheme = localStorage.getItem("mywebsite-theme");
} catch (error) {
  // Brauzer saqlashni cheklasa ham sayt ishlashda davom etadi.
}

const initialTheme =
  savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";

setTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme")
      ? "dark"
      : "light";

    setTheme(nextTheme);

    try {
      localStorage.setItem("mywebsite-theme", nextTheme);
    } catch (error) {
      // Saqlash ishlamasa, rejim joriy sahifada baribir almashadi.
    }
  });
}

/* 3. Scroll reveal animatsiyasi */

const revealElements = document.querySelectorAll(".reveal");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

/* 4. Animated particle background */

const canvas = $("#particles");
const ctx = canvas ? canvas.getContext("2d") : null;

let particles = [];
let animationFrame = null;
let canvasWidth = 0;
let canvasHeight = 0;
let resizeTimer = null;

const mouse = {
  x: -1000,
  y: -1000,
  active: false
};

const particleMotionAllowed = !reducedMotion;

function createParticles() {
  if (!canvas || !ctx) return;

  const area = canvasWidth * canvasHeight;

  // Zarrachalar soni ekran hajmiga qarab o'zgaradi.
  const count = Math.min(
    100,
    Math.max(24, Math.floor(area / 14000))
  );

  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: Math.random() * 1.8 + 0.7
  }));
}

function resizeCanvas() {
  if (!canvas || !ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  canvas.width = Math.floor(canvasWidth * dpr);
  canvas.height = Math.floor(canvasHeight * dpr);

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createParticles();

  if (!particleMotionAllowed) {
    drawParticles(false);
  }
}

function drawParticles(animate) {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const lightMode = document.body.classList.contains("light-theme");
  const dotColor = lightMode ? "80, 80, 180" : "155, 140, 255";
  const lineColor = lightMode ? "90, 100, 180" : "120, 150, 255";

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (animate) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvasWidth) p.vx *= -1;
      if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

      // Kursor yaqinidagi zarrachalar yengil suriladi.
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < 95) {
          const force = (95 - distance) / 95;
          p.x += (dx / distance) * force * 0.7;
          p.y += (dy / distance) * force * 0.7;
        }
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${dotColor}, 0.7)`;
    ctx.fill();

    // Faqat yaqin zarrachalarni chiziqlar bilan bog'laymiz.
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 105) {
        const opacity = (1 - distance / 105) * 0.2;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  drawParticles(true);
  animationFrame = requestAnimationFrame(animateParticles);
}

function startParticleAnimation() {
  if (!particleMotionAllowed || !canvas || !ctx) return;
  if (document.hidden) return;
  if (animationFrame !== null) return;

  animationFrame = requestAnimationFrame(animateParticles);
}

function stopParticleAnimation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

if (canvas && ctx) {
  resizeCanvas();

  if (particleMotionAllowed) {
    startParticleAnimation();
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      resizeCanvas();
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopParticleAnimation();
    } else {
      startParticleAnimation();
    }
  });

  window.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener("blur", () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    }
  });
}

/* 5. Maxsus cursor glow */

const cursorGlow = $(".cursor-glow");

const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;

if (cursorGlow && finePointer && !reducedMotion) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = event.clientX + "px";
    cursorGlow.style.top = event.clientY + "px";
  }, { passive: true });
}

/* 6. Tugmalar uchun yengil magnetic effekt */

const magneticButtons = document.querySelectorAll(".magnetic");

if (finePointer && !reducedMotion) {
  magneticButtons.forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform =
        `translate(${x * 0.06}px, ${y * 0.10}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

console.log("MyWebsite muvaffaqiyatli ishga tushdi!");
