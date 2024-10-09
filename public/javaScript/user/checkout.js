function selectCard(selectedCard) {
    const cards = document.querySelectorAll('.address-card');
    cards.forEach(card => card.classList.remove('selected'));
    selectedCard.classList.add('selected');
}