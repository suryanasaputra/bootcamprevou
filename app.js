$(function () {
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

    function updateBalance() {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        $('#total-balance').text(formatRp(total));
    }

    function renderList() {
        const $list = $('#transaction-list');
        $list.empty();

        if (transactions.length === 0) {
            $list.append('<li class="empty-msg">No transactions yet.</li>');
            return;
        }

        transactions.forEach(function (t) {
            const $li = $(`
        <li class="item ${t.category}">
          <div class="info">
            <div class="name">${t.name}</div>
            <div class="meta">${t.category}</div>
          </div>
          <div class="right">
            <span class="amount">${formatRp(t.amount)}</span>
            <button class="delete-btn" data-id="${t.id}">Delete</button>
          </div>
        </li>
      `);
            $list.append($li);
        });
    }

    function updateChart() {
        const totals = { Food: 0, Transport: 0, Fun: 0 };
        transactions.forEach(function (t) {
            totals[t.category] += t.amount;
        });

        const labels = Object.keys(totals).filter(k => totals[k] > 0);
        const data = labels.map(k => totals[k]);
        const colors = labels.map(k => COLORS[k]);

        if (labels.length === 0) {
            $('#pie-chart').hide();
            $('#chart-empty').show();
            if (chart) { chart.destroy(); chart = null; }
            return;
        }

        $('#pie-chart').show();
        $('#chart-empty').hide();

        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.data.datasets[0].backgroundColor = colors;
            chart.update();
        } else {
            const ctx = document.getElementById('pie-chart').getContext('2d');
            chart = new Chart(ctx, {
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

    function save() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function render() {
        save();
        renderList();
        updateBalance();
        updateChart();
    }

    // Add transaction
    $('#add-btn').on('click', function () {
        const name = $('#item-name').val().trim();
        const amount = parseFloat($('#amount').val());
        const category = $('#category').val();

        if (!name || !amount || amount <= 0 || !category) {
            $('#error-msg').removeClass('hidden');
            return;
        }

        $('#error-msg').addClass('hidden');

        transactions.push({
            id: Date.now(),
            name,
            amount,
            category
        });

        // Reset form
        $('#item-name').val('');
        $('#amount').val('');
        $('#category').val('');

        render();
    });

    // Delete transaction (event delegation)
    $('#transaction-list').on('click', '.delete-btn', function () {
        const id = parseInt($(this).data('id'));
        transactions = transactions.filter(t => t.id !== id);
        render();
    });

    // Initial render
    render();
});
