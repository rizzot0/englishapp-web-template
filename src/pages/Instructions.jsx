// src/pages/Instructions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Instructions.css';
import { motion } from 'framer-motion';

export default function Instructions() {
  const navigate = useNavigate();

  const instructions = [
    {
      title: '📘 Memory Game',
      description: 'Haz clic en las tarjetas para encontrar pares. Cada par está compuesto por una palabra y su imagen correspondiente. Temáticas: Frutas, Colores, Figuras, Emociones.'
    },
    {
      title: '⌨️ Typing Game',
      description: 'Escribe letra por letra la palabra que representa la imagen mostrada. Completa tantas como puedas en 60 segundos. Temáticas: Frutas, Animales, Miembros de la familia.'
    },
    {
      title: '➕ Math Game',
      description: 'Resuelve sumas o restas entre 0 y 20, o identifica la parte del cuerpo mostrada en la imagen. Temáticas: Matemáticas, Partes del cuerpo.'
    },
    {
      title: '🔀 Sorting Game',
      description: 'Arrastra y ordena los bloques en el orden correcto. Temáticas: Días de la semana, Meses del año, Estaciones.'
    }
  ];

  return (
    <motion.div
      className="instructions-page"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1>📄 Instrucciones</h1>

      <motion.div
        className="cards-container"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } }
        }}
      >
        {instructions.map((item, index) => (
          <motion.div
            key={index}
            className="instruction-card"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.03 }}
          >
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        className="back-btn"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Volver al Menú
      </motion.button>
    </motion.div>
  );
}
