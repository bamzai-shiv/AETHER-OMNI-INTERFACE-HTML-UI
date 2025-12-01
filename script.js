// --- 1. CANVAS BACKGROUND (PARTICLE NETWORK) ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(0, 242, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animateBg() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
        // Connect nearby particles
        particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                ctx.strokeStyle = `rgba(0, 242, 255, ${0.1 - dist/1500})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(animateBg);
}
animateBg();


// --- 2. BOOT SEQUENCE ---
const bootScreen = document.getElementById('boot-screen');
const bootLog = document.getElementById('boot-log');
const barFill = document.querySelector('.bar-fill');
const app = document.getElementById('app');

const logs = [
    "Loading kernel modules...",
    "Mounting file systems...",
    "Connecting to satellite link...",
    "Decrypting user environment...",
    "Access granted."
];

let logIndex = 0;
let progress = 0;

const bootInterval = setInterval(() => {
    if (logIndex < logs.length) {
        const p = document.createElement('p');
        p.innerText = `> ${logs[logIndex]}`;
        bootLog.appendChild(p);
        bootLog.scrollTop = bootLog.scrollHeight;
        logIndex++;
    }
    
    progress += 20;
    barFill.style.width = `${progress}%`;

    if (progress >= 100) {
        clearInterval(bootInterval);
        setTimeout(() => {
            bootScreen.style.opacity = '0';
            setTimeout(() => {
                bootScreen.style.display = 'none';
                app.style.opacity = '1';
                initChart(); // Start chart only after boot
            }, 1000);
        }, 500);
    }
}, 400);


// --- 3. MAIN CHART (Chart.js) ---
function initChart() {
    const ctxChart = document.getElementById('mainChart').getContext('2d');
    
    // Neon Gradient
    const gradient = ctxChart.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 242, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');

    const mainChart = new Chart(ctxChart, {
        type: 'line',
        data: {
            labels: ['00s', '10s', '20s', '30s', '40s', '50s', '60s'],
            datasets: [{
                label: 'CPU Usage',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: '#00f2ff',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#000',
                pointBorderColor: '#00f2ff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
            }
        }
    });
}


// --- 4. CLOCK ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('en-GB');
}
setInterval(updateClock, 1000);
updateClock();


// --- 5. INTERACTIVE TERMINAL ---
const termInput = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

termInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const cmd = this.value.trim().toLowerCase();
        if(cmd) {
            printLine(`admin@aether:~$ ${cmd}`, 'command-msg');
            processCommand(cmd);
        }
        this.value = '';
        // Auto scroll to bottom
        termOutput.scrollTop = termOutput.scrollHeight;
    }
});

function printLine(text, className = '') {
    const div = document.createElement('div');
    div.className = `line ${className}`;
    div.innerText = text;
    termOutput.appendChild(div);
}

function processCommand(cmd) {
    switch(cmd) {
        case 'help':
            printLine('AVAILABLE COMMANDS:', 'system-msg');
            printLine('- scan : Run system diagnostic');
            printLine('- clear : Clear terminal');
            printLine('- date : Show system date');
            printLine('- reboot : Reload system');
            break;
        case 'clear':
            termOutput.innerHTML = '';
            break;
        case 'date':
            printLine(new Date().toString(), 'success-msg');
            break;
        case 'scan':
            printLine('Scanning...', 'system-msg');
            setTimeout(() => printLine('No threats detected. Secure.', 'success-msg'), 1000);
            break;
        case 'reboot':
            location.reload();
            break;
        default:
            printLine(`Command not found: ${cmd}`, 'error-msg');
    }
}
