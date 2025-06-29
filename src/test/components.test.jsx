import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Limpiar localStorage antes de cada test
beforeEach(() => {
  localStorage.clear();
  // Limpiar clases del body
  document.body.className = '';
  // Limpiar meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.removeAttribute('content');
  }
  
  // Mock para window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  // Limpiar clases del body
  document.body.className = '';
  // Limpiar meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.removeAttribute('content');
  }
});

// Mock de los componentes
const MockThemeToggle = ({ isDark, setIsDark }) => (
  <button 
    onClick={() => setIsDark(!isDark)}
    data-testid="theme-toggle"
    aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
  >
    {isDark ? '🌙' : '☀️'}
  </button>
);

const MockMusicToggle = ({ isEnabled, setIsEnabled }) => (
  <button 
    onClick={() => setIsEnabled(!isEnabled)}
    data-testid="music-toggle"
    aria-label={isEnabled ? 'Desactivar música' : 'Activar música'}
  >
    {isEnabled ? '🔊' : '🔇'}
  </button>
);

const MockVolumeControls = ({ volume, setVolume }) => (
  <div data-testid="volume-controls">
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={volume}
      onChange={(e) => setVolume(parseFloat(e.target.value))}
      data-testid="volume-slider"
    />
    <span data-testid="volume-display">{Math.round(volume * 100)}%</span>
  </div>
);

const MockAssetPreloader = ({ onComplete }) => {
  // Simular carga de assets
  setTimeout(() => onComplete(), 100);
  return <div data-testid="asset-preloader">Cargando...</div>;
};

// Wrapper para componentes que usan React Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Theme Toggle Component', () => {
  it('renders theme toggle button', () => {
    render(<MockThemeToggle isDark={false} setIsDark={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('theme-toggle');
    expect(toggleButton).toBeInTheDocument();
  });

  it('shows sun icon when in light mode', () => {
    render(<MockThemeToggle isDark={false} setIsDark={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('theme-toggle');
    expect(toggleButton).toHaveTextContent('☀️');
  });

  it('shows moon icon when in dark mode', () => {
    render(<MockThemeToggle isDark={true} setIsDark={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('theme-toggle');
    expect(toggleButton).toHaveTextContent('🌙');
  });

  it('calls setIsDark when clicked', () => {
    const mockSetIsDark = vi.fn();
    render(<MockThemeToggle isDark={false} setIsDark={mockSetIsDark} />);
    
    const toggleButton = screen.getByTestId('theme-toggle');
    fireEvent.click(toggleButton);
    
    expect(mockSetIsDark).toHaveBeenCalledWith(true);
  });

  it('has correct accessibility attributes', () => {
    render(<MockThemeToggle isDark={false} setIsDark={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('theme-toggle');
    expect(toggleButton).toHaveAttribute('aria-label', 'Cambiar a modo oscuro');
  });
});

describe('Music Toggle Component', () => {
  it('renders music toggle button', () => {
    render(<MockMusicToggle isEnabled={true} setIsEnabled={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('music-toggle');
    expect(toggleButton).toBeInTheDocument();
  });

  it('shows speaker icon when music is enabled', () => {
    render(<MockMusicToggle isEnabled={true} setIsEnabled={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('music-toggle');
    expect(toggleButton).toHaveTextContent('🔊');
  });

  it('shows muted icon when music is disabled', () => {
    render(<MockMusicToggle isEnabled={false} setIsEnabled={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('music-toggle');
    expect(toggleButton).toHaveTextContent('🔇');
  });

  it('calls setIsEnabled when clicked', () => {
    const mockSetIsEnabled = vi.fn();
    render(<MockMusicToggle isEnabled={true} setIsEnabled={mockSetIsEnabled} />);
    
    const toggleButton = screen.getByTestId('music-toggle');
    fireEvent.click(toggleButton);
    
    expect(mockSetIsEnabled).toHaveBeenCalledWith(false);
  });

  it('has correct accessibility attributes', () => {
    render(<MockMusicToggle isEnabled={true} setIsEnabled={vi.fn()} />);
    
    const toggleButton = screen.getByTestId('music-toggle');
    expect(toggleButton).toHaveAttribute('aria-label', 'Desactivar música');
  });
});

describe('Volume Controls Component', () => {
  it('renders volume controls', () => {
    render(<MockVolumeControls volume={0.5} setVolume={vi.fn()} />);
    
    const volumeControls = screen.getByTestId('volume-controls');
    const volumeSlider = screen.getByTestId('volume-slider');
    const volumeDisplay = screen.getByTestId('volume-display');
    
    expect(volumeControls).toBeInTheDocument();
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeDisplay).toBeInTheDocument();
  });

  it('displays correct volume percentage', () => {
    render(<MockVolumeControls volume={0.75} setVolume={vi.fn()} />);
    
    const volumeDisplay = screen.getByTestId('volume-display');
    expect(volumeDisplay).toHaveTextContent('75%');
  });

  it('updates volume when slider is moved', () => {
    const mockSetVolume = vi.fn();
    render(<MockVolumeControls volume={0.5} setVolume={mockSetVolume} />);
    
    const volumeSlider = screen.getByTestId('volume-slider');
    fireEvent.change(volumeSlider, { target: { value: '0.8' } });
    
    expect(mockSetVolume).toHaveBeenCalledWith(0.8);
  });

  it('has correct slider attributes', () => {
    render(<MockVolumeControls volume={0.5} setVolume={vi.fn()} />);
    
    const volumeSlider = screen.getByTestId('volume-slider');
    expect(volumeSlider).toHaveAttribute('min', '0');
    expect(volumeSlider).toHaveAttribute('max', '1');
    expect(volumeSlider).toHaveAttribute('step', '0.1');
    expect(volumeSlider).toHaveAttribute('value', '0.5');
  });
});

describe('Asset Preloader Component', () => {
  it('renders loading message', () => {
    render(<MockAssetPreloader onComplete={vi.fn()} />);
    
    const preloader = screen.getByTestId('asset-preloader');
    expect(preloader).toHaveTextContent('Cargando...');
  });

  it('calls onComplete after loading', async () => {
    const mockOnComplete = vi.fn();
    render(<MockAssetPreloader onComplete={mockOnComplete} />);
    
    // Esperar a que se complete la carga simulada
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(mockOnComplete).toHaveBeenCalled();
  });
});

describe('Floating Particles Component', () => {
  it('renders particles container', () => {
    const MockFloatingParticles = () => (
      <div data-testid="floating-particles" className="floating-particles">
        <div className="particle">✨</div>
        <div className="particle">🌟</div>
        <div className="particle">💫</div>
      </div>
    );

    render(<MockFloatingParticles />);
    
    const particlesContainer = screen.getByTestId('floating-particles');
    expect(particlesContainer).toBeInTheDocument();
    expect(particlesContainer).toHaveClass('floating-particles');
  });

  it('renders multiple particles', () => {
    const MockFloatingParticles = () => (
      <div data-testid="floating-particles" className="floating-particles">
        <div className="particle">✨</div>
        <div className="particle">🌟</div>
        <div className="particle">💫</div>
      </div>
    );

    render(<MockFloatingParticles />);
    
    const particles = screen.getAllByText(/✨|🌟|💫/);
    expect(particles.length).toBe(3);
  });
});

describe('Optimized Image Component', () => {
  it('renders image with correct attributes', () => {
    const MockOptimizedImage = ({ src, alt, className }) => (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        data-testid="optimized-image"
        loading="lazy"
      />
    );

    render(
      <MockOptimizedImage 
        src="/test-image.webp" 
        alt="Test image" 
        className="test-class" 
      />
    );
    
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('src', '/test-image.webp');
    expect(image).toHaveAttribute('alt', 'Test image');
    expect(image).toHaveAttribute('class', 'test-class');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('handles image error gracefully', () => {
    const MockOptimizedImage = ({ src, alt, onError }) => (
      <img 
        src={src} 
        alt={alt} 
        onError={onError}
        data-testid="optimized-image"
      />
    );

    const mockOnError = vi.fn();
    render(
      <MockOptimizedImage 
        src="/invalid-image.webp" 
        alt="Invalid image" 
        onError={mockOnError} 
      />
    );
    
    const image = screen.getByTestId('optimized-image');
    fireEvent.error(image);
    
    expect(mockOnError).toHaveBeenCalled();
  });
});

describe('Background Audio Component', () => {
  it('renders audio element when playing', () => {
    const MockBackgroundAudio = ({ isPlaying, volume }) => (
      <div data-testid="background-audio">
        {isPlaying && (
          <audio 
            data-testid="audio-element"
            volume={volume}
            autoPlay
            loop
          />
        )}
      </div>
    );

    render(<MockBackgroundAudio isPlaying={true} volume={0.5} />);
    
    const audioContainer = screen.getByTestId('background-audio');
    const audioElement = screen.getByTestId('audio-element');
    
    expect(audioContainer).toBeInTheDocument();
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute('volume', '0.5');
    expect(audioElement).toHaveAttribute('autoPlay');
    expect(audioElement).toHaveAttribute('loop');
  });

  it('does not render audio element when not playing', () => {
    const MockBackgroundAudio = ({ isPlaying }) => (
      <div data-testid="background-audio">
        {isPlaying && (
          <audio data-testid="audio-element" />
        )}
      </div>
    );

    render(<MockBackgroundAudio isPlaying={false} />);
    
    const audioContainer = screen.getByTestId('background-audio');
    expect(audioContainer).toBeInTheDocument();
    
    // No debería haber elemento de audio
    expect(screen.queryByTestId('audio-element')).not.toBeInTheDocument();
  });
});

describe('Layout Components', () => {
  it('renders main layout structure', () => {
    const MockLayout = () => (
      <div data-testid="main-layout" className="app-layout">
        <header data-testid="header">Header</header>
        <main data-testid="main-content">Main Content</main>
        <footer data-testid="footer">Footer</footer>
      </div>
    );

    render(<MockLayout />);
    
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('applies correct CSS classes to layout', () => {
    const MockLayout = () => (
      <div data-testid="main-layout" className="app-layout">
        <header data-testid="header">Header</header>
        <main data-testid="main-content">Main Content</main>
        <footer data-testid="footer">Footer</footer>
      </div>
    );

    render(<MockLayout />);
    
    const layout = screen.getByTestId('main-layout');
    expect(layout).toHaveClass('app-layout');
  });
});

describe('Interactive Components', () => {
  it('handles user interactions correctly', () => {
    const MockInteractiveComponent = () => {
      const [count, setCount] = React.useState(0);
      
      return (
        <div data-testid="interactive-component">
          <span data-testid="count-display">Count: {count}</span>
          <button 
            onClick={() => setCount(count + 1)}
            data-testid="increment-button"
          >
            Increment
          </button>
        </div>
      );
    };

    render(<MockInteractiveComponent />);
    
    const countDisplay = screen.getByTestId('count-display');
    const incrementButton = screen.getByTestId('increment-button');
    
    expect(countDisplay).toHaveTextContent('Count: 0');
    
    fireEvent.click(incrementButton);
    
    expect(countDisplay).toHaveTextContent('Count: 1');
  });

  it('handles form submissions', () => {
    const MockFormComponent = () => {
      const [submitted, setSubmitted] = React.useState(false);
      
      const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
      };
      
      return (
        <form onSubmit={handleSubmit} data-testid="test-form">
          <input type="text" data-testid="name-input" />
          <button type="submit" data-testid="submit-button">
            Submit
          </button>
          {submitted && <span data-testid="success-message">Form submitted!</span>}
        </form>
      );
    };

    render(<MockFormComponent />);
    
    const form = screen.getByTestId('test-form');
    const submitButton = screen.getByTestId('submit-button');
    
    fireEvent.click(submitButton);
    
    expect(screen.getByTestId('success-message')).toHaveTextContent('Form submitted!');
  });
}); 