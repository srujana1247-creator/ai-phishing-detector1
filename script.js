// PhishGuard Pro — Frontend Logic
// Connects to the Node.js backend at /api/scan

async function startAnalysis() {
    const input = document.getElementById('main-input').value.trim();

    if (!input) {
        alert('Please enter a URL to analyze.');
        return;
    }

    // Show loading state
    setState('loading');

    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: input })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        renderResult(data);

    } catch (err) {
        console.error('Scan failed:', err);
        renderError(err.message);
    }
}

function setState(state) {
    document.getElementById('idle-state').classList.add('hidden');
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('data-state').classList.add('hidden');

    if (state === 'loading') {
        document.getElementById('loading-state').classList.remove('hidden');
    } else if (state === 'data') {
        document.getElementById('data-state').classList.remove('hidden');
    } else {
        document.getElementById('idle-state').classList.remove('hidden');
    }
}

function renderResult(data) {
    setState('data');

    const score = data.score || 0;
    const severity = data.severity || 'emerald';

    // Color maps
    const colorMap = {
        rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    bar: 'bg-rose-500' },
        amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   bar: 'bg-amber-500' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' }
    };
    const colors = colorMap[severity] || colorMap['emerald'];

    // Status badge
    const statusEl = document.getElementById('res-status');
    statusEl.textContent = data.label || data.status;
    statusEl.className = `text-[10px] font-black px-3 py-1 rounded-full uppercase ${colors.bg} ${colors.text}`;

    // Score
    document.getElementById('res-score').textContent = `${score}%`;

    // Progress bar
    const bar = document.getElementById('res-bar');
    bar.className = `h-full transition-all duration-1000 ${colors.bar}`;
    setTimeout(() => { bar.style.width = `${score}%`; }, 50);

    // Icon
    const iconMap = { rose: 'skull', amber: 'alert-triangle', emerald: 'shield-check' };
    const iconEl = document.getElementById('res-icon');
    iconEl.className = `p-4 rounded-2xl ${colors.bg}`;
    iconEl.innerHTML = `<i data-lucide="${iconMap[severity] || 'shield'}" class="${colors.text} w-8 h-8"></i>`;

    // Reasons list
    const reasonsList = document.getElementById('res-reasons');
    reasonsList.innerHTML = '';
    (data.reasons || []).forEach(reason => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.innerHTML = `<i data-lucide="chevron-right" class="w-4 h-4 mt-0.5 ${colors.text} flex-shrink-0"></i><span>${reason}</span>`;
        reasonsList.appendChild(li);
    });

    // Re-initialize Lucide icons for the newly added elements
    if (window.lucide) lucide.createIcons();
}

function renderError(message) {
    setState('data');

    document.getElementById('res-status').textContent = 'ERROR';
    document.getElementById('res-status').className = 'text-[10px] font-black px-3 py-1 rounded-full uppercase bg-red-500/10 text-red-400';
    document.getElementById('res-score').textContent = '—';
    document.getElementById('res-icon').innerHTML = '<i data-lucide="x-circle" class="text-red-400 w-8 h-8"></i>';
    document.getElementById('res-bar').style.width = '0%';

    const reasonsList = document.getElementById('res-reasons');
    reasonsList.innerHTML = `<li class="text-red-400 text-sm">${message}</li>`;

    if (window.lucide) lucide.createIcons();
}

// Initialize Lucide icons on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
});
