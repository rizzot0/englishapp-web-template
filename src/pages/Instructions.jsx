// src/pages/Instructions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Instructions.css';
import { motion } from 'framer-motion';

export default function Instructions() {
  const navigate = useNavigate();

  const instructions = [
    {
      title: '🧠 Memory Game',
      description: 'Haz clic en las tarjetas para encontrar pares. Cada par está compuesto por una palabra y su imagen correspondiente. ¡Encuentra todos los pares para ganar! Temáticas: Frutas, Colores, Figuras, Emociones.'
    },
    {
      title: '⌨️ Typing Game',
      description: 'Escribe letra por letra la palabra que representa la imagen mostrada. ¡Completa tantas como puedas en 60 segundos! Temáticas: Frutas, Animales, Miembros de la familia.'
    },
    {
      title: '➕ Math Game',
      description: 'Resuelve sumas o restas entre 0 y 20, o identifica la parte del cuerpo mostrada en la imagen. ¡Pon a prueba tus conocimientos! Temáticas: Matemáticas, Partes del cuerpo.'
    },
    {
      title: '🔀 Sorting Game',
      description: 'Arrastra y ordena los bloques en el orden correcto. ¡Demuestra tu capacidad de organización! Temáticas: Días de la semana, Meses del año, Estaciones.'
    }
  ];

  return (
    <motion.div
      className="instructions-page"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Elementos decorativos */}
      <div className="instructions-decorative">
        <div className="decorative-icon">🎓</div>
        <div className="decorative-icon">📝</div>
        <div className="decorative-icon">🎯</div>
        <div className="decorative-icon">🏆</div>
      </div>

      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        Instrucciones
      </motion.h1>

      <motion.div
        className="cards-container"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { 
            transition: { 
              staggerChildren: 0.3,
              delayChildren: 0.2
            } 
          }
        }}
      >
        {instructions.map((item, index) => (
          <motion.div
            key={index}
            className="instruction-card"
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.8 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }
              }
            }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {item.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              {item.description}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        className="back-btn"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        🏠 Volver al Menú
      </motion.button>
    </motion.div>
  );
}
