import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de localStorage
const localStorageMock = {
  data: {},
  getItem: vi.fn((key) => {
    return localStorageMock.data[key] || null;
  }),
  setItem: vi.fn((key, value) => {
    localStorageMock.data[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.data[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.data = {};
  }),
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  data: {},
  getItem: vi.fn((key) => {
    return sessionStorageMock.data[key] || null;
  }),
  setItem: vi.fn((key, value) => {
    sessionStorageMock.data[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete sessionStorageMock.data[key];
  }),
  clear: vi.fn(() => {
    sessionStorageMock.data = {};
  }),
};
global.sessionStorage = sessionStorageMock;

// Mock de window.matchMedia
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

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() },
  })),
}));

// Mock de Howler.js
global.Howl = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  volume: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}));

// Mock de Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock de React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

// Mock de Supabase
vi.mock('./utils/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

// Mock de React Context para evitar errores de contexto múltiple
vi.mock('../utils/themeContext', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}));

// Mock de assets
vi.mock('/assets/images/*', () => 'mocked-image-path');
vi.mock('/assets/sounds/*', () => 'mocked-sound-path');

// Configuración global para tests
global.console = {
  ...console,
  // Silenciar warnings específicos durante tests
  warn: vi.fn(),
  error: vi.fn(),
};

// Configuración para aislar tests y evitar errores de contexto
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  
  // Limpiar el DOM completamente
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Limpiar cualquier contexto de React que pueda estar activo
  if (typeof window !== 'undefined') {
    // Limpiar cualquier estado global de React
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
  }
});

// Limpiar localStorage después de cada prueba
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  
  // Limpiar el DOM completamente
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Limpiar cualquier contexto de React que pueda estar activo
  if (typeof window !== 'undefined') {
    // Limpiar cualquier estado global de React
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
  }
});

// Mock de window.speechSynthesis para pruebas que no lo mockean específicamente
if (typeof window !== 'undefined') {
  // Espías para los métodos
  const mockCancel = vi.fn();
  const mockSpeak = vi.fn();
  const mockGetVoices = vi.fn(() => [
    { name: 'Google US English', lang: 'en-US', default: false },
    { name: 'Microsoft David', lang: 'en-US', default: true },
    { name: 'Google UK English', lang: 'en-GB', default: false },
    { name: 'System Voice', lang: 'en-US', default: true },
  ]);

  // Mock de SpeechSynthesisUtterance como espía compatible con toHaveBeenCalledWith
  const mockSpeechSynthesisUtterance = vi.fn(function(text) {
    this.text = text;
    this.lang = '';
    this.rate = 1;
    this.pitch = 1;
    this.voice = null;
  });

  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      cancel: mockCancel,
      speak: mockSpeak,
      getVoices: mockGetVoices,
      onvoiceschanged: null
    },
    writable: true
  });

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: mockSpeechSynthesisUtterance,
    writable: true
  });

  // Hacer accesibles los mocks para los tests
  global.mockSpeechSynthesis = window.speechSynthesis;
  global.mockSpeechSynthesisUtterance = mockSpeechSynthesisUtterance;
} 