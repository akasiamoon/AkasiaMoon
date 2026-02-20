// --- TAB NAVIGATION LOGIC ---
const btns = {
    sanctuary: document.getElementById('btn-sanctuary'),
    recipes: document.getElementById('btn-recipes'),
    custom: document.getElementById('btn-custom')
};

const sections = {
    sanctuary: document.getElementById('sanctuary-section'),
    recipes: document.getElementById('recipes-section'),
    custom: document.getElementById('custom-section')
};

function switchTab(tabName) {
    // 1. Remove 'active' class from all sections & buttons
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    Object.values(btns).forEach(btn => btn.classList.remove('active-tab'));

    // 2. Add 'active' class to the clicked target
    sections[tabName].classList.add('active');
    btns[tabName].classList.add('active-tab');
}

// Event Listeners for Nav Buttons
btns.sanctuary.addEventListener('click', () => switchTab('sanctuary'));
btns.recipes.addEventListener('click', () => switchTab('recipes'));
btns.custom.addEventListener('click', () => switchTab('custom'));

// Set default active tab style
btns.sanctuary.classList.add('active-tab');


// --- REACTIVE MAGIC PARTICLE ENGINE ---
const canvas = document.getElementById('magicOverlay');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    
    // --- 3D TILT EFFECT ON ACTIVE CARD ---
    const activeCard = document.querySelector('.card.active');
    if (activeCard) {
        let xAxis = (window.innerWidth / 2 - event.pageX) / 40;
        let yAxis = (window.innerHeight / 2 - event.pageY) / 40;
        activeCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});

// Reset tilt when mouse leaves screen
document.addEventListener('mouseleave', () => {
    const activeCard = document.querySelector('.card.active');
    if (activeCard) activeCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
    }
    
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < mouse.radius + this.size){
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 2;
            if (mouse.x > this.x && this.x > this.size * 10) this.x -= 2;
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 2;
            if (mouse.y > this.y && this.y > this.size * 10) this.y -= 2;
        }
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

let particlesArray = [];
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 2) - 1;
        let directionY = (Math.random() * 2) - 1;
        let color = Math.random() > 0.5 ? '#00ffff' : '#ff00aa'; 
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                           ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width/7) * (canvas.height/7)) {
                opacityValue = 1 - (distance/20000);
                ctx.strokeStyle = `rgba(139, 0, 255, ${opacityValue})`; 
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

init();
animate();
