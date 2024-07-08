import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars } from '@react-three/drei';
import { fibonacciSphere } from './utils/fibonacciGrid';
import './App.css';

const colorPatterns = {
  brightPastel: ['#FF69B4', '#FFD700', '#ADFF2F', '#87CEFA', '#BA55D3', '#FF6347', '#40E0D0', '#EE82EE', '#FFB6C1', '#FFFFE0'],
  allBlack: ['#000000'],
  blueGradient: ['#e0f7fa', '#80deea', '#26c6da', '#00acc1', '#007c91'],
  redGradient: ['#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336']
};

const getRandomColor = (colors) => colors[Math.floor(Math.random() * colors.length)];

function RotatingSpheres({ points, size, colors, sampleCount }) {
  const groupRef = useRef();
  const [sphereColors, setSphereColors] = useState([]);

  useEffect(() => {
    if (sphereColors.length === 0) {
      setSphereColors(points.map(() => getRandomColor(colors)));
    } else {
      const newColors = points.map((_, index) => sphereColors[index] || getRandomColor(colors));
      setSphereColors(newColors);
    }
  }, [points]);

  useEffect(() => {
    setSphereColors(points.map(() => getRandomColor(colors)));
  }, [colors]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    groupRef.current.rotation.y = elapsedTime / 10;
    groupRef.current.rotation.x = elapsedTime / 10;
    groupRef.current.rotation.z = elapsedTime / 10;
  });

  return (
    <group ref={groupRef}>
      {points.map((point, index) => (
        <Sphere key={index} args={[size, 32, 32]} position={point}>
          <meshStandardMaterial color={sphereColors[index]} />
        </Sphere>
      ))}
    </group>
  );
}

function App() {
  const [sampleCount, setSampleCount] = useState(0);
  const [sphereSize, setSphereSize] = useState(0.05);
  const [colorPattern, setColorPattern] = useState('brightPastel');
  const [isCountingUp, setIsCountingUp] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [countdownStart, setCountdownStart] = useState(1000);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [currentColors, setCurrentColors] = useState(colorPatterns[colorPattern]);

  const points = sampleCount > 0 ? fibonacciSphere(sampleCount) : [];

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastUpdate;
        setTime((prevTime) => {
          let newTime = isCountingUp ? prevTime + deltaTime : prevTime - deltaTime;
          if (!isCountingUp && newTime <= 0) {
            newTime = 0;
            setIsRunning(false);
          }
          if (Math.floor(newTime / 1000) !== Math.floor(prevTime / 1000)) {
            setSampleCount((prevCount) => isCountingUp ? prevCount + 1 : Math.max(prevCount - 1, 0));
          }
          return newTime;
        });
        setLastUpdate(now);
      }, 1);
    } else if (!isRunning && time !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time, isCountingUp, lastUpdate]);

  const handleStart = () => {
    if (!isRunning) {
      setLastUpdate(Date.now());
      if (!isCountingUp) {
        setSampleCount(countdownStart);
        setTime(countdownStart * 1000);
      }
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(isCountingUp ? 0 : countdownStart * 1000);
    setSampleCount(isCountingUp ? 0 : countdownStart);
  };

  const handleColorPatternChange = (pattern) => {
    setColorPattern(pattern);
    setCurrentColors(colorPatterns[pattern]);
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(3);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(6, '0')}`;
  };

  return (
    <>
      <Canvas style={{ height: '100vh' }} camera={{ position: [0, 0, 2], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <RotatingSpheres points={points} size={sphereSize} colors={currentColors} sampleCount={sampleCount} />
        <OrbitControls />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      <div className="controls">
        <label>
          Sphere Size:
          <input type="number" value={sphereSize} step="0.01" onChange={(e) => setSphereSize(Number(e.target.value))} />
        </label>
        <div className="color-patterns">
          {Object.keys(colorPatterns).map((pattern) => (
            <div
              key={pattern}
              className={`color-pattern ${pattern === colorPattern ? 'selected' : ''}`}
              onClick={() => handleColorPatternChange(pattern)}
            >
              {colorPatterns[pattern].map((color, index) => (
                <span key={index} style={{ backgroundColor: color }}></span>
              ))}
            </div>
          ))}
        </div>
        <div className="stopwatch-controls">
          <button className={isCountingUp ? 'active' : ''} onClick={() => { setIsCountingUp(true); handleReset(); }}>Count Up</button>
          <button className={!isCountingUp ? 'active' : ''} onClick={() => { setIsCountingUp(false); handleReset(); }}>Count Down</button>
          {!isRunning ? <button onClick={handleStart}>Start</button> : <button onClick={handleStop}>Stop</button>}
          <button onClick={handleReset}>Reset</button>
        </div>
        {!isCountingUp && (
          <label>
            Countdown Start:
            <input type="number" value={countdownStart} onChange={(e) => setCountdownStart(Number(e.target.value))} />
          </label>
        )}
      </div>
      <div className="time-display">
        {formatTime(time)}
      </div>
    </>
  );
}

export default App;
