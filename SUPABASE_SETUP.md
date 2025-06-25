# Configuración de Supabase para la Aplicación Educativa

## ¿Qué es Supabase?

Supabase es una alternativa gratuita y de código abierto a Firebase que proporciona:
- Base de datos PostgreSQL
- API REST automática
- Autenticación de usuarios
- Dashboard web para administrar datos
- Plan gratuito generoso (500MB, 50,000 filas/mes)

## Pasos para Configurar Supabase

### 1. Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub, Google o email
4. Crea una nueva organización

### 2. Crear un nuevo proyecto

1. Haz clic en "New Project"
2. Elige tu organización
3. Dale un nombre al proyecto (ej: "english-app-stats")
4. Elige una contraseña para la base de datos
5. Selecciona la región más cercana
6. Haz clic en "Create new project"

### 3. Configurar la base de datos

Una vez creado el proyecto, ve a la sección "SQL Editor" y ejecuta este código:

```sql
-- Crear tabla para estadísticas de juegos
CREATE TABLE game_stats (
  id BIGSERIAL PRIMARY KEY,
  game_type VARCHAR(50) NOT NULL,
  theme VARCHAR(50),
  score INTEGER NOT NULL,
  duration INTEGER,
  mistakes INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'normal',
  player_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_game_stats_game_type ON game_stats(game_type);
CREATE INDEX idx_game_stats_created_at ON game_stats(created_at);
CREATE INDEX idx_game_stats_score ON game_stats(score);

-- Habilitar Row Level Security (RLS)
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserción y lectura
CREATE POLICY "Allow all operations" ON game_stats
  FOR ALL USING (true) WITH CHECK (true);
```

### 4. Obtener las credenciales

1. Ve a "Settings" → "API"
2. Copia la "Project URL"
3. Copia la "anon public" key

### 5. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

### 6. Instalar dependencias

```bash
npm install @supabase/supabase-js
```

## Estructura de la Base de Datos

### Tabla: game_stats

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | ID único autoincremental |
| game_type | VARCHAR(50) | Tipo de juego (memoryGame, typingGame, etc.) |
| theme | VARCHAR(50) | Tema del juego (fruits, animals, etc.) |
| score | INTEGER | Puntuación obtenida |
| duration | INTEGER | Duración en segundos |
| mistakes | INTEGER | Número de errores |
| correct_answers | INTEGER | Respuestas correctas |
| total_questions | INTEGER | Total de preguntas |
| difficulty | VARCHAR(20) | Nivel de dificultad |
| player_name | VARCHAR(100) | Nombre del jugador |
| created_at | TIMESTAMP | Fecha y hora de creación |

## Funcionalidades Implementadas

### 1. Guardar Estadísticas
```javascript
import { gameStatsAPI } from './utils/supabase';

const gameData = {
  game_type: 'memoryGame',
  theme: 'fruits',
  score: 150,
  duration: 120,
  mistakes: 2,
  correct_answers: 8,
  total_questions: 10,
  difficulty: 'normal',
  player_name: 'Estudiante'
};

const result = await gameStatsAPI.saveGameStats(gameData);
```

### 2. Obtener Estadísticas
```javascript
// Todas las estadísticas
const allStats = await gameStatsAPI.getAllStats(100);

// Estadísticas de un juego específico
const gameStats = await gameStatsAPI.getGameStats('memoryGame', 50);

// Mejores puntuaciones
const topScores = await gameStatsAPI.getTopScores('memoryGame', 10);
```

### 3. Hook Personalizado
```javascript
import { useGameStats } from './utils/useGameStats';

const { stats, loading, saveGameStats, getSummary } = useGameStats();
```

## Dashboard de Supabase

Una vez configurado, puedes acceder al dashboard en:
- **URL**: https://supabase.com/dashboard/project/[tu-project-id]
- **Tabla Editor**: Para ver y editar datos manualmente
- **SQL Editor**: Para ejecutar consultas personalizadas
- **API Docs**: Documentación automática de la API

## Consultas Útiles para la Profesora

### Ver todas las estadísticas
```sql
SELECT * FROM game_stats ORDER BY created_at DESC;
```

### Estadísticas por juego
```sql
SELECT 
  game_type,
  COUNT(*) as total_games,
  AVG(score) as average_score,
  MAX(score) as best_score
FROM game_stats 
GROUP BY game_type;
```

### Mejores puntuaciones
```sql
SELECT 
  player_name,
  game_type,
  score,
  created_at
FROM game_stats 
ORDER BY score DESC 
LIMIT 10;
```

### Estadísticas por fecha
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as games_played,
  AVG(score) as average_score
FROM game_stats 
WHERE created_at >= '2024-01-01'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Ventajas de Usar Supabase

1. **Gratuito**: Plan generoso sin límite de tiempo
2. **Escalable**: Puede crecer con el proyecto
3. **Fácil de usar**: Dashboard web intuitivo
4. **Seguro**: Row Level Security incluido
5. **API automática**: No necesitas escribir backend
6. **Tiempo real**: Posibilidad de actualizaciones en vivo
7. **Backup automático**: Datos seguros

## Solución de Problemas

### Error de conexión
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto esté activo en Supabase

### Error de permisos
- Verifica que RLS esté configurado correctamente
- Revisa las políticas de la tabla

### Datos no se guardan
- Verifica la estructura de la tabla
- Revisa los logs en la consola del navegador

## Próximos Pasos

1. Configurar autenticación de usuarios
2. Agregar más métricas (tiempo por pregunta, etc.)
3. Implementar reportes automáticos
4. Agregar gráficos y visualizaciones
5. Configurar notificaciones por email 