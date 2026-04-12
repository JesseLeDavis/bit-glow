// BitGlow — script.js

// ============================================================================
// Utils
// ============================================================================

const isMobile = window.innerWidth < 768;

// ============================================================================
// Interactive Dot Grid Background
// ============================================================================

(function initDotGrid() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const spacing = 32;
    const baseRadius = 1;
    const glowRadius = 150;       // how close the mouse needs to be
    const baseColor = [255, 107, 53];
    const baseAlpha = 0.1;
    const glowAlpha = 0.35;

    let mouseX = -9999;
    let mouseY = -9999;
    let cols, rows;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.ceil(canvas.width / spacing) + 1;
        rows = Math.ceil(canvas.height / spacing) + 1;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
        mouseX = -9999;
        mouseY = -9999;
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * spacing + 1;
                const y = r * spacing + 1;
                const dist = Math.hypot(mouseX - x, mouseY - y);
                const t = Math.max(0, 1 - dist / glowRadius);
                const alpha = baseAlpha + (glowAlpha - baseAlpha) * t;
                const radius = baseRadius + t * 0.5;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${alpha})`;
                ctx.fill();
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ============================================================================
// Logo
// ============================================================================

const logo = document.getElementById('main-logo');

if (logo) {
    logo.addEventListener('click', function () {
        const cube = this.querySelector('.cube');
        if (!cube) return;
        // Kick the spin speed up briefly on click
        cube.style.animationDuration = '1.5s';
        setTimeout(() => { cube.style.animationDuration = '12s'; }, 1500);
    });
}

// ============================================================================
// Typing Animation (desktop only — static tagline on mobile)
// ============================================================================

const typingEl = document.getElementById('header-typing');

if (typingEl) {
    if (isMobile) {
        // Static on mobile — no animation delay, no content jump
        typingEl.textContent = '> web apps. mobile apps. real solutions.';
    } else {
        const messages = [
            '> Initializing BitGlow...',
            '> web apps. mobile apps. real solutions.',
            '> Based in Salem, OR — building remotely.',
            '> Ready to start your project? Scroll down.'
        ];

        let msgIndex = 0;
        let charIndex = 0;
        let deleting = false;
        let speed = 80;

        function typeWriter() {
            const current = messages[msgIndex];

            if (!deleting) {
                typingEl.textContent = current.substring(0, charIndex);
                charIndex++;
                if (charIndex > current.length) {
                    deleting = true;
                    speed = 2500;
                } else {
                    speed = 80;
                }
            } else {
                typingEl.textContent = current.substring(0, charIndex);
                charIndex--;
                if (charIndex === 0) {
                    deleting = false;
                    msgIndex = (msgIndex + 1) % messages.length;
                    speed = 400;
                } else {
                    speed = 40;
                }
            }

            setTimeout(typeWriter, speed);
        }

        setTimeout(typeWriter, 800);
    }
}

// ============================================================================
// Smooth Scrolling
// ============================================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================================
// Section Scroll-in + Active Nav
// ============================================================================

const sections = document.querySelectorAll('.terminal-section');
const navLinks = document.querySelectorAll('.nav-menu a');

// Track which sections are currently visible
const visibleSections = new Set();

function updateActiveNav() {
    if (visibleSections.size === 0) return;

    // Pick the section closest to the top of the viewport
    let topmost = null;
    let topmostY = Infinity;

    visibleSections.forEach(section => {
        const y = section.getBoundingClientRect().top;
        if (y < topmostY) {
            topmostY = y;
            topmost = section;
        }
    });

    if (topmost) {
        const id = topmost.getAttribute('id');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    }
}

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            visibleSections.add(entry.target);
        } else {
            visibleSections.delete(entry.target);
        }
    });
    updateActiveNav();
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

sections.forEach((section, index) => {
    if (index === 0) {
        section.classList.add('visible');
        visibleSections.add(section);
    }
    sectionObserver.observe(section);
});

// ============================================================================
// Nav command echo (console only — keeps the easter egg without UI clutter)
// ============================================================================

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function () {
        const command = this.getAttribute('data-command');
        if (command) console.log(`%c$ ${command}`, 'color: #ff6b35;');
    });
});

// ============================================================================
// Contact Form — PHP backend (contact.php on Hostinger)
// ============================================================================

const contactForm = document.getElementById('contact-form');
const formStatus = document.querySelector('.form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            const response = await fetch('/contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Message received. I\'ll be in touch within one business day — usually sooner. — Jesse';
                formStatus.style.display = 'block';
                contactForm.reset();
                setTimeout(() => { formStatus.style.display = 'none'; }, 8000);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Something went wrong. Please email hello@bitglow.tech directly.';
            formStatus.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

// ============================================================================
// Scheduling Modal
// ============================================================================

const SCHEDULE_API = '/api/schedule.php'; // PHP backend on Hostinger

(function initScheduleModal() {
    const trigger = document.getElementById('schedule-trigger');
    const modal = document.getElementById('schedule-modal');
    if (!trigger || !modal) return;

    const backdrop = modal.querySelector('.schedule-backdrop');
    const closeBtn = modal.querySelector('.schedule-close');
    const step1 = document.getElementById('schedule-step-1');
    const step2 = document.getElementById('schedule-step-2');
    const step3 = document.getElementById('schedule-step-3');
    const dots = modal.querySelectorAll('.step-dot');
    const calDays = modal.querySelector('.cal-days');
    const calMonthYear = modal.querySelector('.cal-month-year');
    const calPrev = modal.querySelector('.cal-prev');
    const calNext = modal.querySelector('.cal-next');
    const slotsContainer = modal.querySelector('.schedule-slots');
    const selectedDateEl = modal.querySelector('.schedule-selected-date');
    const summaryEl = modal.querySelector('.schedule-summary');
    const schedForm = document.getElementById('schedule-form');
    const statusEl = modal.querySelector('.schedule-status');
    const backToCalBtn = modal.querySelector('.schedule-back');
    const backToSlotsBtn = modal.querySelector('.schedule-back-to-slots');

    let currentMonth, currentYear;
    let availableDates = [];
    let selectedDate = null;
    let selectedSlot = null;

    // ── Open / Close ──

    let previouslyFocused = null;

    function openModal() {
        previouslyFocused = document.activeElement;
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => modal.classList.add('visible'));
        });
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
        showStep(1);
        loadMonth();
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
            resetModal();
        }, 300);
        if (previouslyFocused) previouslyFocused.focus();
    }

    // Focus trap — keep Tab cycling within the modal
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = modal.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    function resetModal() {
        selectedDate = null;
        selectedSlot = null;
        showStep(1);
        statusEl.style.display = 'none';
        schedForm.reset();
    }

    trigger.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });

    // ── Step navigation ──

    function showStep(n) {
        step1.style.display = n === 1 ? 'block' : 'none';
        step2.style.display = n === 2 ? 'block' : 'none';
        step3.style.display = n === 3 ? 'block' : 'none';
        dots.forEach(d => {
            const isActive = Number(d.dataset.step) === n;
            d.classList.toggle('active', isActive);
            if (isActive) d.setAttribute('aria-current', 'step');
            else d.removeAttribute('aria-current');
        });
    }

    backToCalBtn.addEventListener('click', () => showStep(1));
    backToSlotsBtn.addEventListener('click', () => showStep(2));

    // ── Calendar ──

    async function loadMonth() {
        const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        calMonthYear.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        try {
            const resp = await fetch(`${SCHEDULE_API}?action=available-dates&month=${monthStr}`);
            const data = await resp.json();
            availableDates = data.dates || [];
        } catch {
            availableDates = [];
        }

        renderCalendar();
    }

    function renderCalendar() {
        calDays.innerHTML = '';
        const firstDay = new Date(currentYear, currentMonth, 1);
        let startDow = firstDay.getDay(); // 0=Sun
        startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

        // Empty cells before first day
        for (let i = 0; i < startDow; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day';
            calDays.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const btn = document.createElement('button');
            btn.className = 'cal-day';
            btn.textContent = d;

            if (dateStr === todayStr) btn.classList.add('today');

            if (availableDates.includes(dateStr)) {
                btn.classList.add('available');
                btn.addEventListener('click', () => selectDate(dateStr));
            }

            calDays.appendChild(btn);
        }
    }

    calPrev.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        loadMonth();
    });

    calNext.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        loadMonth();
    });

    // ── Date selection → load slots ──

    async function selectDate(dateStr) {
        selectedDate = dateStr;
        const dateObj = new Date(dateStr + 'T12:00:00');
        const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        selectedDateEl.textContent = `— ${formatted}`;

        showStep(2);
        slotsContainer.innerHTML = '<div class="schedule-slots-loading">Loading available times...</div>';

        try {
            const resp = await fetch(`${SCHEDULE_API}?action=slots&date=${dateStr}`);
            const data = await resp.json();
            renderSlots(data.slots || []);
        } catch {
            slotsContainer.innerHTML = '<div class="schedule-slots-loading">Failed to load times. Try again.</div>';
        }
    }

    function formatTime12(time24) {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    function renderSlots(slots) {
        slotsContainer.innerHTML = '';
        if (slots.length === 0) {
            slotsContainer.innerHTML = '<div class="schedule-slots-loading">No slots available for this date.</div>';
            return;
        }

        slots.forEach(slot => {
            const btn = document.createElement('button');
            btn.className = 'slot-btn';
            btn.textContent = `${formatTime12(slot.start)} – ${formatTime12(slot.end)}`;
            btn.addEventListener('click', () => selectSlot(slot));
            slotsContainer.appendChild(btn);
        });
    }

    // ── Slot selection → confirmation ──

    function selectSlot(slot) {
        selectedSlot = slot;
        const dateObj = new Date(selectedDate + 'T12:00:00');
        const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        summaryEl.innerHTML = `
            <div><span class="summary-label">Date:</span> ${formatted}</div>
            <div><span class="summary-label">Time:</span> ${formatTime12(slot.start)} – ${formatTime12(slot.end)} PT</div>
            <div><span class="summary-label">Duration:</span> 30 minutes</div>
        `;
        statusEl.style.display = 'none';
        showStep(3);
    }

    // ── Booking submission ──

    schedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = schedForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        statusEl.style.display = 'none';

        const formData = new FormData(schedForm);

        try {
            const resp = await fetch(`${SCHEDULE_API}?action=book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    date: selectedDate,
                    start_time: selectedSlot.start
                })
            });

            const result = await resp.json();

            if (result.success) {
                statusEl.className = 'schedule-status success';
                statusEl.textContent = 'Booked! You\'ll receive a confirmation email shortly. Talk soon. — Jesse';
                statusEl.style.display = 'block';
                schedForm.style.display = 'none';
            } else {
                throw new Error(result.error || 'Booking failed');
            }
        } catch (error) {
            statusEl.className = 'schedule-status error';
            statusEl.textContent = error.message || 'Something went wrong. Please try again or email hello@bitglow.tech.';
            statusEl.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
})();

// ============================================================================
// Easter egg — Konami code
// ============================================================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiSequence.join('')) {
        triggerBootSequence();
    }
});

function triggerBootSequence() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: #080a0f;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
        font-size: 0.85rem;
        color: #e6edf3;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Matrix rain canvas — sits behind the terminal box
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.18;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const cols = Math.floor(canvas.width / 18);
    const drops = Array(cols).fill(0);
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';

    const matrixInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(8, 10, 15, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff6b35';
        ctx.font = '13px monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * 18, drops[i] * 18);
            if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 45);

    const terminal = document.createElement('div');
    terminal.style.cssText = `
        position: relative;
        z-index: 1;
        width: min(640px, 90vw);
        padding: 2rem;
        border: 1px solid rgba(255, 107, 53, 0.4);
        border-radius: 8px;
        background: rgba(13, 17, 23, 0.92);
        backdrop-filter: blur(4px);
        line-height: 2;
    `;

    overlay.appendChild(terminal);
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    });

    const lines = [
        { text: 'BITGLOW BIOS v2.6.0',           color: '#ff6b35', delay: 0,    bold: true },
        { text: '--------------------------------', color: '#484f58', delay: 200  },
        { text: 'Initializing kernel...',          color: '#7d8590', delay: 500  },
        { text: 'Loading development modules...',  color: '#7d8590', delay: 900  },
        { text: 'Mounting /services/web         [ OK ]', color: '#3fb950', delay: 1300 },
        { text: 'Mounting /services/mobile      [ OK ]', color: '#3fb950', delay: 1550 },
        { text: 'Mounting /services/custom      [ OK ]', color: '#3fb950', delay: 1800 },
        { text: 'Checking system integrity...', color: '#7d8590', delay: 2100 },
        { text: 'Verifying coffee supply...     [ OK ]', color: '#3fb950', delay: 2400 },
        { text: '--------------------------------', color: '#484f58', delay: 2700 },
        { text: 'All systems operational.', color: '#ff6b35', delay: 3000, bold: true },
        { text: 'Welcome back. Now go build something.', color: '#00e5cc', delay: 3400 },
    ];

    lines.forEach(({ text, color, delay, bold }) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.textContent = text;
            line.style.color = color;
            if (bold) line.style.fontWeight = '700';
            terminal.appendChild(line);
        }, delay);
    });

    // Fade out and remove
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            clearInterval(matrixInterval);
            overlay.remove();
        }, 400);
    }, 7000);

    console.log('%c KONAMI CODE ACCEPTED ', 'background: #ff6b35; color: #000; font-weight: bold;');
}

// ============================================================================
// Console welcome
// ============================================================================

window.addEventListener('load', () => {
    console.log('%c BitGlow ', 'background: #ff6b35; color: #000; font-size: 16px; font-weight: bold; padding: 4px 8px;');
    console.log('%c hello@bitglow.dev ', 'color: #00e5cc; font-size: 12px;');
});
