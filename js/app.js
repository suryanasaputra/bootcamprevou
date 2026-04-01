// Expense Tracker - Vanilla JavaScript
(function () {
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let chart = null;

    const COLORS = {
        Food: '#f59e0b',
        Transport: '#10b981',
        Fun: '#ec4899'
    };

    function formatRp(num) {
        return 'Rp ' + Number(num).toLocaleString('id-ID');
    }

    // --- Save & Render ---

    function save() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function render() {
        save();
        renderList();
        updateBalance();
        updateChart();
    }

    // --- Balance ---

    function updateBalance() {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        document.getElementById('total-balance').textContent = formatRp(total);
    }

    // --- Transaction List ---

    function renderList() {
        const list = document.getElementById('transaction-list');
        list.innerHTML = '';

        if (transactions.length === 0) {
            list.innerHTML = '<li class="empty-msg">No transactions yet.</li>';
            return;
        }

        transactions.forEach(function (t) {
            const li = document.createElement('li');
            li.className = 'item ' + t.category;
            li.innerHTML = `
                <div class="info">
                    <div class="name">${t.name}</div>
                    <div class="meta">${t.category}</div>
                </div>
                <div class="right">
                    <span class="amount">${formatRp(t.amount)}</span>
                    <button class="delete-btn" data-id="${t.id}">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    // --- Pie Chart ---

    function updateChart() {
        const totals = { Food: 0, Transport: 0, Fun: 0 };
        transactions.forEach(function (t) {
            totals[t.category] += t.amount;
        });

        const labels = Object.keys(totals).filter(k => totals[k] > 0);
        const data = labels.map(k => totals[k]);
        const colors = labels.map(k => COLORS[k]);

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
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 12 } } },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    return ' ' + formatRp(ctx.parsed);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // --- Add Transaction ---

    document.getElementById('add-btn').addEventListener('click', function () {
        const name = document.getElementById('item-name').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const errorMsg = document.getElementById('error-msg');

        if (!name || !amount || amount <= 0 || !category) {
            errorMsg.classList.remove('hidden');
            return;
        }

        errorMsg.classList.add('hidden');

        transactions.push({
            id: Date.now(),
            name,
            amount,
            category
        });

        document.getElementById('item-name').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('category').value = '';

        render();
    });

    // --- Delete Transaction (event delegation) ---

    document.getElementById('transaction-list').addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            transactions = transactions.filter(t => t.id !== id);
            render();
        }
    });

    // --- Init ---
    render();
})();
