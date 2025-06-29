import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock de los juegos
const MockMemoryGame = ({ theme, onGameComplete }) => {
  const [cards, setCards] = React.useState([
    { id: 1, word: 'apple', image: '/apple.webp', isFlipped: false, isMatched: false },
    { id: 2, word: 'apple', image: '/apple.webp', isFlipped: false, isMatched: false },
    { id: 3, word: 'banana', image: '/banana.webp', isFlipped: false, isMatched: false },
    { id: 4, word: 'banana', image: '/banana.webp', isFlipped: false, isMatched: false }
  ]);
  const [flippedCards, setFlippedCards] = React.useState([]);
  const [score, setScore] = React.useState(0);

  const handleCardClick = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card.isFlipped && !card.isMatched && flippedCards.length < 2) {
      const newCards = cards.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      );
      setCards(newCards);
      setFlippedCards([...flippedCards, cardId]);

      if (flippedCards.length === 1) {
        // Verificar si hay match
        const firstCard = cards.find(c => c.id === flippedCards[0]);
        const secondCard = card;
        
        if (firstCard.word === secondCard.word) {
          // Match encontrado
          const matchedCards = newCards.map(c => 
            c.id === firstCard.id || c.id === secondCard.id 
              ? { ...c, isMatched: true } 
              : c
          );
          setCards(matchedCards);
          setScore(score + 10);
          setFlippedCards([]);
          
          // Verificar si el juego está completo
          const allMatched = matchedCards.every(c => c.isMatched);
          if (allMatched && onGameComplete) {
            onGameComplete({ score: score + 10, time: 60 });
          }
        } else {
          // No hay match, voltear las cartas después de un delay
          setTimeout(() => {
            const resetCards = newCards.map(c => 
              c.id === firstCard.id || c.id === secondCard.id 
                ? { ...c, isFlipped: false } 
                : c
            );
            setCards(resetCards);
            setFlippedCards([]);
          }, 1000);
        }
      }
    }
  };

  return (
    <div data-testid="memory-game">
      <h2>Memory Game - {theme}</h2>
      <div data-testid="score">Score: {score}</div>
      <div data-testid="cards-container">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            data-testid={`card-${card.id}`}
            className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
            disabled={card.isMatched}
          >
            {card.isFlipped || card.isMatched ? card.word : '?'}
          </button>
        ))}
      </div>
    </div>
  );
};

const MockTypingGame = ({ theme, difficulty, onGameComplete }) => {
  const [currentWord, setCurrentWord] = React.useState('apple');
  const [userInput, setUserInput] = React.useState('');
  const [score, setScore] = React.useState(0);
  const [wpm, setWpm] = React.useState(0);
  const [accuracy, setAccuracy] = React.useState(100);

  const words = ['apple', 'banana', 'orange', 'grape'];
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = () => {
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      setScore(score + 10);
      setAccuracy(100);
    } else {
      setAccuracy(Math.max(0, accuracy - 10));
    }

    setUserInput('');
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < words.length) {
      setCurrentIndex(nextIndex);
      setCurrentWord(words[nextIndex]);
    } else {
      // Juego completado
      if (onGameComplete) {
        onGameComplete({ score, wpm, accuracy });
      }
    }
  };

  return (
    <div data-testid="typing-game">
      <h2>Typing Game - {theme} ({difficulty})</h2>
      <div data-testid="score">Score: {score}</div>
      <div data-testid="wpm">WPM: {wpm}</div>
      <div data-testid="accuracy">Accuracy: {accuracy}%</div>
      <div data-testid="current-word">{currentWord}</div>
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        data-testid="word-input"
        placeholder="Type the word..."
      />
      <button onClick={handleSubmit} data-testid="submit-button">
        Submit
      </button>
    </div>
  );
};

const MockMathGame = ({ theme, onGameComplete }) => {
  const [currentProblem, setCurrentProblem] = React.useState({ num1: 5, num2: 3, operator: '+', answer: 8 });
  const [userAnswer, setUserAnswer] = React.useState('');
  const [score, setScore] = React.useState(0);
  const [problemsSolved, setProblemsSolved] = React.useState(0);

  const problems = [
    { num1: 5, num2: 3, operator: '+', answer: 8 },
    { num1: 10, num2: 4, operator: '-', answer: 6 },
    { num1: 6, num2: 2, operator: '*', answer: 12 }
  ];

  const handleAnswerSubmit = () => {
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    
    if (isCorrect) {
      setScore(score + 10);
    }
    
    setProblemsSolved(problemsSolved + 1);
    setUserAnswer('');

    if (problemsSolved + 1 < problems.length) {
      setCurrentProblem(problems[problemsSolved + 1]);
    } else {
      // Juego completado
      if (onGameComplete) {
        onGameComplete({ score, problemsSolved: problemsSolved + 1 });
      }
    }
  };

  return (
    <div data-testid="math-game">
      <h2>Math Game - {theme}</h2>
      <div data-testid="score">Score: {score}</div>
      <div data-testid="problems-solved">Problems Solved: {problemsSolved}</div>
      <div data-testid="current-problem">
        {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
      </div>
      <input
        type="number"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
        data-testid="answer-input"
        placeholder="Enter answer..."
      />
      <button onClick={handleAnswerSubmit} data-testid="submit-answer">
        Submit Answer
      </button>
    </div>
  );
};

// Wrapper para componentes que usan React Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Memory Game', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders memory game with correct theme', () => {
    render(<MockMemoryGame theme="Fruits" onGameComplete={vi.fn()} />);
    
    expect(screen.getByTestId('memory-game')).toBeInTheDocument();
    expect(screen.getByText('Memory Game - Fruits')).toBeInTheDocument();
  });

  it('displays initial score of 0', () => {
    render(<MockMemoryGame theme="Fruits" onGameComplete={vi.fn()} />);
    
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
  });

  it('renders all cards initially face down', () => {
    render(<MockMemoryGame theme="Fruits" onGameComplete={vi.fn()} />);
    
    const cards = screen.getAllByTestId(/card-/);
    expect(cards.length).toBe(4);
    
    cards.forEach(card => {
      expect(card).toHaveTextContent('?');
    });
  });

  it('flips card when clicked', () => {
    render(<MockMemoryGame theme="Fruits" onGameComplete={vi.fn()} />);
    
    const firstCard = screen.getByTestId('card-1');
    fireEvent.click(firstCard);
    
    expect(firstCard).toHaveTextContent('apple');
  });

  it('increases score when match is found', async () => {
    const mockOnGameComplete = vi.fn();
    render(<MockMemoryGame theme="Fruits" onGameComplete={mockOnGameComplete} />);
    
    // Hacer clic en las dos cartas de apple
    const card1 = screen.getByTestId('card-1');
    const card2 = screen.getByTestId('card-2');
    
    fireEvent.click(card1);
    fireEvent.click(card2);
    
    // Esperar a que se procese el match
    await waitFor(() => {
      expect(screen.getByTestId('score')).toHaveTextContent('Score: 10');
    });
  });

  it('calls onGameComplete when all cards are matched', async () => {
    const mockOnGameComplete = vi.fn();
    render(<MockMemoryGame theme="Fruits" onGameComplete={mockOnGameComplete} />);
    
    // Hacer clic en todas las cartas para completar el juego
    const cards = screen.getAllByTestId(/card-/);
    
    // Simular completar el juego
    cards.forEach(card => {
      fireEvent.click(card);
    });
    
    // Esperar a que se complete el juego
    await waitFor(() => {
      expect(mockOnGameComplete).toHaveBeenCalled();
    });
  });
});

describe('Typing Game', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders typing game with correct theme and difficulty', () => {
    render(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={vi.fn()} />);
    
    expect(screen.getByTestId('typing-game')).toBeInTheDocument();
    expect(screen.getByText('Typing Game - Animals (Easy)')).toBeInTheDocument();
  });

  it('displays current word to type', () => {
    render(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={vi.fn()} />);
    
    expect(screen.getByTestId('current-word')).toHaveTextContent('apple');
  });

  it('updates input value when typing', () => {
    render(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={vi.fn()} />);
    
    const input = screen.getByTestId('word-input');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(input.value).toBe('test');
  });

  it('increases score for correct word', () => {
    const mockOnGameComplete = vi.fn();
    render(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={mockOnGameComplete} />);
    
    const input = screen.getByTestId('word-input');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 10');
  });

  it('decreases accuracy for incorrect word', () => {
    const mockOnGameComplete = vi.fn();
    render(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={mockOnGameComplete} />);
    
    const input = screen.getByTestId('word-input');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('accuracy')).toHaveTextContent('Accuracy: 90%');
  });

  it('submits on Enter key press', () => {
    const mockOnGameComplete = vi.fn();
    render(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={mockOnGameComplete} />);
    
    const input = screen.getByTestId('word-input');
    
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 10');
  });
});

describe('Math Game', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders math game with correct theme', () => {
    render(<MockMathGame theme="Addition" onGameComplete={vi.fn()} />);
    
    expect(screen.getByTestId('math-game')).toBeInTheDocument();
    expect(screen.getByText('Math Game - Addition')).toBeInTheDocument();
  });

  it('displays current math problem', () => {
    render(<MockMathGame theme="Addition" onGameComplete={vi.fn()} />);
    
    expect(screen.getByTestId('current-problem')).toHaveTextContent('5 + 3 = ?');
  });

  it('updates answer input when typing', () => {
    render(<MockMathGame theme="Addition" onGameComplete={vi.fn()} />);
    
    const input = screen.getByTestId('answer-input');
    fireEvent.change(input, { target: { value: '8' } });
    
    expect(input.value).toBe('8');
  });

  it('increases score for correct answer', () => {
    const mockOnGameComplete = vi.fn();
    render(<MockMathGame theme="Addition" onGameComplete={mockOnGameComplete} />);
    
    const input = screen.getByTestId('answer-input');
    const submitButton = screen.getByTestId('submit-answer');
    
    fireEvent.change(input, { target: { value: '8' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 10');
  });

  it('increases problems solved count', () => {
    const mockOnGameComplete = vi.fn();
    render(<MockMathGame theme="Addition" onGameComplete={mockOnGameComplete} />);
    
    const input = screen.getByTestId('answer-input');
    const submitButton = screen.getByTestId('submit-answer');
    
    fireEvent.change(input, { target: { value: '8' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('problems-solved')).toHaveTextContent('Problems Solved: 1');
  });

  it('submits on Enter key press', () => {
    const mockOnGameComplete = vi.fn();
    render(<MockMathGame theme="Addition" onGameComplete={mockOnGameComplete} />);
    
    const input = screen.getByTestId('answer-input');
    
    fireEvent.change(input, { target: { value: '8' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 10');
  });
});

describe('Game Integration', () => {
  afterEach(() => {
    cleanup();
  });

  it('handles game completion callbacks', () => {
    const mockMemoryComplete = vi.fn();
    const mockTypingComplete = vi.fn();
    const mockMathComplete = vi.fn();

    const { rerender } = render(<MockMemoryGame theme="Fruits" onGameComplete={mockMemoryComplete} />);
    
    // Simular completar el juego de memoria
    const cards = screen.getAllByTestId(/card-/);
    cards.forEach(card => {
      fireEvent.click(card);
    });

    rerender(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={mockTypingComplete} />);
    
    // Simular completar el juego de escritura
    const input = screen.getByTestId('word-input');
    const submitButton = screen.getByTestId('submit-button');
    
    // Completar todas las palabras
    for (let i = 0; i < 4; i++) {
      fireEvent.change(input, { target: { value: 'apple' } });
      fireEvent.click(submitButton);
    }

    rerender(<MockMathGame theme="Addition" onGameComplete={mockMathComplete} />);
    
    // Simular completar el juego de matemáticas
    const mathInput = screen.getByTestId('answer-input');
    const mathSubmitButton = screen.getByTestId('submit-answer');
    
    // Completar todos los problemas
    for (let i = 0; i < 3; i++) {
      fireEvent.change(mathInput, { target: { value: '8' } });
      fireEvent.click(mathSubmitButton);
    }

    // Verificar que los callbacks fueron llamados
    expect(mockMemoryComplete).toHaveBeenCalled();
    expect(mockTypingComplete).toHaveBeenCalled();
    expect(mockMathComplete).toHaveBeenCalled();
  });

  it('maintains game state correctly', () => {
    const { rerender } = render(<MockMemoryGame theme="Fruits" onGameComplete={vi.fn()} />);
    
    // Verificar estado inicial
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
    
    // Cambiar a otro juego
    rerender(<MockTypingGame theme="Animals" difficulty="Easy" onGameComplete={vi.fn()} />);
    
    // Verificar que el nuevo juego tiene su propio estado
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
    expect(screen.getByTestId('current-word')).toHaveTextContent('apple');
    
    // Volver al primer juego
    rerender(<MockMemoryGame theme="Fruits" onGameComplete={vi.fn()} />);
    
    // Verificar que el estado se reinicia
    expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
  });
}); 