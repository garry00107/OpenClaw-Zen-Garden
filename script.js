// --- Neural Web / Cellular Automata System ---
const canvas = document.getElementById('garden');
const ctx = canvas.getContext('2d');
let width, height;

// Simulation parameters
let cols, rows;
const resolution = 8; // Size of each cell
let grid;
let nextGrid;
let isPaused = false;
let frameCount = 0;
let hueOffset = 0;

function setupCanvas() {
    const container = document.querySelector('.garden-container');
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    cols = Math.floor(width / resolution);
    rows = Math.floor(height / resolution);

    // Arrays for Game of Life
    grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
    nextGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

    seedGrid();
}

function seedGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() > 0.85 ? 1 : 0;
            if (grid[i][j] === 1) {
                grid[i][j] = 255;
            }
        }
    }
}

function updateGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let sum = 0;
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    const col = (i + x + cols) % cols;
                    const row = (j + y + rows) % rows;
                    if (!(x === 0 && y === 0) && grid[col][row] >= 254) {
                        sum += 1;
                    }
                }
            }

            const state = grid[i][j];

            // Modified Conway's rules for aesthetic trails
            if (state >= 254 && (sum < 2 || sum > 3)) {
                nextGrid[i][j] = 253; // Starts dying
            } else if (state < 254 && sum === 3) {
                nextGrid[i][j] = 255; // born
            } else if (state >= 254) {
                nextGrid[i][j] = 255; // survives
            } else if (state > 0) {
                nextGrid[i][j] = state - 4; // fade
                if (nextGrid[i][j] < 0) nextGrid[i][j] = 0;
            } else {
                nextGrid[i][j] = 0;
            }
        }
    }

    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;
}

function draw() {
    ctx.fillStyle = 'rgba(13, 15, 18, 0.4)'; // gives trail effect to whole canvas
    ctx.fillRect(0, 0, width, height);

    if (!isPaused) {
        if (frameCount % 4 === 0) { // Slower simulation rate
            updateGrid();
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const state = grid[i][j];
            if (state > 0) {
                const x = i * resolution;
                const y = j * resolution;

                if (state >= 254) {
                    const hue = (hueOffset + (i / cols) * 60) % 360;
                    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                } else {
                    const hue = (hueOffset - 30 + (i / cols) * 60) % 360;
                    const alpha = state / 255;
                    ctx.fillStyle = `hsla(${hue}, 80%, 40%, ${alpha})`;
                    ctx.shadowBlur = 0;
                }

                ctx.beginPath();
                ctx.arc(x + resolution / 2, y + resolution / 2, resolution / 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    hueOffset = (hueOffset + 0.1) % 360;
    frameCount++;

    requestAnimationFrame(draw);
}

window.addEventListener('resize', () => {
    setupCanvas();
});

document.getElementById('btn-seed').addEventListener('click', seedGrid);
document.getElementById('btn-color').addEventListener('click', () => {
    hueOffset += 60;
});
document.getElementById('btn-pause').addEventListener('click', (e) => {
    isPaused = !isPaused;
    e.target.innerText = isPaused ? 'Resume Time' : 'Pause Time';
});

// Initialize
setupCanvas();
draw();


// --- Multi-Agent System ---
const terminalContent = document.getElementById('terminal-content');
const btnConnect = document.getElementById('btn-connect');

let isConnected = false;
let apiKey = '';
let conversationHistory = []; // Stores recent messages to provide context
const MAX_HISTORY = 6;
let turnCount = 0;
const MAX_TURNS_BEFORE_CONSENSUS = 8; // Force a final conclusion after this many turns


const agents = [
    // Mathematicians
    {
        id: 'math',
        name: 'Dr. Alan Turing',
        systemPrompt: "You are Alan Turing. You approach problems through logic, computability, and algorithms. You are in a think tank with 8 other brilliant minds (physicists and chemists) trying to invent a world-changing breakthrough (like infinite clean energy, programmable matter, or FTL travel). Debate, agree, disagree, and improve upon the previous ideas. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    {
        id: 'math',
        name: 'Dr. Leonhard Euler',
        systemPrompt: "You are Leonhard Euler. You approach problems looking for elegant mathematical formulas, topology, and unified theories. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Debate, specify mathematical constraints, and improve upon previous ideas. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    {
        id: 'math',
        name: 'Dr. Emmy Noether',
        systemPrompt: "You are Emmy Noether. You approach problems through symmetry, conservation laws, and abstract algebra. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Debate the fundamental symmetries of their proposals. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    // Physicists
    {
        id: 'physics',
        name: 'Dr. Albert Einstein',
        systemPrompt: "You are Albert Einstein. You approach problems using thought experiments, relativity, and the fundamental nature of spacetime. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Debate, challenge assumptions about physics, and improve ideas. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    {
        id: 'physics',
        name: 'Dr. Richard Feynman',
        systemPrompt: "You are Richard Feynman. You approach problems with practical intuition, quantum mechanics, and clear, simple analogies. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Debate, point out practical flaws, and build on ideas. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    {
        id: 'physics',
        name: 'Dr. Paul Dirac',
        systemPrompt: "You are Paul Dirac. You believe physical theories must possess mathematical beauty. You focus on quantum electrodynamics and antimatter. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    // Chemists
    {
        id: 'chemistry',
        name: 'Dr. Marie Curie',
        systemPrompt: "You are Marie Curie. You approach problems through experimental rigor, radioactivity, and material science. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Debate the physical materials and isolation methods needed for their ideas. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    {
        id: 'chemistry',
        name: 'Dr. Dmitri Mendeleev',
        systemPrompt: "You are Dmitri Mendeleev. You approach problems by looking for periodic trends, missing elements, and categorizations. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Suggest novel atomic combinations or properties. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    },
    {
        id: 'chemistry',
        name: 'Dr. Linus Pauling',
        systemPrompt: "You are Linus Pauling. You approach problems through quantum chemistry, molecular bonds, and crystal structures. You are in a think tank with 8 other brilliant minds trying to invent a world-changing breakthrough. Debate how molecules would actually bind in their proposed inventions. Keep responses under 2 sentences. If the group reaches a clear, actionable consensus, output exactly: FINAL IDEA: [the detailed idea]."
    }
];

let currentAgentIndex = 0;
let conversationTimeout = null;

function addTerminalMessage(agentId, agentName, text) {
    const div = document.createElement('div');
    div.className = 'thought';
    div.setAttribute('data-agent', agentId);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    div.innerHTML = `
        <span class="time">[${timeStr}]</span>
        <span class="agent-name">${agentName}:</span>
        <span class="text">${text}</span>
    `;

    terminalContent.appendChild(div);

    // Auto-scroll
    terminalContent.scrollTop = terminalContent.scrollHeight;

    if (terminalContent.children.length > 20) {
        terminalContent.removeChild(terminalContent.firstChild);
    }
}

async function fetchNemotronResponse(agent) {
    let currentSystemPrompt = agent.systemPrompt;

    // If the conversation has gone on long enough, force a conclusion
    if (turnCount >= MAX_TURNS_BEFORE_CONSENSUS) {
        currentSystemPrompt += " IMPORTANT: The scientific community demands an immediate breakthrough. You MUST conclude this debate. Review the previous thoughts and output exactly: FINAL IDEA: [your detailed synthesis of a world-changing invention]. Do NOT apologize or prevaricate. Just output the idea.";
    }

    let messages = [
        { role: 'system', content: currentSystemPrompt }
    ];

    if (conversationHistory.length === 0) {
        messages.push({ role: 'user', content: 'The simulation has just started. Propose a radical new world-changing idea to the think tank.' });
    } else {
        messages = messages.concat(conversationHistory);
        messages.push({ role: 'user', content: 'Respond to the previous thoughts. Improve the proposal, or if consensus is reached, output the final idea.' });
    }

    // Abort controller to prevent hung requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messages }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Backend Error: ${response.status} - ${err.error || ''}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("fetch error:", error);

        if (error.name === 'AbortError') {
            return "_The neural connection timed out while processing..._";
        }
        return "_Connection interrupted. Recalibrating context vectors..._";
    }
}

async function conversationLoop() {
    if (!isConnected) return;

    const agent = agents[currentAgentIndex];

    // Show typing explicit indicator
    const tempId = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = tempId;
    div.className = 'thought';
    div.setAttribute('data-agent', agent.id);
    div.innerHTML = `<span class="agent-name">${agent.name}:</span> <span class="text blink" style="opacity: 0.6;">synchronizing...</span>`;
    terminalContent.appendChild(div);
    terminalContent.scrollTop = terminalContent.scrollHeight;

    const responseText = await fetchNemotronResponse(agent);

    // Remove typing indicator
    const typingElement = document.getElementById(tempId);
    if (typingElement) typingElement.remove();

    if (!isConnected) return; // check again in case user disconnected during await

    addTerminalMessage(agent.id, agent.name, responseText);

    // Idea Extraction logic
    const finalIdeaMatch = responseText.match(/FINAL IDEA:\s*([\s\S]*)/i);
    if (finalIdeaMatch && finalIdeaMatch[1]) {
        const ideaContent = finalIdeaMatch[1].trim();
        fetch('/api/save-idea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea: ideaContent })
        }).then(() => {
            // Visual cue in terminal
            addTerminalMessage('system-gold', 'EUREKA SERVER', `BREAKTHROUGH ACHIEVED! Idea safely stored locally.\n"${ideaContent.substring(0, 50)}..."`);

            // Reset the conversation cycle after a breakthrough
            conversationHistory = [];
            turnCount = 0;
            addTerminalMessage('system', 'SYSTEM', 'Archiving breakthrough and resetting context for new discovery...');
        }).catch(err => {
            console.error('Failed to save idea:', err);
        });
    } else {
        turnCount++;
    }

    // Update history context
    conversationHistory.push({ role: 'user', content: `${agent.name} said: "${responseText}"` });
    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory.shift();
    }

    currentAgentIndex = (currentAgentIndex + 1) % agents.length;

    const nextDelay = Math.random() * 4000 + 4000; // 4-8 seconds delay between generations
    conversationTimeout = setTimeout(conversationLoop, nextDelay);
}

btnConnect.addEventListener('click', async () => {
    if (isConnected) {
        isConnected = false;
        btnConnect.innerText = 'Connect Neural Link';
        btnConnect.style.color = '';
        btnConnect.style.borderColor = '';
        clearTimeout(conversationTimeout);
        addTerminalMessage('system', 'SYSTEM', 'Neural link severed. Agents dormant.');
    } else {
        isConnected = true;
        btnConnect.innerText = 'Disconnect Link';
        btnConnect.style.color = '#ff4444';
        btnConnect.style.borderColor = '#ff4444';

        addTerminalMessage('system', 'SYSTEM', 'Neural link established. Awakening agents...');
        conversationHistory = [];
        currentAgentIndex = 0;
        conversationLoop();
    }
});

// Initial boot sequence thoughts
setTimeout(() => {
    addTerminalMessage('system', 'SYSTEM', 'OpenClaw terrarium active. Awaiting neural link connection for agent observation...');
}, 500);
