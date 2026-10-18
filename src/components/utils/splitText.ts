import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextSplitter } from "../../utils/textSplitter";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: TextSplitter;
}

gsap.registerPlugin(ScrollTrigger);

export default function setSplitText() {
  try {
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.innerWidth < 900) return;
    const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
    const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

    const TriggerStart = "top 85%";
    const ToggleAction = "play none none none";

    paras.forEach((para: ParaElement) => {
      para.classList.add("visible");
      if (para.anim) {
        para.anim.progress(1).kill();
        para.split?.revert();
      }

      para.split = new TextSplitter(para, {
        type: "lines,words",
        linesClass: "split-line",
      });

      para.anim = gsap.fromTo(
        para.split.words,
        { autoAlpha: 0, y: 50 },
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: para.parentElement?.parentElement || para,
            toggleActions: ToggleAction,
            start: TriggerStart,
            once: true,
          },
          duration: 0.8,
          ease: "power3.out",
          y: 0,
          stagger: 0.015,
        }
      );
    });
    titles.forEach((title: ParaElement) => {
      if (title.anim) {
        title.anim.progress(1).kill();
        title.split?.revert();
      }
      title.split = new TextSplitter(title, {
        type: "chars,lines",
        linesClass: "split-line",
      });
      title.anim = gsap.fromTo(
        title.split.chars,
        { autoAlpha: 0, y: 50, rotate: 6 },
        {
          autoAlpha: 1,
          scrollTrigger: {
            trigger: title.parentElement?.parentElement || title,
            toggleActions: ToggleAction,
            start: TriggerStart,
            once: true,
          },
          duration: 0.7,
          ease: "power2.out",
          y: 0,
          rotate: 0,
          stagger: 0.02,
        }
      );
    });
  } catch (e) {
    console.error("setSplitText error:", e);
  }
}
