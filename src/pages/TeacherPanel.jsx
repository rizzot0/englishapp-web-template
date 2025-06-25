import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameStatsAPI } from '../utils/supabase';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { FaUserLock } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const TEACHER_PASSWORD = 'profesor123'; // Cambia esto por una contraseña segura

function getAggregatedStats(stats) {
  // Agrupa por tipo de juego
  const byGame = {};
  stats.forEach(stat => {
    const game = stat.game_type;
    if (!byGame[game]) {
      byGame[game] = { game, total: 0, totalScore: 0, totalMistakes: 0, count: 0 };
    }
    byGame[game].total += 1;
    byGame[game].totalScore += stat.score || 0;
    byGame[game].totalMistakes += stat.mistakes || 0;
    byGame[game].count += 1;
  });
  return Object.values(byGame).map(g => ({
    game: g.game,
    avgScore: g.count ? (g.totalScore / g.count).toFixed(2) : 0,
    avgMistakes: g.count ? (g.totalMistakes / g.count).toFixed(2) : 0,
    participation: g.total
  }));
}

export default function TeacherPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [gameFilter, setGameFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Juegos y Temas disponibles
  const gameOptions = [
    { value: '', label: 'Todos los juegos' },
    { value: 'memoryGame', label: 'Memory Game' },
    { value: 'typingGame', label: 'Typing Game' },
    { value: 'mathGame', label: 'Math Game' },
    { value: 'sortingGame', label: 'Sorting Game' },
    { value: 'soundMatchingGame', label: 'Sound Matching' },
    { value: 'identificationGame', label: 'Identification Game' },
  ];
  const themeOptions = [
    { value: '', label: 'Todos los temas' },
    { value: 'fruits', label: 'Frutas' },
    { value: 'animals', label: 'Animales' },
    { value: 'colors', label: 'Colores' },
    { value: 'shapes', label: 'Formas' },
    { value: 'emotions', label: 'Emociones' },
    { value: 'family', label: 'Familia' },
    { value: 'bodyParts', label: 'Partes del Cuerpo' },
    { value: 'days', label: 'Días de la Semana' },
    { value: 'months', label: 'Meses del Año' },
    { value: 'seasons', label: 'Estaciones' },
    { value: 'objects', label: 'Objetos' },
    { value: 'general', label: 'General' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameStatsAPI.getAllStats(500);
      if (result.success) {
        setStats(result.data || []);
      } else {
        setError('Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === TEACHER_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  // Filtrado de datos
  const filteredStats = stats.filter(stat => {
    const matchGame = !gameFilter || stat.game_type === gameFilter;
    const matchTheme = !themeFilter || stat.theme === themeFilter;
    const matchDate = !dateFilter || (stat.created_at && stat.created_at.startsWith(dateFilter));
    return matchGame && matchTheme && matchDate;
  });

  // Usar los datos filtrados para los gráficos
  const aggregated = getAggregatedStats(filteredStats);

  // Exportar a PDF
  const handleExportPDF = async () => {
    const element = document.getElementById('export-table');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('estadisticas_filtradas.pdf');
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredStats);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas');
    XLSX.writeFile(wb, 'estadisticas_filtradas.xlsx');
  };

  if (!isAuthenticated) {
    return (
      <div className="teacher-panel-login" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
        <motion.div
          className="login-box"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            padding: '2.5rem 2rem',
            minWidth: '320px',
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <FaUserLock size={48} color="#7eaaff" style={{ marginBottom: '0.5rem' }} />
            <h2 style={{ color: '#7eaaff', fontWeight: 700, fontSize: '2rem', margin: 0, textAlign: 'center', letterSpacing: 1 }}>Panel del Profesor</h2>
          </div>
          <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.9rem 2.5rem 0.9rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #b3c6ff',
                  fontSize: '1.1rem',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 8px rgba(126,170,255,0.07)',
                  color: '#3a3a3a',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '0.7rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#7eaaff',
                  fontSize: '1.2rem',
                  padding: 0,
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(90deg, #7eaaff 0%, #b3c6ff 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.9rem 2.5rem',
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 4px 16px rgba(126,170,255,0.13)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: 1,
              }}
            >
              Entrar
            </button>
          </form>
          {error && <div className="error-message" style={{ color: '#f07167', fontWeight: 600, marginTop: '0.5rem', textAlign: 'center' }}>{error}</div>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="teacher-panel">
      <div className="panel-header">
        <h1>Panel del Profesor</h1>
        <button onClick={() => navigate('/')}>Volver al Menú</button>
      </div>
      {loading ? (
        <div className="loading">Cargando estadísticas...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="panel-content">
          <div className="charts-section" id="charts-section">
            <h2>Gráficos de Rendimiento General</h2>
            <div className="charts-grid">
              <div className="chart-box">
                <h3>Puntuación promedio por juego</h3>
                <ResponsiveContainer width="90%" height={180}>
                  <BarChart data={aggregated} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="game"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={0}
                      dy={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#00AFB9">
                      <LabelList dataKey="avgScore" position="top" offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-box">
                <h3>Errores promedio por juego</h3>
                <ResponsiveContainer width="90%" height={180}>
                  <BarChart data={aggregated} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="game"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={0}
                      dy={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgMistakes" fill="#F07167">
                      <LabelList dataKey="avgMistakes" position="top" offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-box">
                <h3>Participación (partidas jugadas por juego)</h3>
                <ResponsiveContainer width="90%" height={180}>
                  <BarChart data={aggregated} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="game"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={0}
                      dy={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="participation" fill="#FFD166">
                      <LabelList dataKey="participation" position="top" offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="filters-section">
            <h2>Filtros y Exportación</h2>
            <div className="filters-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label>Juego: </label>
                <select value={gameFilter} onChange={e => setGameFilter(e.target.value)}>
                  {gameOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label>Tema: </label>
                <select value={themeFilter} onChange={e => setThemeFilter(e.target.value)}>
                  {themeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label>Fecha: </label>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleExportExcel}>Exportar a Excel</button>
                <button onClick={handleExportPDF}>Exportar a PDF</button>
                <button onClick={async () => {
                  const element = document.getElementById('charts-section');
                  if (!element) return;
                  // Guardar estilos originales
                  const originalHeight = element.style.height;
                  const originalOverflow = element.style.overflow;
                  element.style.height = 'auto';
                  element.style.overflow = 'visible';
                  await new Promise(r => setTimeout(r, 200));
                  const canvas = await html2canvas(element, { scale: 2 });
                  // Restaurar estilos
                  element.style.height = originalHeight;
                  element.style.overflow = originalOverflow;
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const imgWidth = pageWidth - 40;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
                  pdf.save('graficos.pdf');
                }}>Exportar Gráficos a PDF</button>
              </div>
            </div>
            {/* Tabla de datos filtrados para exportación */}
            <div id="export-table" style={{ marginTop: '1rem', overflowX: 'auto', background: 'white', borderRadius: '10px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr>
                    <th>Juego</th>
                    <th>Tema</th>
                    <th>Puntuación</th>
                    <th>Errores</th>
                    <th>WPM</th>
                    <th>Accuracy</th>
                    <th>Duración (s)</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStats.map((stat, i) => (
                    <tr key={stat.id || i}>
                      <td>{gameOptions.find(g => g.value === stat.game_type)?.label || stat.game_type}</td>
                      <td>{themeOptions.find(t => t.value === stat.theme)?.label || stat.theme}</td>
                      <td>{stat.score}</td>
                      <td>{stat.mistakes}</td>
                      <td>{stat.wpm}</td>
                      <td>{stat.accuracy}</td>
                      <td>{stat.duration}</td>
                      <td>{stat.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 