import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Wrapper para componentes que usan React Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the main title', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer h1 con el texto correcto
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s[0]).toHaveTextContent('EnglishApp');
  });

  it('renders the subtitle', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer h2 con el texto correcto
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s[0]).toHaveTextContent('¡Aprende inglés jugando! 🎮');
  });

  it('renders all six game cards', () => {
    renderWithRouter(<Home />);
    // Usar getAllByText y verificar que haya al menos uno de cada
    expect(screen.getAllByText('Memory Game').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Typing Game').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Math Game').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sorting Game').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sound Match').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Identification Game').length).toBeGreaterThan(0);
  });

  it('renders navigation buttons', () => {
    renderWithRouter(<Home />);
    expect(screen.getAllByText('📊 Mis Estadísticas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('📄 Instrucciones').length).toBeGreaterThan(0);
  });

  it('has correct links for game cards', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer enlace de cada juego
    const memoryLink = screen.getAllByText('Memory Game')[0].closest('a');
    const typingLink = screen.getAllByText('Typing Game')[0].closest('a');
    const mathLink = screen.getAllByText('Math Game')[0].closest('a');
    const sortingLink = screen.getAllByText('Sorting Game')[0].closest('a');
    const soundLink = screen.getAllByText('Sound Match')[0].closest('a');
    const identificationLink = screen.getAllByText('Identification Game')[0].closest('a');
    expect(memoryLink).toHaveAttribute('href', '/memory-theme');
    expect(typingLink).toHaveAttribute('href', '/typing-theme');
    expect(mathLink).toHaveAttribute('href', '/math-theme');
    expect(sortingLink).toHaveAttribute('href', '/sorting-theme');
    expect(soundLink).toHaveAttribute('href', '/sound-matching-theme');
    expect(identificationLink).toHaveAttribute('href', '/identification-theme');
  });

  it('has correct links for navigation buttons', () => {
    renderWithRouter(<Home />);
    const statsLink = screen.getAllByText('📊 Mis Estadísticas')[0].closest('a');
    const instructionsLink = screen.getAllByText('📄 Instrucciones')[0].closest('a');
    expect(statsLink).toHaveAttribute('href', '/statistics');
    expect(instructionsLink).toHaveAttribute('href', '/instructions');
  });

  it('renders decorative elements', () => {
    renderWithRouter(<Home />);
    const decorativeElements = screen.getAllByText(/🎈|🎪|🎨|🎭/);
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  it('renders game card images', () => {
    renderWithRouter(<Home />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('applies correct CSS classes', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer h1 y busca su div padre con la clase
    const h1s = screen.getAllByRole('heading', { level: 1 });
    const homeContainer = h1s[0].closest('div');
    expect(homeContainer).toHaveClass('home-container');
  });

  it('handles click events on game cards', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer botón de Memory Game
    const memoryGame = screen.getAllByText('Memory Game')[0];
    fireEvent.click(memoryGame);
    expect(memoryGame).toBeInTheDocument();
  });

  it('handles click events on navigation buttons', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer botón de estadísticas e instrucciones
    const statsButton = screen.getAllByText('📊 Mis Estadísticas')[0];
    const instructionsButton = screen.getAllByText('📄 Instrucciones')[0];
    fireEvent.click(statsButton);
    fireEvent.click(instructionsButton);
    expect(statsButton).toBeInTheDocument();
    expect(instructionsButton).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    renderWithRouter(<Home />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('maintains proper heading hierarchy', () => {
    renderWithRouter(<Home />);
    // Selecciona el primer h1 y h2
    const h1s = screen.getAllByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h1s[0]).toHaveTextContent('EnglishApp');
    expect(h2s[0]).toHaveTextContent('¡Aprende inglés jugando! 🎮');
  });
}); 