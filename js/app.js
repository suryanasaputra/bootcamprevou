// Expense Tracker - Vanilla JavaScript
(function () {

    // ── State ────────────────────────────────────────────────────────────────
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let categories = JSON.parse(localStorage.getItem('categories') || '["Food","Transport","Fun"]');
    let spendLimit = parseFloat(localStorage.getItem('spendLimit')) || 0;
    let filterMonth = localStorage.getItem('filterMonth') || '';
    let sortMode = 'date-desc';
    let chart = null;

    // Palette — built-ins + auto-generated for custom cats
    const BASE_COLORS = { Food: '#f59e0b', Transport: '#10b981', Fun: '#ec4899' };
    const EXTRA_PALETTE = ['#6366f1', '#0ea5e9', '#14b8a6', '#f43f5e', '#a855f7', '#84cc16', '#fb923c'];

    function colorFor(cat) {
        if (BASE_COLORS[cat]) return BASE_COLORS[cat];
        const idx = categories.indexOf(cat);
        return EXTRA_PALETTE[(idx - 3) % EXTRA_PALETTE.length] || '#94a3b8';
    }

    function formatRp(num) {
        return 'Rp ' + Number(num).toLocaleString('id-ID');
    }

    // ── Persist ──────────────────────────────────────────────────────────────
    function save() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('spendLimit', spendLimit);
        localStorage.setItem('filterMonth', filterMonth);
    }

    // ── Category dropdown ────────────────────────────────────────────────────
    function renderCategorySelect() {
        const sel = document.getElementById('category');
        const current = sel.value;
        sel.innerHTML = '<option value="">-- Select --</option>';
        categories.forEach(function (c) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            if (c === current) opt.selected = true;
            sel.appendChild(opt);
        });
    }

    // ── Filtered + sorted list ───────────────────────────────────────────────
    function getVisible() {
        let list = transactions.slice();

        if (filterMonth) {
            list = list.filter(t => (t.month || '') === filterMonth);
        }

        switch (sortMode) {
            case 'date-asc': list.sort((a, b) => a.id - b.id); break;
            case 'date-desc': list.sort((a, b) => b.id - a.id); break;
            case 'amount-asc': list.sort((a, b) => a.amount - b.amount); break;
            case 'amount-desc': list.sort((a, b) => b.amount - a.amount); break;
            case 'category': list.sort((a, b) => a.category.localeCompare(b.category)); break;
        }
        return list;
    }

    // ── Balance ──────────────────────────────────────────────────────────────
    function updateBalance() {
        const visible = getVisible();
        const total = visible.reduce((s, t) => s + t.amount, 0);
        document.getElementById('total-balance').textContent = formatRp(total);

        const warning = document.getElementById('limit-warning');
        if (spendLimit > 0 && total > spendLimit) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }
    }

    // ── Transaction list ─────────────────────────────────────────────────────
    function renderList() {
        const list = document.getElementById('transaction-list');
        list.innerHTML = '';
        const visible = getVisible();

        if (visible.length === 0) {
            list.innerHTML = '<li class="empty-msg">No transactions yet.</li>';
            return;
        }

        const overLimit = spendLimit > 0;
        let running = 0;

        visible.forEach(function (t) {
            running += t.amount;
            const exceeded = overLimit && running > spendLimit;

            const li = document.createElement('li');
            li.className = 'item' + (exceeded ? ' over-limit' : '');
            li.style.setProperty('--cat-color', colorFor(t.category));
            li.innerHTML = `
                <div class="info">
                    <div class="name">${t.name}</div>
                    <div class="meta">${t.category}${t.month ? ' · ' + t.month : ''}</div>
                </div>
                <div class="right">
                    <span class="amount ${exceeded ? 'over' : ''}">${formatRp(t.amount)}</span>
                    <button class="delete-btn" data-id="${t.id}">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    // ── Monthly summary ──────────────────────────────────────────────────────
    function renderSummary() {
        const box = document.getElementById('monthly-summary');
        const content = document.getElementById('summary-content');

        if (!filterMonth) {
            // Show all months grouped
            const byMonth = {};
            transactions.forEach(function (t) {
                const m = t.month || 'Unknown';
                if (!byMonth[m]) byMonth[m] = { total: 0, cats: {} };
                byMonth[m].total += t.amount;
                byMonth[m].cats[t.category] = (byMonth[m].cats[t.category] || 0) + t.amount;
            });

            const months = Object.keys(byMonth).sort().reverse();
            if (months.length === 0) { box.classList.add('hidden'); return; }

            box.classList.remove('hidden');
            content.innerHTML = months.map(function (m) {
                const cats = Object.entries(byMonth[m].cats)
                    .map(([k, v]) => `<span class="summary-cat">${k}: ${formatRp(v)}</span>`)
                    .join('');
                return `<div class="summary-row">
                    <strong>${m}</strong>
                    <span class="summary-total">${formatRp(byMonth[m].total)}</span>
                    <div class="summary-cats">${cats}</div>
                </div>`;
            }).join('');
        } else {
            // Show selected month breakdown
            const filtered = transactions.filter(t => (t.month || '') === filterMonth);
            if (filtered.length === 0) { box.classList.add('hidden'); return; }

            const total = filtered.reduce((s, t) => s + t.amount, 0);
            const cats = {};
            filtered.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });

            box.classList.remove('hidden');
            const catRows = Object.entries(cats)
                .map(([k, v]) => `<span class="summary-cat">${k}: ${formatRp(v)}</span>`)
                .join('');
            content.innerHTML = `<div class="summary-row">
                <strong>${filterMonth}</strong>
                <span class="summary-total">${formatRp(total)}</span>
                <div class="summary-cats">${catRows}</div>
            </div>`;
        }
    }

    // ── Pie chart ────────────────────────────────────────────────────────────
    function updateChart() {
        const visible = getVisible();
        const totals = {};
        visible.forEach(function (t) {
            totals[t.category] = (totals[t.category] || 0) + t.amount;
        });

        const labels = Object.keys(totals);
        const data = labels.map(k => totals[k]);
        const colors = labels.map(k => colorFor(k));

        const canvas = document.getElementById('pie-chart');
        const empty = document.getElementById('chart-empty');

        if (labels.length === 0) {
            canvas.style.display = 'none';
            empty.style.display = 'block';
            if (chart) { chart.destroy(); chart = null; }
            return;
        }

        canvas.style.display = 'block';
        empty.style.display = 'none';

        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.data.datasets[0].backgroundColor = colors;
            chart.update();
        } else {
            chart = new Chart(canvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
                },
                options: {
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 12 } } },
                        tooltip: {
                            callbacks: { label: ctx => ' ' + formatRp(ctx.parsed) }
                        }
                    }
                }
            });
        }
    }

    // ── Master render ────────────────────────────────────────────────────────
    function render() {
        save();
        renderCategorySelect();
        renderList();
        updateBalance();
        updateChart();
        renderSummary();
    }

    // ── Dark / Light mode ────────────────────────────────────────────────────
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    }

    document.getElementById('theme-toggle').addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // ── Spending limit ───────────────────────────────────────────────────────
    document.getElementById('set-limit-btn').addEventListener('click', function () {
        const val = parseFloat(document.getElementById('spend-limit').value);
        if (!isNaN(val) && val >= 0) {
            spendLimit = val;
            render();
        }
    });

    document.getElementById('clear-limit-btn').addEventListener('click', function () {
        spendLimit = 0;
        document.getElementById('spend-limit').value = '';
        render();
    });

    // ── Custom category ──────────────────────────────────────────────────────
    document.getElementById('add-cat-btn').addEventListener('click', function () {
        const input = document.getElementById('new-category');
        const name = input.value.trim();
        if (!name) return;
        if (categories.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
            input.value = '';
            return;
        }
        categories.push(name);
        input.value = '';
        render();
    });

    // ── Sort ─────────────────────────────────────────────────────────────────
    document.getElementById('sort-select').addEventListener('change', function () {
        sortMode = this.value;
        render();
    });

    // ── Month filter ─────────────────────────────────────────────────────────
    document.getElementById('filter-month').addEventListener('change', function () {
        filterMonth = this.value;
        render();
    });

    document.getElementById('clear-filter-btn').addEventListener('click', function () {
        filterMonth = '';
        document.getElementById('filter-month').value = '';
        render();
    });

    // ── Add transaction ──────────────────────────────────────────────────────
    document.getElementById('add-btn').addEventListener('click', function () {
        const name = document.getElementById('item-name').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const month = document.getElementById('txn-month').value;
        const errorMsg = document.getElementById('error-msg');

        if (!name || !amount || amount <= 0 || !category) {
            errorMsg.classList.remove('hidden');
            return;
        }

        errorMsg.classList.add('hidden');

        transactions.push({ id: Date.now(), name, amount, category, month });

        document.getElementById('item-name').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('category').value = '';
        document.getElementById('txn-month').value = '';

        render();
    });

    // ── Delete transaction ───────────────────────────────────────────────────
    document.getElementById('transaction-list').addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            transactions = transactions.filter(t => t.id !== id);
            render();
        }
    });

    // ── Init ─────────────────────────────────────────────────────────────────
    applyTheme(localStorage.getItem('theme') || 'light');
    if (spendLimit > 0) document.getElementById('spend-limit').value = spendLimit;
    if (filterMonth) document.getElementById('filter-month').value = filterMonth;
    render();

})();
