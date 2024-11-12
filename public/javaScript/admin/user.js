//filter for user
function applyFilter() {
    const filterBy = document.getElementById('userFilter').value;
    const url = new URL(window.location.href);
    
    
    if (filterBy) {
        url.searchParams.set('filterBy', filterBy);
    } else {
        url.searchParams.delete('filterBy');
    }
    url.searchParams.set('page', 1);
    window.location.href = url.toString(); 
}