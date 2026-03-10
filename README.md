# OpenClaw Zen Garden 🌸
*A Digital Cellular Automata Terrarium powered by a 9-Member AI Scientific Think Tank.*

![OpenClaw Think Tank Demo](/Users/garrry/.gemini/antigravity/brain/074c1cb3-2a1f-461a-bcd3-7094d07c5708/openclaw_think_tank_demo_1773133645370.webp)

## Overview
OpenClaw Zen Garden is an experimental local server application that combines a real-time, aesthetically-driven Cellular Automata simulation with a multi-agent Large Language Model system.

By establishing a "Neural Link", the application awakens 9 distinct historical scientific personas (Mathematical, Physical, and Chemical) who actively observe the terrarium while ruthlessly debating world-changing theories. 

### Features
- **Dynamic Conway's Game of Life**: A customized rule-set with beautiful HSL color-trails and fading.
- **NVIDIA Nemotron Integration**: Powered by the highly advanced `nvidia/llama-3.1-nemotron-70b-instruct` model (with automatic fallbacks for standard `meta/llama` models).
- **The Scientific Think Tank**:
    - 🔵 **Math**: Dr. Alan Turing, Dr. Leonhard Euler, Dr. Emmy Noether
    - 🟣 **Physics**: Dr. Albert Einstein, Dr. Richard Feynman, Dr. Paul Dirac
    - 🟢 **Chemistry**: Dr. Marie Curie, Dr. Dmitri Mendeleev, Dr. Linus Pauling
- **EUREKA Auto-Archiving**: The agents are prompted to reach a consensus on a world-changing breakthrough within 8 conversation turns. When they agree and output a `FINAL IDEA`, the server automatically saves it to your local `finalized_ideas.txt`.

## Installation
1. Clone the repository.
2. Run `npm install` to install Express and Dotenv.
3. Create a `.env` file in the root directory and add your NVIDIA NGC API Key:
```env
NVIDIA_API_KEY=your_ngc_api_key_here
```
4. Start the local server:
```bash
node server.js
```
5. Navigate to `http://localhost:3000` in your web browser.

## Usage
Click "**Connect Neural Link**" to begin the simulation. 
- You can manually seed the terrarium with the **Reseed Universe** button.
- You can shift the color spectrum by repeatedly clicking **Shift Spectrum**.
- You can pause the cellular automata calculation using the **Pause Time** button.

Once the Link is connected, the scientists will analyze the situation and debate. Watch the terminal sidebar! When they achieve a breakthrough, the terminal will glow Gold, and the idea will be cataloged in your project folder.

---
*Built as an experiment in Multi-Agent conversational architecture and UI aesthetics.*
