import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const AnimalCharacter = ({ emotion, className }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" className={className}>
    <ellipse cx="22" cy="18" rx="11" ry="15" fill="#FFD700" transform="rotate(-20 22 18)" />
    <ellipse cx="78" cy="18" rx="11" ry="15" fill="#FFD700" transform="rotate(20 78 18)" />
    <circle cx="50" cy="50" r="40" fill="#FFD700" />
    <ellipse cx="28" cy="58" rx="8" ry="5" fill="#FF9EB5" opacity="0.7" />
    <ellipse cx="72" cy="58" rx="8" ry="5" fill="#FF9EB5" opacity="0.7" />
    <circle cx="35" cy="40" r="5" fill="#000" />
    <circle cx="65" cy="40" r="5" fill="#000" />
    {emotion === 'happy' && (
      <path d="M 30 60 Q 50 80 70 60" stroke="#000" strokeWidth="3" fill="none" />
    )}
    {emotion === 'neutral' && (
      <line x1="30" y1="60" x2="70" y2="60" stroke="#000" strokeWidth="3" />
    )}
    {emotion === 'excited' && (
      <path d="M 30 50 Q 50 80 70 50" stroke="#000" strokeWidth="3" fill="none" />
    )}
  </svg>
);

const Ball = ({ ball, onClick }) => (
  <div
    className={`absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-500 ${
      ball.status === 'active' ? '' : 'scale-150 opacity-0'
    }`}
    style={{ left: `${ball.x}%`, top: `${ball.y}%`, backgroundColor: ball.color }}
    onClick={onClick}
  >
    {ball.status === 'active' && (
      <>
        <span className="absolute left-[22%] top-[28%] w-[14%] h-[14%] rounded-full bg-gray-800" />
        <span className="absolute right-[22%] top-[28%] w-[14%] h-[14%] rounded-full bg-gray-800" />
        <span className="absolute left-[30%] top-[50%] w-[40%] h-[18%] border-b-[3px] border-gray-800 rounded-b-full" />
        <span className="absolute left-[14%] top-[12%] w-[28%] h-[16%] rounded-full bg-white/50" />
      </>
    )}
  </div>
);

const CongratulationsMessage = ({ elapsedTime, onRestart }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-opacity-80">
    <div className="text-center relative w-full h-full flex flex-col justify-center items-center">
      <AnimalCharacter emotion="excited" className="w-40 h-40 animate-bounce mb-4" />
      <h2 className="text-6xl font-bold mb-4 text-yellow-300 
                     transition-all duration-1000 transform scale-150 animate-pulse">
        おめでとう！
      </h2>
      <p className="text-4xl text-white 
                    transition-all duration-1000 transform scale-125 animate-bounce">
        100点だよ！！
      </p>
      <div className="mt-8 flex justify-center items-center space-x-2">
        <Timer className="w-6 h-6 text-white" />
        <p className="text-2xl text-white">かかった時間（じかん）: {elapsedTime}びょう</p>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <AnimalCharacter emotion="happy" className="w-16 h-16 animate-spin" />
        <AnimalCharacter emotion="excited" className="w-16 h-16 animate-ping" />
        <AnimalCharacter emotion="happy" className="w-16 h-16 animate-spin" />
      </div>
      <Button 
        onClick={onRestart}
        className="mt-12 mb-16 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full text-xl transition-all duration-300 transform hover:scale-105"
      >
        もういちどあそぶ
      </Button>
      <a href="https://mouselesson.manabi-time.com" className="mt-4">
        <Button
          variant="secondary"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold"
        >
          もどる
        </Button>
      </a>
    </div>
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div key={i} 
             className="absolute w-2 h-2 bg-white rounded-full animate-firework"
             style={{
               left: `${Math.random() * 100}vw`,
               top: `${Math.random() * 100}vh`,
               animationDelay: `${Math.random() * 2}s`
             }}
        />
      ))}
    </div>
  </div>
);

const Game = () => {
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [characterEmotion, setCharacterEmotion] = useState('neutral');
  const [characterMessage, setCharacterMessage] = useState('がんばってね！あおいボールはクリック、あかいボールはダブルクリックだよ！');
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const colors = {
    single: ['#87CEEB', '#4169E1', '#1E90FF', '#00BFFF'],
    double: ['#FF69B4', '#FF6347', '#FFA500', '#FF4500']
  };

  const getRandomColor = (type) => colors[type][Math.floor(Math.random() * colors[type].length)];

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowWarning(true);
    setTimeout(() => {
      setShowWarning(false);
    }, 1000);
  };

  const initializeGame = useCallback(() => {
    const newBalls = Array.from({ length: 20 }, (_, index) => ({
      id: index,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 10,
      color: index < 10 ? getRandomColor('single') : getRandomColor('double'),
      clickType: index < 10 ? 'single' : 'double',
      status: 'active',
      lastClickTime: 0,
      clickCount: 0
    }));
    setBalls(newBalls);
    setScore(0);
    setGameOver(false);
    setCharacterEmotion('neutral');
    setCharacterMessage('がんばってね！あおいボールはクリック、あかいボールはダブルクリックだよ！');
    setShowCongratulations(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  useEffect(() => {
    initializeGame();
    setAudioContext(new (window.AudioContext || window.webkitAudioContext)());
  }, [initializeGame]);

  useEffect(() => {
    let timer;
    if (startTime && !gameOver) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, gameOver]);

  const playSound = useCallback((type) => {
    if (audioContext) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      } else if (type === 'error') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      }

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + (type === 'correct' ? 0.1 : 0.3));
    }
  }, [audioContext]);

  const handleBallClick = useCallback((id) => {
    const currentTime = new Date().getTime();

    let pointsToAdd = 0;
    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(ball => {
        if (ball.id === id && ball.status === 'active') {
          const timeSinceLastClick = currentTime - ball.lastClickTime;
          const newClickCount = ball.clickCount + 1;

          if (
            (ball.clickType === 'single' && timeSinceLastClick > 300) ||
            (ball.clickType === 'double' && newClickCount === 2 && timeSinceLastClick < 300)
          ) {
            playSound('correct');
            pointsToAdd = 5;
            return { ...ball, status: 'popping', clickCount: 0, lastClickTime: currentTime };
          } else if (ball.clickType === 'single' && newClickCount === 2 && timeSinceLastClick < 300) {
            playSound('error');
            setCharacterMessage('あおいボールはクリックだけだよ！');
            return { ...ball, clickCount: 0, lastClickTime: currentTime };
          } else if (ball.clickType === 'double' && timeSinceLastClick > 300) {
            return { ...ball, clickCount: 1, lastClickTime: currentTime };
          } else {
            return { ...ball, clickCount: 0, lastClickTime: currentTime };
          }
        }
        return ball;
      });

      if (pointsToAdd > 0) {
        setScore(prevScore => prevScore + pointsToAdd);
      }

      if (updatedBalls.every(ball => ball.status === 'popping')) {
        setShowCongratulations(true);
      }

      return updatedBalls;
    });

    setTimeout(() => {
      setBalls(prevBalls => prevBalls.filter(ball => ball.status !== 'popping'));
    }, 500);
  }, [playSound]);

  useEffect(() => {
    if (score === 100) {
      setGameOver(true);
      setCharacterEmotion('excited');
      setCharacterMessage('やったね！100てんだよ！すごいよ！');
      playSound('correct');
      setShowCongratulations(true);
    } else if (score >= 90) {
      setCharacterEmotion('excited');
      setCharacterMessage('もうすこし！がんばれ～！');
    } else if (score >= 80) {
      setCharacterEmotion('happy');
      setCharacterMessage('あとちょっと！がんばって！');
    } else if (score >= 60) {
      setCharacterEmotion('happy');
      setCharacterMessage('いいかんじ！はんぶんいじょうできたよ！');
    } else if (score >= 40) {
      setCharacterEmotion('neutral');
      setCharacterMessage('このちょうしでがんばろう！クリックとダブルクリックのコツをつかんできたね！');
    } else if (score >= 20) {
      setCharacterEmotion('neutral');
      setCharacterMessage('いいスタートだよ！どんどんクリックしていこう！');
    } else if (score > 0) {
      setCharacterEmotion('neutral');
      setCharacterMessage('そのちょうし！クリックとダブルクリックがじょうずになってきたね！');
    }
  }, [score, playSound]);

  return (
    <div
      className="w-full min-h-screen bg-blue-100 p-4 flex justify-center"
      onContextMenu={handleContextMenu}
    >
      <div className="w-full max-w-2xl relative">
        <h1 className="text-2xl font-bold mb-4 text-center">カラフルボールわりゲーム (クリック＆ダブルクリックばん)</h1>
        <div className="relative flex justify-center mb-6">
          <div className="bg-white rounded-full px-8 py-2 shadow-md text-4xl font-bold text-orange-500">
            てんすう {score}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
            <Timer className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold text-blue-500">{elapsedTime}びょう</span>
          </div>
        </div>

        {showWarning && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <Alert className="bg-yellow-100 border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg shadow-lg animate-bounce">
              <AlertTriangle className="h-6 w-6 inline-block mr-2" />
              <span className="text-xl font-bold">みぎクリックしないでね</span>
            </Alert>
          </div>
        )}

        <div className="w-full h-[420px] bg-gradient-to-b from-orange-400 via-orange-300 to-pink-200 rounded-2xl relative overflow-hidden">
          <div className="absolute top-3 left-6 w-14 h-6 bg-orange-100 rounded-full opacity-80" aria-hidden="true" />
          <div className="absolute top-5 left-11 w-10 h-5 bg-orange-100 rounded-full opacity-80" aria-hidden="true" />
          <div className="absolute top-8 right-10 w-12 h-5 bg-orange-100 rounded-full opacity-70" aria-hidden="true" />
          {balls.map(ball => (
            <Ball key={ball.id} ball={ball} onClick={() => handleBallClick(ball.id)} />
          ))}
        </div>

        <div className="mt-4 flex items-end space-x-3">
          <AnimalCharacter emotion={characterEmotion} className="w-20 h-20" />
          <div className="bg-white rounded-2xl px-4 py-2 shadow-md text-lg font-bold flex-1">{characterMessage}</div>
        </div>
        <div className="mt-6 flex justify-center">
          <a href="https://mouselesson.manabi-time.com">
            <Button
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold"
            >
              もどる
            </Button>
          </a>
        </div>
      </div>

      {showCongratulations && <CongratulationsMessage elapsedTime={elapsedTime} onRestart={initializeGame} />}
    </div>
  );
};

export default Game;