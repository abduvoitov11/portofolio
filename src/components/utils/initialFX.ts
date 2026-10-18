import { TextSplitter } from "../../utils/textSplitter";
import gsap from "gsap";
import { lenis } from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  if (lenis) {
    lenis.start();
  }
  const mainEl = document.getElementsByTagName("main")[0];
  if (mainEl) {
    mainEl.classList.add("main-active");
    mainEl.style.opacity = "1";
  }

  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
  });

  const selectors = [".landing-info h3", ".landing-intro h2", ".landing-intro h1", ".landing-h2-1"];
  const elements = selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)));
  
  try {
    const landingText = new TextSplitter(elements, {
      type: "words,chars",
      linesClass: "split-line",
    });
    
    if (landingText.chars.length > 0) {
      gsap.fromTo(
        landingText.chars,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          y: 0,
          stagger: 0.02,
          delay: 0.2,
        }
      );
    }
  } catch (e) {
    console.error("TextSplitter error:", e);
  }

  gsap.to(".landing-container", { opacity: 1, y: 0, duration: 0.5 });
  gsap.to([".header", ".icons-section", ".nav-fade", ".landing-info-h2"], {
    opacity: 1,
    duration: 0.8,
    ease: "power1.inOut",
    delay: 0.1,
  });
}

