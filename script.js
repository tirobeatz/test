/* =================================================================
   Café Lumière — script.js
   1) Mobile-Navigation (Toggle)
   2) Header-Schatten beim Scrollen
   3) Lenis (smooth scroll) + GSAP-Ticker-Sync
   4) ScrollTrigger Reveal-Animationen
   Alles respektiert prefers-reduced-motion.
   ================================================================= */

// Prüfen, ob der Nutzer reduzierte Bewegung wünscht
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- 1) Mobile-Navigation ---------- */
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

function closeNav() {
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Menü öffnen");
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
});

// Beim Klick auf einen Menüpunkt das mobile Menü wieder schließen
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));


/* ---------- 2) Header-Schatten beim Scrollen ---------- */
const header = document.getElementById("header");

function updateHeader(scrollY) {
  header.classList.toggle("scrolled", scrollY > 20);
}
updateHeader(window.scrollY);


/* ---------- 3) Lenis (smooth scroll) + GSAP-Sync ---------- */
let lenis = null;

if (!reduceMotion) {
  lenis = new Lenis({
    duration: 1.1,          // Trägheit des Scrollens
    smoothWheel: true,
  });

  // Lenis bei jedem GSAP-Tick aktualisieren (sauberer Sync, ein RAF-Loop)
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Header-Status & ScrollTrigger an Lenis koppeln
  lenis.on("scroll", ({ scroll }) => updateHeader(scroll));
} else {
  // Ohne Lenis: Header per nativem Scroll-Event aktualisieren
  window.addEventListener("scroll", () => updateHeader(window.scrollY), { passive: true });
}

// Sanftes Scrollen für Anker-Links (#menu, #about ...)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -70 });   // Offset für fixierten Header
    } else {
      target.scrollIntoView();
    }
  });
});


/* ---------- 4) ScrollTrigger Reveal-Animationen ---------- */
if (!reduceMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger über Lenis informieren, wenn gescrollt wird
  if (lenis) lenis.on("scroll", ScrollTrigger.update);

  // Markiert das <body>, damit das CSS den verborgenen Startzustand kennt
  document.body.classList.add("js-reveal");

  // a) Hero-Inhalte gestaffelt beim Laden einblenden
  gsap.to(".hero [data-reveal]", {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    delay: 0.15,
  });

  // b) Alle übrigen [data-reveal] beim Scrollen einblenden
  gsap.utils.toArray("[data-reveal]:not(.hero [data-reveal])").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",     // startet, wenn das Element zu 15 % im Viewport ist
        toggleActions: "play none none none",
      },
    });
  });
}
