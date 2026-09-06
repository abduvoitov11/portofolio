import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import './Play.css';

const Play = () => {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const dinoRef = useRef<HTMLDivElement>(null);
  const obstacleRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number>();
  
  // Game physics state
  const state = useRef({
    dinoY: 0,
    dinoVY: 0,
    obstacleX: 1000,
    obstacleType: 1, // 1: normal, 2: tall, 3: flying high
    speed: 7,
    score: 0,
    gravity: 0.8,
    jumpStrength: 15,
    isJumping: false,
    isDucking: false
  });

  const jump = useCallback(() => {
    if (!isPlaying || gameOver) {
      if (!isPlaying) startGame();
      return;
    }
    if (!state.current.isJumping) {
      state.current.dinoVY = state.current.jumpStrength;
      state.current.isJumping = true;
    }
  }, [isPlaying, gameOver]);

  const startGame = () => {
    const containerWidth = gameRef.current ? gameRef.current.clientWidth : 800;
    state.current = {
      dinoY: 0,
      dinoVY: 0,
      obstacleX: containerWidth,
      obstacleType: 1,
      speed: 7,
      score: 0,
      gravity: 0.9,
      jumpStrength: 16,
      isJumping: false,
      isDucking: false
    };
    setGameOver(false);
    setIsPlaying(true);
    setScore(0);
  };

  const update = useCallback(() => {
    if (!isPlaying || gameOver) return;
    
    // Physics
    if (state.current.isDucking && state.current.isJumping) {
      state.current.dinoVY -= state.current.gravity * 2; // Fast fall
    } else {
      state.current.dinoVY -= state.current.gravity;
    }
    
    state.current.dinoY += state.current.dinoVY;
    
    if (state.current.dinoY <= 0) {
      state.current.dinoY = 0;
      state.current.isJumping = false;
      state.current.dinoVY = 0;
    }

    const containerWidth = gameRef.current ? gameRef.current.clientWidth : 800;

    // Obstacle
    state.current.obstacleX -= state.current.speed;
    if (state.current.obstacleX < -150) {
      state.current.obstacleX = containerWidth;
      state.current.speed += 0.15;
      
      // Generate 1 million+ variations procedurally
      const isFlying = Math.random() > 0.6;
      const w = Math.floor(Math.random() * 40) + 20; // width: 20px to 60px
      const h = Math.floor(Math.random() * 60) + 30; // height: 30px to 90px
      const bottomOffset = isFlying ? Math.floor(Math.random() * 70) + 40 : 2; 
      
      // Random neon colors
      const colors = ['#ff0055', '#00ffcc', '#bd00ff', '#ff9900', '#ffff00', '#00ff00', '#0066ff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const borderRadius = Math.random() > 0.5 ? '5px' : (Math.random() > 0.5 ? '50%' : '20px 20px 0 0');
      
      if (obstacleRef.current) {
        obstacleRef.current.style.width = `${w}px`;
        obstacleRef.current.style.height = `${h}px`;
        obstacleRef.current.style.bottom = `calc(20% + ${bottomOffset}px)`;
        
        // Generate physical shape
        obstacleRef.current.innerHTML = `<div style="width:100%; height:100%; background:${color}; box-shadow: 0 0 20px ${color}; border-radius: ${borderRadius};"></div>`;
      }
    }
    
    if (obstacleRef.current) {
      obstacleRef.current.style.transform = `translateX(${state.current.obstacleX}px)`;
    }

    // Score
    state.current.score += 0.1;
    
    // Render Dino
    if (dinoRef.current) {
      let rotation = 0;
      let translateY = -state.current.dinoY;
      
      if (state.current.isJumping) {
        rotation = state.current.dinoVY < 0 ? 15 : -15;
      }
      
      dinoRef.current.style.transform = `translateY(${translateY}px) rotate(${rotation}deg)`;
      
      if (state.current.isDucking && !state.current.isJumping) {
        dinoRef.current.classList.add('dino-is-ducking');
      } else {
        dinoRef.current.classList.remove('dino-is-ducking');
      }
      
      const svgEls = dinoRef.current.querySelectorAll('svg');
      svgEls.forEach(svgEl => {
        if (!state.current.isJumping && isPlaying) {
          svgEl.classList.add('dino-run');
        } else {
          svgEl.classList.remove('dino-run');
        }
      });
    }
    
    // Dynamic Collision detection
    if (dinoRef.current && obstacleRef.current) {
      const dinoRect = dinoRef.current.getBoundingClientRect();
      const obsRect = obstacleRef.current.getBoundingClientRect();
      
      if (
        dinoRect.right - 10 > obsRect.left &&
        dinoRect.left + 10 < obsRect.right &&
        dinoRect.bottom > obsRect.top + 10 &&
        dinoRect.top < obsRect.bottom - 10
      ) {
        setIsPlaying(false);
        setGameOver(true);
        setScore(Math.floor(state.current.score));
        return;
      }
    }
    
    if (Math.floor(state.current.score) % 3 === 0) {
      setScore(Math.floor(state.current.score));
    }
    
    reqRef.current = requestAnimationFrame(update);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      reqRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(reqRef.current!);
  }, [isPlaying, gameOver, update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        state.current.isDucking = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        state.current.isDucking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump]);

  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    
    if (dy < -30) {
      // Swipe Up -> Jump
      jump();
    } else if (dy > 30) {
      // Swipe Down -> Duck
      state.current.isDucking = true;
      setTimeout(() => {
        state.current.isDucking = false;
      }, 800); // Duck for 800ms
    } else {
      // Just a tap -> Jump
      jump();
    }
    setTouchStart(null);
  };

  return (
    <div className="play-page" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'none' }}>
      <Link to="/" className="back-link" data-cursor="disable">
        <MdArrowBack /> Bosh sahifaga qaytish
      </Link>
      
      <div className="game-wrapper dino-wrapper">
        <div className="game-header">
          <h1>Cyber Dino</h1>
          <div className="score-container">
            <div className="score-box dino-score">
              <span>Natija</span>
              <strong>{Math.floor(score)}</strong>
            </div>
          </div>
        </div>

        <div className="dino-game-container" ref={gameRef}>
          {!isPlaying && !gameOver && (
            <div className="start-overlay glass-panel">
              <p>O'ynash uchun ekranga yoki <strong>Space</strong> tugmasiga bosing</p>
            </div>
          )}
          {gameOver && (
            <div className="game-over-overlay dino-over glass-panel">
              <h2>O'yin tugadi!</h2>
              <button onClick={(e) => { e.stopPropagation(); startGame(); }}>Qaytadan boshlash</button>
            </div>
          )}
          
          <div className="scrolling-bg"></div>
          
          <div className="ground">
            <div className="ground-line"></div>
          </div>
          
          <div className="dino" ref={dinoRef}>
            <svg className="dino-stand" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="dino-body-part" d="M22 0H44V2H42V4H44V16H42V18H36V20H24V22H22V24H20V26H18V28H16V30H14V32H12V34H10V36H8V34H6V32H4V30H2V28H0V26H2V24H4V22H6V24H8V26H10V28H12V26H14V24H16V22H18V20H20V18H22V16H24V14H22V0Z" fill="var(--dino-color)"/>
              <path className="leg-back" d="M12 36H16V42H18V48H12V46H10V42H12V36Z" fill="var(--dino-color)"/>
              <path className="leg-front" d="M22 36H26V42H28V48H22V46H20V42H22V36Z" fill="var(--dino-color)"/>
              <rect x="28" y="4" width="4" height="4" fill="var(--dino-bg)"/>
            </svg>
            <svg className="dino-duck-svg" viewBox="0 0 59 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="8" width="2" height="4" fill="var(--dino-color)"/>
              <rect x="2" y="6" width="2" height="6" fill="var(--dino-color)"/>
              <rect x="4" y="4" width="4" height="10" fill="var(--dino-color)"/>
              <rect x="8" y="2" width="4" height="14" fill="var(--dino-color)"/>
              <rect x="12" y="0" width="20" height="20" fill="var(--dino-color)"/>
              <rect x="32" y="2" width="6" height="18" fill="var(--dino-color)"/>
              <rect x="38" y="6" width="6" height="10" fill="var(--dino-color)"/>
              <rect x="44" y="8" width="15" height="8" fill="var(--dino-color)"/>
              <rect x="44" y="16" width="10" height="4" fill="var(--dino-color)"/>
              <rect x="50" y="10" width="2" height="2" fill="var(--dino-bg)"/>
              <rect className="leg-back" x="16" y="20" width="4" height="10" fill="var(--dino-color)"/>
              <rect className="leg-front" x="24" y="20" width="4" height="10" fill="var(--dino-color)"/>
            </svg>
          </div>
          
          <div className="obstacle" ref={obstacleRef}>
             <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0H20V10H24V20H30V30H24V40H20V50H10V40H6V30H0V20H6V10H10V0Z" fill="var(--obs-color)"/>
             </svg>
          </div>
        </div>
        
        <p className="game-instructions">
          Sakrash uchun <strong>Space / Tepaga</strong> (telefonda bosing yoki tepaga suring).<br/>
          Egilish (pastki to'siqlar) uchun <strong>Pastga</strong> (telefonda pastga suring) tugmasidan foydalaning.
        </p>
      </div>
    </div>
  );
};

export default Play;
