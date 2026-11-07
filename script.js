const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const backToTop = document.getElementById("backToTop");
const toast = document.getElementById("toast");

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
navLinks.forEach((link) => link.addEventListener("click", () => {
  navMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

// Footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Reveal elements as they enter the screen
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("in-view"));
}

// Highlight the navigation link for the section being viewed
const sections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));
}

// Reading progress and back-to-top button
const progress = document.getElementById("readingProgress");
function handleScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${percentage}%`;
  backToTop.classList.toggle("visible", window.scrollY > 450);
}
window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Filter project cards
const projectButtons = document.querySelectorAll(".project-filters [data-filter]");
const projectCards = document.querySelectorAll(".project-card[data-category]");
projectButtons.forEach((button) => button.addEventListener("click", () => {
  projectButtons.forEach((item) => item.classList.toggle("active", item === button));
  const filter = button.dataset.filter;
  projectCards.forEach((card) => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter));
}));

// Certificate category tabs and search.
const certificateSearch = document.getElementById("certificateSearch");
const certificateCards = [...document.querySelectorAll(".ibm-certificate-card[data-search]")];
const certificateCount = document.getElementById("certificateCount");
const certificateFilterButtons = [...document.querySelectorAll("[data-certificate-filter]")];
let activeCertificateFilter = "ibm";
function filterCertificates() {
  const term = certificateSearch ? certificateSearch.value.trim().toLowerCase() : "";
  let visible = 0;
  certificateCards.forEach((card) => {
    const providerMatches = activeCertificateFilter === "all" || card.dataset.provider === "ibm";
    const textMatches = card.dataset.search.includes(term) || card.textContent.toLowerCase().includes(term);
    const show = providerMatches && textMatches;
    card.classList.toggle("is-hidden", !show);
    if (show) visible++;
  });
  if (certificateCount) certificateCount.textContent = `${visible} ${activeCertificateFilter === "ibm" ? "IBM " : ""}certificates`;
}
certificateFilterButtons.forEach((button) => button.addEventListener("click", () => {
  activeCertificateFilter = button.dataset.certificateFilter;
  certificateFilterButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  if (certificateSearch) certificateSearch.placeholder = activeCertificateFilter === "ibm" ? "Find an IBM certificate..." : "Find a certificate...";
  filterCertificates();
}));
if (certificateSearch) certificateSearch.addEventListener("input", filterCertificates);
filterCertificates();

// Copy email address with a small confirmation toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}
const copyEmailButton = document.getElementById("copyEmail");
if (copyEmailButton) {
  copyEmailButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText("aishwarya56321@gmail.com");
      showToast("Email address copied!");
    } catch {
      showToast("Email: aishwarya56321@gmail.com");
    }
  });
}


// Project detail popups: each card uses its existing portfolio content.
const projectModal = document.getElementById("projectModal");
const modalPanel = projectModal.querySelector(".modal-panel");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
let lastFocusedElement = null;
function closeProjectModal() {
  projectModal.classList.remove("open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}
document.querySelectorAll(".project-card").forEach((card) => {
  const title = card.querySelector("h3")?.textContent.trim() || "Project";
  const subtitle = card.querySelector(".project-subtitle")?.textContent.trim() || "";
  const paragraphs = [...card.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean);
  const tags = [...card.querySelectorAll(".tag-row span")].map((tag) => tag.textContent.trim());
  const button = document.createElement("button");
  button.type = "button";
  button.className = "project-details-btn";
  button.textContent = "Explore project ↗";
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    modalTitle.textContent = title;
    modalContent.replaceChildren();
    if (subtitle) { const sub = document.createElement("p"); sub.className = "modal-subtitle"; sub.textContent = subtitle; modalContent.append(sub); }
    paragraphs.forEach((copy) => { const para = document.createElement("p"); para.textContent = copy; modalContent.append(para); });
    if (tags.length) { const row = document.createElement("div"); row.className = "tag-row"; tags.forEach((tag) => { const chip = document.createElement("span"); chip.textContent = tag; row.append(chip); }); modalContent.append(row); }
    projectModal.classList.add("open");
    projectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalPanel.focus();
  });
  card.append(button);
});
projectModal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", closeProjectModal));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectModal.classList.contains("open")) closeProjectModal();
});

// Gentle pointer tilt on project cards (desktop pointer only; no effect on touch screens).
const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (canTilt) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (projectModal.classList.contains("open")) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}


// Soft cursor aura on desktop; hidden automatically on touch and reduced-motion devices.
const cursorAura = document.getElementById("cursorAura");
if (cursorAura && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let cursorFrame = 0;
  document.addEventListener("pointermove", (event) => {
    if (cursorFrame) cancelAnimationFrame(cursorFrame);
    cursorFrame = requestAnimationFrame(() => {
      cursorAura.style.left = `${event.clientX}px`;
      cursorAura.style.top = `${event.clientY}px`;
      cursorFrame = 0;
    });
  }, { passive: true });
}


// Full-size preview for photos in the Learning, teamwork & achievements gallery.
(() => {
  const galleryImages = Array.from(document.querySelectorAll(".gallery-card > img"));
  const lightbox = document.getElementById("galleryLightbox");
  const previewImage = document.getElementById("galleryLightboxImage");
  const caption = document.getElementById("galleryLightboxCaption");
  if (!galleryImages.length || !lightbox || !previewImage || !caption) return;
  const closeButton = lightbox.querySelector(".gallery-lightbox-close");
  const previousButton = lightbox.querySelector(".gallery-lightbox-prev");
  const nextButton = lightbox.querySelector(".gallery-lightbox-next");
  let activeIndex = 0;
  function showImage(index) {
    activeIndex = (index + galleryImages.length) % galleryImages.length;
    const source = galleryImages[activeIndex];
    previewImage.src = source.currentSrc || source.src;
    previewImage.alt = source.alt || "Gallery photo";
    caption.textContent = source.closest(".gallery-card")?.querySelector("h3")?.textContent || source.alt || "";
  }
  function openImage(index) {
    showImage(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-preview-open");
    closeButton.focus();
  }
  function closeImage() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gallery-preview-open");
    previewImage.removeAttribute("src");
  }
  galleryImages.forEach((img, index) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `View photo: ${img.alt}`);
    img.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); openImage(index); });
    img.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openImage(index); } });
  });
  closeButton.addEventListener("click", closeImage);
  previousButton.addEventListener("click", () => showImage(activeIndex - 1));
  nextButton.addEventListener("click", () => showImage(activeIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeImage(); });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeImage();
    if (event.key === "ArrowLeft") showImage(activeIndex - 1);
    if (event.key === "ArrowRight") showImage(activeIndex + 1);
  });
})();


// Open project preview images at their full natural size.
document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('projectImageLightbox');
  if (!viewer) return;
  const viewerImage = viewer.querySelector('img');
  const closeButton = viewer.querySelector('.project-image-lightbox-close');
  const closeViewer = () => { viewer.classList.remove('is-open'); viewer.setAttribute('aria-hidden', 'true'); viewerImage.src = ''; document.body.style.overflow = ''; };
  document.querySelectorAll('.project-image-art img').forEach((img) => {
    img.addEventListener('click', () => { viewerImage.src = img.src; viewerImage.alt = img.alt; viewer.classList.add('is-open'); viewer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; });
  });
  closeButton.addEventListener('click', closeViewer);
  viewer.addEventListener('click', (event) => { if (event.target === viewer || event.target === viewerImage) closeViewer(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && viewer.classList.contains('is-open')) closeViewer(); });
});
