function startWebsite() {
    document.querySelector('.starting-container').classList.add('fade-out');
    setTimeout(() => {
        window.location.href = "index.html"; // Redirect to Home Page
    }, 1000);
}
