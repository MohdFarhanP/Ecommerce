
function toggleDateFields() {
    const filterType = document.getElementById('filterType').value;
    const startDateField = document.getElementById('custom-date-range-start');
    const endDateField = document.getElementById('custom-date-range-end');

    if (filterType === 'custom') {
        startDateField.style.display = 'block';
        endDateField.style.display = 'block';
    } else {
        startDateField.style.display = 'none';
        endDateField.style.display = 'none';
    }
}
