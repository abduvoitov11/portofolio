import gsap from "gsap";
import { lenis } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";
  if (lenis) {
    lenis.start();
  }
  const mainEl = document.getElementsByTagName("main")[0];
  if (mainEl) {
    mainEl.classList.add("main-active");
    mainEl.style.opacity = "1";
    mainEl.style.visibility = "visible";
  }

  const landingContainer = document.querySelector(".landing-container") as HTMLElement;
  if (landingContainer) {
    landingContainer.style.opacity = "1";
    landingContainer.style.visibility = "visible";
  }

  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
  });

  try {
    gsap.from([".landing-intro", ".landing-info"], {
      opacity: 0.3,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });
  } catch (e) {
    console.warn("GSAP landing animation skipped:", e);
  }

  gsap.to([".header", ".icons-section", ".nav-fade", ".landing-info-h2"], {
    opacity: 1,
    duration: 0.5,
    ease: "power1.inOut",
  });
}

