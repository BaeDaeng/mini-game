import React, { useState, useRef, useEffect, useCallback } from 'react';

// 같은 폴더에 있는 mp3 파일들
import sampleMp3 from './으흑흑.mp3';
import drumMp3 from './drum.mp3';

// 게임 설정
const KEYS = ['a', 's', ';', "'"];
const LANE_WIDTH = 100;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const HIT_Y = 500;
const SPEED = 600;
const PERFECT_TOLERANCE = 0.1; 
const GOOD_TOLERANCE = 0.2; 

export default function App() {
  const [gameState, setGameState] = useState('menu');
  const [audioFile, setAudioFile] = useState(null);

  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const reqRef = useRef(null);
  const startTimeRef = useRef(0);
  const notesRef = useRef([]);
  
  const keysPressedRef = useRef([false, false, false, false]); 
  const drumBufferRef = useRef(null); 

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const perfectCountRef = useRef(0);
  const missCountRef = useRef(0);
  
  const feedbackRef = useRef({ text: '', time: 0 });

  // ⭐️ Warning 3 해결: useCallback으로 함수를 감싸서 리액트의 경고를 없앱니다.
  const showFeedback = useCallback((text) => {
    feedbackRef.current = { text, time: Date.now() }; 
  }, []);

  const handlePerfect = useCallback((scoreAdd = 100) => {
    scoreRef.current += scoreAdd;
    comboRef.current += 1;
    perfectCountRef.current += 1;
    if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
    showFeedback('Perfect!');
  }, [showFeedback]);

  const handleMiss = useCallback(() => {
    comboRef.current = 0;
    missCountRef.current += 1;
    showFeedback('Miss!');
  }, [showFeedback]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setAudioFile(file);
  };

  const playSample = async () => {
    try {
      const res = await fetch(sampleMp3);
      const blob = await res.blob();
      generateBeatMapAndPlay(blob); 
    } catch (e) {
      // ⭐️ Error 1 해결: e 변수를 사용하여 에러 로그를 남깁니다.
      console.error("샘플 파일을 불러오지 못했습니다:", e);
      alert("으흑흑.mp3 파일을 불러올 수 없습니다. 파일 위치를 확인해주세요!");
    }
  };

  const generateBeatMapAndPlay = async (customFile) => {
    const targetFile = (customFile instanceof Blob) ? customFile : audioFile;
    if (!targetFile) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    if (!drumBufferRef.current) {
      try {
        const drumRes = await fetch(drumMp3);
        const drumArrayBuffer = await drumRes.arrayBuffer();
        drumBufferRef.current = await audioCtx.decodeAudioData(drumArrayBuffer);
      } catch (e) {
        console.error("drum.mp3 로드 실패:", e);
      }
    }

    const arrayBuffer = await targetFile.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    
    const generatedNotes = [];
    const threshold = 0.4;
    const minInterval = 0.125;
    let lastNoteTime = 0;

    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        const time = i / audioBuffer.sampleRate;
        
        if (time - lastNoteTime > minInterval) {
          // eslint-disable-next-line react-hooks/purity
          const isLong = Math.random() < 0.2;
          // eslint-disable-next-line react-hooks/purity
          const duration = isLong ? 0.3 + Math.random() * 0.5 : 0;

          generatedNotes.push({
            type: isLong ? 'long' : 'short',
            time: time,
            endTime: time + duration,
            // eslint-disable-next-line react-hooks/purity
            lane: Math.floor(Math.random() * 4),
            hit: false,
            missed: false,
            holding: false,
          });
          lastNoteTime = time + duration;
        }
      }
    }

    notesRef.current = generatedNotes;
    
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    perfectCountRef.current = 0;
    missCountRef.current = 0;

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    
    source.onended = () => {
      setGameState(prev => prev === 'playing' ? 'result' : prev);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };

    source.start();
    sourceRef.current = source;
    startTimeRef.current = audioCtx.currentTime;
    setGameState('playing'); 
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  const drawEmbossedRect = (ctx, x, y, width, height, baseColor) => {
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x, y, width, 5);
    ctx.fillRect(x, y, 5, height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x, y + height - 5, width, 5);
    ctx.fillRect(x + width - 5, y, 5, height);
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const currentTime = audioCtxRef.current.currentTime - startTimeRef.current;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    for (let i = 0; i < 4; i++) {
      if (keysPressedRef.current[i]) {
        const gradient = ctx.createLinearGradient(0, HIT_Y - 300, 0, HIT_Y + 100);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 229, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(i * LANE_WIDTH, 0, LANE_WIDTH, CANVAS_HEIGHT);
      }
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(i * LANE_WIDTH, 0); ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 0, 85, 0.8)';
    ctx.fillRect(0, HIT_Y - 2.5, CANVAS_WIDTH, 5);

    notesRef.current.forEach((note) => {
      if (note.hit) return;

      const bottomY = HIT_Y - (note.time - currentTime) * SPEED;
      
      if (note.type === 'short') {
        if (bottomY > -50 && bottomY < CANVAS_HEIGHT + 50) {
          drawEmbossedRect(ctx, note.lane * LANE_WIDTH + 10, bottomY - 15, LANE_WIDTH - 20, 30, '#00e5ff');
        }
        if (!note.missed && currentTime > note.time + GOOD_TOLERANCE) {
          note.missed = true; handleMiss(); 
        }
      } 
      else if (note.type === 'long') {
        let topY = HIT_Y - (note.endTime - currentTime) * SPEED;
        let currentBottomY = note.holding ? HIT_Y : bottomY;
        let height = currentBottomY - topY;

        if (currentBottomY > -50 && topY < CANVAS_HEIGHT + 50) {
          drawEmbossedRect(ctx, note.lane * LANE_WIDTH + 15, topY, LANE_WIDTH - 30, height, note.holding ? '#ffea00' : '#b200ff');
        }

        if (note.holding) {
          scoreRef.current += 1; 
          if (currentTime >= note.endTime) {
            note.hit = true; note.holding = false;
            handlePerfect(); 
          }
        }

        if (!note.missed && !note.holding && currentTime > note.time + GOOD_TOLERANCE) {
          note.missed = true; handleMiss(); 
        }
      }
    });

    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`Score: ${scoreRef.current}`, 20, 40);
    ctx.fillStyle = '#ffea00'; ctx.font = '20px sans-serif';
    ctx.fillText(`Combo: ${comboRef.current}`, 20, 70);

    const { text, time } = feedbackRef.current;
    // eslint-disable-next-line react-hooks/purity
    if (Date.now() - time < 500) {
      ctx.fillStyle = text === 'Miss!' ? '#ff0055' : '#00e5ff';
      ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }

    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || e.repeat) return;
      const lane = KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      keysPressedRef.current[lane] = true;

      if (drumBufferRef.current && audioCtxRef.current) {
        const drumSource = audioCtxRef.current.createBufferSource();
        drumSource.buffer = drumBufferRef.current;
        drumSource.connect(audioCtxRef.current.destination);
        drumSource.start();
      }

      const currentTime = audioCtxRef.current.currentTime - startTimeRef.current;

      const targetNote = notesRef.current.find(
        (n) => !n.hit && !n.missed && n.lane === lane && Math.abs(n.time - currentTime) <= GOOD_TOLERANCE
      );

      if (targetNote) {
        if (targetNote.type === 'short') {
          targetNote.hit = true;
          handlePerfect(); 
        } else if (targetNote.type === 'long') {
          targetNote.holding = true;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (gameState !== 'playing') return;
      const lane = KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      keysPressedRef.current[lane] = false;

      const currentTime = audioCtxRef.current.currentTime - startTimeRef.current;
      const heldNote = notesRef.current.find((n) => n.holding && n.lane === lane);
      
      if (heldNote) {
        heldNote.holding = false;
        if (currentTime < heldNote.endTime - GOOD_TOLERANCE) {
          heldNote.missed = true; handleMiss(); 
        } else {
          heldNote.hit = true; handlePerfect(50); 
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  // ⭐️ Warning 3 해결: 의존성 배열에 리액트가 요구한 함수들을 모두 넣었습니다.
  }, [gameState, handleMiss, handlePerfect]); 

  useEffect(() => {
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      if (sourceRef.current) {
        try { 
          sourceRef.current.stop(); 
          sourceRef.current.disconnect(); 
        } catch {
          // ⭐️ Error 2 해결: 빈 블록 에러를 막기 위한 주석 삽입
          /* 무시되는 에러 */
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#08080c', backgroundImage: 'radial-gradient(circle at center, #1a1a2e 0%, #08080c 100%)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 99999, margin: 0, padding: 0, overflow: 'hidden',
      fontFamily: 'sans-serif'
    }}>
      
      <button 
        onClick={() => window.location.href = '/'}
        style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 100,
          padding: '10px 20px', backgroundColor: '#222', color: '#fff', 
          border: '1px solid #444', borderRadius: '8px', cursor: 'pointer',
          fontWeight: 'bold', transition: '0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#444'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#222'}
      >
        ← 메인으로
      </button>

      <h2 style={{
        position: 'absolute', top: '30px', margin: 0,
        color: '#00e5ff', fontSize: '2.5rem', fontWeight: 900,
        textShadow: '0 0 10px #00e5ff, 0 0 20px #00e5ff', zIndex: 10, letterSpacing: '4px'
      }}>
        NEON BEAT
      </h2>

      {gameState === 'menu' && (
        <div style={{
          position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '20px', padding: '40px', background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '20px', zIndex: 10
        }}>
          <input type="file" accept="audio/mp3, audio/wav" onChange={handleFileUpload} style={{ color: '#fff' }} />
          
          <button 
            onClick={() => generateBeatMapAndPlay()} disabled={!audioFile}
            style={{
              padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: '#00e5ff', border: 'none', borderRadius: '10px',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)'
            }}
          >
            Start Game
          </button>

          <button
            onClick={playSample}
            style={{
              padding: '8px 20px', fontSize: '0.9rem', cursor: 'pointer',
              backgroundColor: '#444', color: '#ccc', border: '1px solid #666', 
              borderRadius: '5px', marginTop: '-5px', transition: 'all 0.3s'
            }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#555'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = '#444'; e.target.style.color = '#ccc'; }}
          >
            샘플 플레이 (으흑흑.mp3)
          </button>

          <p style={{ color: '#aaa', margin: 0, marginTop: '10px' }}>조작키: <b style={{ color: '#ffea00' }}>A, S, ;, '</b></p>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        style={{ 
          display: gameState === 'playing' ? 'block' : 'none',
          width: '100%', maxWidth: '400px', maxHeight: '75vh', aspectRatio: '4 / 6',
          border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '15px',
          boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)', objectFit: 'contain'
        }} 
      />

      {gameState === 'result' && (
        <div style={{
          position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '20px', padding: '50px', background: 'rgba(10, 10, 20, 0.9)',
          border: '3px solid #00e5ff', borderRadius: '20px', zIndex: 20,
          boxShadow: '0 0 50px rgba(0, 229, 255, 0.5)'
        }}>
          <h2 style={{ fontSize: '3rem', color: '#ffea00', margin: '0 0 20px 0', textShadow: '0 0 20px #ffea00' }}>
            TRACK CLEARED!
          </h2>
          
          <div style={{ fontSize: '1.8rem', color: '#fff', textAlign: 'left', lineHeight: '2' }}>
            <div>🏆 Score: <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{scoreRef.current}</span></div>
            <div>🔥 Max Combo: <span style={{ color: '#ffea00', fontWeight: 'bold' }}>{maxComboRef.current}</span></div>
            <div>✨ Perfect: <span style={{ color: '#00ff00', fontWeight: 'bold' }}>{perfectCountRef.current}</span></div>
            <div>💀 Miss: <span style={{ color: '#ff0055', fontWeight: 'bold' }}>{missCountRef.current}</span></div>
          </div>

          <button 
            onClick={() => setGameState('menu')} 
            style={{
              marginTop: '30px', padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold', 
              cursor: 'pointer', backgroundColor: '#b200ff', color: '#fff', border: 'none', 
              borderRadius: '10px', boxShadow: '0 0 20px rgba(178, 0, 255, 0.6)'
            }}
          >
            돌아가기 (다시하기)
          </button>
        </div>
      )}
    </div>
  );
}