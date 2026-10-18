import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import { initialFX } from "./utils/initialFX";

import Marquee from "react-fast-marquee";

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleEnter = () => {
    setClicked(true);
    setLoaded(true);
    setIsLoaded(true);
    setTimeout(() => {
      try {
        initialFX();
      } catch (err) {
        console.warn("initialFX error:", err);
      }
      setIsLoading(false);
    }, 400);
  };

  // Safety fallback: Never keep user stuck for more than 2.5 seconds
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      handleEnter();
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (percent >= 100) {
      const t1 = setTimeout(() => {
        setLoaded(true);
        const t2 = setTimeout(() => {
          setIsLoaded(true);
        }, 500);
        return () => clearTimeout(t2);
      }, 200);
      return () => clearTimeout(t1);
    }
  }, [percent]);

  useEffect(() => {
    if (isLoaded) {
      setClicked(true);
      const timer = setTimeout(() => {
        try {
          initialFX();
        } catch (err) {
          console.warn("initialFX error:", err);
        }
        setIsLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          Torabek Abduvoitov
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span>&nbsp; AI Developer &nbsp;</span> <span>&nbsp; AI Developer &nbsp;</span>
            <span>&nbsp; AI Developer &nbsp;</span> <span>&nbsp; AI Developer &nbsp;</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
          onClick={handleEnter}
          style={{ cursor: "pointer" }}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Yuklanmoqda <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Xush kelibsiz</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  let interval = setInterval(() => {
    if (percent <= 50) {
      let rand = Math.round(Math.random() * 5);
      percent = percent + rand;
      setLoading(percent);
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        percent = percent + Math.round(Math.random() * 5);
        setLoading(percent);
        if (percent > 91) {
          clearInterval(interval);
        }
      }, 50);
    }
  }, 20);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          resolve(percent);
          clearInterval(interval);
        }
      }, 2);
    });
  }
  return { loaded, percent, clear };
};
