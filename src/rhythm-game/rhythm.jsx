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

  // ⭐️ 통합 입력 시작 처리 (키보드/마우스/터치 공용)
  const handleInputStart = useCallback((lane) => {
    if (gameState !== 'playing' || lane === -1) return;

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
  }, [gameState, handlePerfect]);

  // ⭐️ 통합 입력 종료 처리 (키보드/마우스/터치 공용)
  const handleInputEnd = useCallback((lane) => {
    if (gameState !== 'playing' || lane === -1) return;

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
  }, [gameState, handleMiss, handlePerfect]);

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
      console.error("샘플 로드 실패:", e);
      alert("파일을 불러올 수 없습니다.");
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
      } catch (e) { console.error(e); }
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
            hit: false, missed: false, holding: false,
          });
          lastNoteTime = time + duration;
        }
      }
    }

    notesRef.current = generatedNotes;
    scoreRef.current = 0; comboRef.current = 0; maxComboRef.current = 0;
    perfectCountRef.current = 0; missCountRef.current = 0;

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

  // 마우스/터치 좌표 계산 함수
  const getLaneFromPointer = (clientX) => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    return Math.floor(x / LANE_WIDTH);
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
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    for (let i = 0; i < 4; i++) {
      if (keysPressedRef.current[i]) {
        const gradient = ctx.createLinearGradient(0, HIT_Y - 300, 0, HIT_Y + 100);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 229, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = gradient; ctx.fillRect(i * LANE_WIDTH, 0, LANE_WIDTH, CANVAS_HEIGHT);
      }
    }

    ctx.strokeStyle = '#444'; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(i * LANE_WIDTH, 0); ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 0, 85, 0.8)'; ctx.fillRect(0, HIT_Y - 2.5, CANVAS_WIDTH, 5);

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
      } else {
        let topY = HIT_Y - (note.endTime - currentTime) * SPEED;
        let currentBottomY = note.holding ? HIT_Y : bottomY;
        if (currentBottomY > -50 && topY < CANVAS_HEIGHT + 50) {
          drawEmbossedRect(ctx, note.lane * LANE_WIDTH + 15, topY, LANE_WIDTH - 30, currentBottomY - topY, note.holding ? '#ffea00' : '#b200ff');
        }
        if (note.holding) {
          scoreRef.current += 1; 
          if (currentTime >= note.endTime) { note.hit = true; note.holding = false; handlePerfect(); }
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

    const f = feedbackRef.current;
    // eslint-disable-next-line react-hooks/purity
    if (Date.now() - f.time < 500) {
      ctx.fillStyle = f.text === 'Miss!' ? '#ff0055' : '#00e5ff';
      ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
    reqRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const kDown = (e) => { if(!e.repeat) handleInputStart(KEYS.indexOf(e.key.toLowerCase())); };
    const kUp = (e) => handleInputEnd(KEYS.indexOf(e.key.toLowerCase()));
    
    window.addEventListener('keydown', kDown);
    window.addEventListener('keyup', kUp);
    return () => { window.removeEventListener('keydown', kDown); window.removeEventListener('keyup', kUp); };
  }, [handleInputStart, handleInputEnd]);

  useEffect(() => {
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      if (sourceRef.current) { try { sourceRef.current.stop(); } catch(e) {console.debug("Audio stop ignored", e);} }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#08080c', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 99999, overflow: 'hidden', fontFamily: 'sans-serif'
    }}>
      <button onClick={() => window.location.href = '/'} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, padding: '10px 20px', backgroundColor: '#222', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>← 메인</button>
      <h2 style={{ position: 'absolute', top: '30px', color: '#00e5ff', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 10px #00e5ff' }}>NEON BEAT</h2>

      {gameState === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
          <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ color: '#fff' }} />
          <button onClick={() => generateBeatMapAndPlay()} disabled={!audioFile} style={{ padding: '15px 40px', fontSize: '1.2rem', fontWeight: 'bold', backgroundColor: '#00e5ff', borderRadius: '10px' }}>Start Game</button>
          <button onClick={playSample} style={{ padding: '8px 20px', backgroundColor: '#444', color: '#ccc', borderRadius: '5px' }}>샘플 플레이</button>
          <p style={{ color: '#aaa' }}>조작: <b style={{ color: '#ffea00' }}>A, S, ;, '</b> 또는 <b style={{ color: '#ffea00' }}>화면 터치</b></p>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        // ⭐️ 마우스/터치 이벤트 추가
        onMouseDown={(e) => handleInputStart(getLaneFromPointer(e.clientX))}
        onMouseUp={(e) => handleInputEnd(getLaneFromPointer(e.clientX))}
        onMouseLeave={(e) => handleInputEnd(getLaneFromPointer(e.clientX))}
        onTouchStart={(e) => {
          e.preventDefault();
          handleInputStart(getLaneFromPointer(e.touches[0].clientX));
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          // touchEnd는 touches가 비어있을 수 있어 changedTouches 사용
          handleInputEnd(getLaneFromPointer(e.changedTouches[0].clientX));
        }}
        style={{ 
          display: gameState === 'playing' ? 'block' : 'none',
          width: '100%', maxWidth: '400px', maxHeight: '75vh', aspectRatio: '4 / 6',
          border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '15px',
          boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)', cursor: 'crosshair', touchAction: 'none'
        }} 
      />

      {gameState === 'result' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '50px', background: 'rgba(10,10,20,0.9)', border: '3px solid #00e5ff', borderRadius: '20px' }}>
          <h2 style={{ fontSize: '3rem', color: '#ffea00' }}>CLEAR!</h2>
          <div style={{ fontSize: '1.8rem', color: '#fff' }}>
            <div>🏆 Score: {scoreRef.current}</div>
            <div>🔥 Max Combo: {maxComboRef.current}</div>
            <div>✨ Perfect: {perfectCountRef.current}</div>
            <div>💀 Miss: {missCountRef.current}</div>
          </div>
          <button onClick={() => setGameState('menu')} style={{ padding: '15px 40px', backgroundColor: '#b200ff', color: '#fff', borderRadius: '10px' }}>돌아가기</button>
        </div>
      )}
    </div>
  );
}