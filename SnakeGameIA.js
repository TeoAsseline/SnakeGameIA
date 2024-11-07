import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Heart } from 'lucide-react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [obstacles, setObstacles] = useState([]);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  const generateRandomPosition = () => {
    const position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };

    // Make sure food doesn't spawn on snake or obstacles
    const isOnSnake = snake.some(segment => segment.x === position.x && segment.y === position.y);
    const isOnObstacle = obstacles.some(obstacle => obstacle.x === position.x && obstacle.y === position.y);

    if (isOnSnake || isOnObstacle) {
      return generateRandomPosition();
    }

    return position;
  };

  const generateObstacles = () => {
    const newObstacles = [];
    for (let i = 0; i < 5; i++) {
      newObstacles.push(generateRandomPosition());
    }
    setObstacles(newObstacles);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateRandomPosition());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setLives(3);
    generateObstacles();
    setIsPaused(false);
  };

  const checkCollision = useCallback((head) => {
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      return true;
    }

    // Check obstacle collision
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
      return true;
    }

    return false;
  }, [snake, obstacles]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }

    if (checkCollision(head)) {
      if (lives > 1) {
        setLives(prev => prev - 1);
        setSnake(INITIAL_SNAKE);
        setDirection('RIGHT');
        return;
      }
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setFood(generateRandomPosition());
      setScore(prev => prev + 10);
      setSpeed(prev => Math.max(prev - SPEED_INCREASE, 50));
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, checkCollision, score, highScore, lives, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver) {
        if (e.key === 'Enter') {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [moveSnake, speed]);

  useEffect(() => {
    generateObstacles();
  }, []);

  return (
    <Card className="w-full max-w-xl mx-auto bg-slate-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            <span className="font-bold">High Score: {highScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Score: {score}</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(lives)].map((_, i) => (
              <Heart key={i} className="text-red-500" size={20} />
            ))}
          </div>
        </div>

        <div className="relative border-2 border-gray-300 bg-white"
             style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500 rounded-sm"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                backgroundColor: index === 0 ? '#059669' : '#34D399'
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE
            }}
          />

          {/* Obstacles */}
          {obstacles.map((obstacle, index) => (
            <div
              key={`obstacle-${index}`}
              className="absolute bg-gray-700 rounded-sm"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: obstacle.x * CELL_SIZE,
                top: obstacle.y * CELL_SIZE
              }}
            />
          ))}

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="mb-4">Final Score: {score}</p>
              <button
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          )}

          {/* Pause Overlay */}
          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
              <h2 className="text-2xl font-bold">Paused</h2>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Controls: Arrow keys to move | Space to pause | Enter to restart</p>
          <p>Collect red food to grow and earn points. Avoid walls, obstacles, and yourself!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SnakeGame;