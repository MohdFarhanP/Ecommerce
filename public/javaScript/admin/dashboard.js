async function fetchCategorySalesData(filter = 'monthly') {
    const response = await fetch(`/category-sales?filter=${filter}`);
    return response.json(); 
}
// get the sales chart
async function renderCategorySalesChart(filter = 'monthly') {
    const data = await fetchCategorySalesData(filter);

    const labels = data.map(item => item.categoryName);
    const salesData = data.map(item => item.totalSales);

    const ctx = document.getElementById('categorySalesChart').getContext('2d');

    if (window.salesChart) {
        window.salesChart.destroy();
    }

    // Create new chart instance
    window.salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Total Sales by Category (${filter})`,
                data: salesData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, // Ensure the chart maintains aspect ratio
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
// fetching top selling products
async function fetchTopSellingData(url, tableId) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        const tableBody = document.getElementById(tableId);
        tableBody.innerHTML = ''; 

        data.forEach(item => {
            const row = document.createElement('tr');

            if (tableId === 'topProductsTable') {
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.productPrice}</td>
                    <td>${item.totalOrders}</td> 
                `;
            } else if (tableId === 'topCategoriesTable') {
                row.innerHTML = `
                    <td>${item.categoryName}</td>
                    <td>${item.totalOrders}</td> 
                `;
            } else if (tableId === 'topBrandsTable') {
                row.innerHTML = `
                    <td>${item.brandName}</td>
                    <td>${item.totalOrders}</td>  
                `;
            }

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching top-selling data:', error);
    }
}
// apply the function when the page loaded
document.addEventListener('DOMContentLoaded', () => {
    renderCategorySalesChart();
    fetchTopSellingData('/dashboard/top-selling-products', 'topProductsTable');
    fetchTopSellingData('/dashboard/top-selling-categories', 'topCategoriesTable');
    fetchTopSellingData('/dashboard/top-selling-brands', 'topBrandsTable');

    document.getElementById('filterDropdown').addEventListener('change', (event) => {
        const filter = event.target.value;
        renderCategorySalesChart(filter); 
    });
});
