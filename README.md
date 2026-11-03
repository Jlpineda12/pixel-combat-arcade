# 🥊 Pixel Combat Arcade 1984 — 1v1 Retro Fighter

[![GitHub Pages Demo](https://img.shields.io/badge/LIVE%20DEMO-PLAY%20NOW-ff334b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://jlpineda12.github.io/pixel-combat-arcade/)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Battle%20Synth-fda415?style=for-the-badge&logo=soundcharts&logoColor=black)](https://jlpineda12.github.io/pixel-combat-arcade/)
[![Vanilla JS](https://img.shields.io/badge/Zero%20Dependencies-100%25%20Vanilla%20ES6-00f5d4?style=for-the-badge&logo=javascript&logoColor=black)](https://jlpineda12.github.io/pixel-combat-arcade/)
[![Degree](https://img.shields.io/badge/Ingeniería%20en%20Multimedia-Colombia-blue?style=for-the-badge)](https://github.com/Jlpineda12)

> **Un videojuego de combate arcade 1v1 retro en 2D inspirado en los clásicos de peleas (*Street Fighter* / *Tekken 2D*). Cuenta con físicas de combate completas (hitboxes, hurtboxes, hit-stop, bloqueos, proyectiles especiales "Hadouken") y una banda sonora de batalla chiptune a 144 BPM sintetizada 100% en tiempo real mediante Web Audio API.**

---

## 🎮 [► Jugar Pixel Combat Arcade en Vivo](https://jlpineda12.github.io/pixel-combat-arcade/)

---

## ⚡ Características del Juego

### 1. 🥋 Sistema de Combate y Físicas 2D
* **Peleadores en Pixel Art:** 
  * **P1 (`CYBER-RYU`):** Karateka cian/azul con cinta roja.
  * **P2 / CPU (`SHADOW-KEN`):** Oponente carmesí controlado por inteligencia artificial.
* **Mecánicas de Lucha Avanzadas:**
  * **Puñetazo Ligero (*Light Punch*):** Ataque rápido de corto alcance para interrumpir al rival.
  * **Patada Pesada (*Heavy Kick*):** Ataque de mayor rango con más daño y empuje.
  * **Poder Especial (*Hadouken Fireball*):** Proyectil de energía que viaja a través del escenario.
  * **Bloqueo / Guardia (*Guard*):** Reduce el 80% del daño entrante y genera chispas metálicas.
  * **Hit-Stop (Micro congelamiento de fotograma):** Pausa de 2 a 6 fotogramas en el impacto para otorgar sensación de peso y contundencia.
  * **Screen Shake & Hit Sparks:** Sacudida de pantalla y explosión de partículas de píxeles en impactos críticos.
  * **Reglas de Torneo:** 2 de 3 asaltos (*Best of 3*), reloj de 99 segundos y K.O. dramático.

### 2. 🧠 Oponente con Inteligencia Artificial (FSM)
* Máquina de Estados Finitos que analiza la distancia y el estado del jugador:
  * **Larga distancia (> 220px):** Avanza o lanza proyectiles de energía.
  * **Media distancia (90px - 220px):** Ataques en salto o fintas de aproximación.
  * **Corta distancia (< 90px):** Combos de puñetazo y patada, o bloqueo reactivo si el jugador lanza un ataque.

### 3. 🎵 Motor de Audio de Batalla Procedimental (Web Audio API)
* **Cero archivos MP3 o WAV externos:** Todo el sonido se calcula matemáticamente en tiempo real.
* **Banda Sonora de Combate a 144 BPM:**
  * Línea de bajo continuo en semicorcheas (escala de Re menor / D minor).
  * Arpegiador rápido y melodía líder de acción generada proceduralmente.
  * Percusión de lucha 8-bits: bombo contundente, caja cortante y charles constantes.
* **Efectos de Sonido (SFX):**
  * *Swoosh* de viento en golpes al aire.
  * Impacto seco de puño y golpe demoledor de patada.
  * Choque metálico al bloquear ataques.
  * Sonido de lanzamiento y explosión del Hadouken.
  * Explosión con caída de tono sub-grave para el **"K.O.!"**.

### 4. 🕹️ Chasis de Gabinete Arcade y Pantalla Dot-Matrix LCD
* Monitor CRT con curvatura en las esquinas y filtro de matriz de puntos (estilo Game Boy / CRT).
* Panel inferior decorativo con la palanca de arcade (*ball-top*) y los pulsadores de combate (*PUNCH*, *KICK*, *BLAST*).
* Fondo de sala en perspectiva 3D con colores pizarra y violeta.

---

## 🎮 Controles del Teclado

| Tecla | Acción |
|---|---|
| `[A]` / `[D]` o `[←]` / `[→]` | Caminar izquierda / derecha |
| `[W]` o `[↑]` | Saltar |
| `[S]` o `[↓]` | Agacharse |
| `[Espacio]` o `[B]` | **Bloquear / Guardia** |
| `[J]` o `[Z]` | **Puñetazo (Punch)** |
| `[K]` o `[X]` | **Patada (Kick)** |
| `[L]` o `[C]` | **Poder Especial (Hadouken)** |
| `[P]` o `[Esc]` | Pausa |

---

## 🏛️ Estructura del Código

```
pixel-combat-arcade/
├── index.html              # Monitor arcade 4:3, perspectiva y panel de control
├── style.css               # Estilos del gabinete, joystick y botones decorativos
├── package.json            # Suite de pruebas automatizadas QA
├── src/
│   ├── main.js             # Bucle de juego a 60 FPS e inicialización
│   ├── audio/
│   │   ├── SynthEngine.js     # Núcleo de síntesis Web Audio API (ADSR, osciladores, ruido)
│   │   ├── SoundEffects.js    # SFX de combate: golpes, bloqueos, proyectil y K.O.
│   │   └── BattleMusic.js     # Banda sonora procedimental de pelea a 144 BPM
│   └── game/
│       ├── Fighter.js         # Entidad del peleador, cajas de impacto, estados y render 2D
│       ├── Projectile.js      # Entidad de proyectil Hadouken con estela de partículas
│       ├── Particles.js       # Sistema de chispas de impacto y polvo
│       ├── AI.js              # Controlador de CPU rival con máquina de estados
│       ├── Stage.js           # Escenario dojo con faroles colgantes y fondo
│       └── Game.js            # Máquina de estados (Intro, Fighting, KO, Pausa)
└── test/
    └── qa-runner.js        # Suite de pruebas automatizadas QA
```

---

## 🚀 Ejecución en Local

```bash
python3 -m http.server 8080
# Abre http://localhost:8080 en tu navegador
```

---

## 👤 Autor

**Jose Luis Pineda Barrera**
* 🎓 Ingeniería en Multimedia — Universidad Militar Nueva Granada (Colombia)
* 🐙 GitHub: [@Jlpineda12](https://github.com/Jlpineda12)
* ✉️ Contacto: [joseluispinead177@gmail.com](mailto:joseluispinead177@gmail.com)
