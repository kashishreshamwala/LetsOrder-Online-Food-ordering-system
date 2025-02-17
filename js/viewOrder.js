document.addEventListener("DOMContentLoaded", function () {
    displayOrderItems();
});

function displayOrderItems() {
    const orderItemsTable = document.querySelector('#order-items tbody');
    orderItemsTable.innerHTML = ""; // Clear previous items

    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartItems.length === 0) {
        orderItemsTable.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Your cart is empty.</td></tr>";
        document.getElementById('order-total').textContent = "₹0.00";
        return;
    }

    let totalAmount = 0;

    cartItems.forEach((item, index) => {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; border-radius:5px;"></td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${(item.quantity * item.price).toFixed(2)}</td>
        `;

        orderItemsTable.appendChild(newRow);
        totalAmount += item.quantity * item.price;
    });

    document.getElementById('order-total').textContent = `₹${totalAmount.toFixed(2)}`;
}

// Function to place order
function placeOrder() {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartItems.length === 0) {
        showEmptyCartAlert();
        return; // Prevent order success popup
    }

    const popup = document.getElementById("order-success-popup");
    popup.style.display = "flex";

    startConfetti(); // Start confetti animation

    // Clear the cart after order is placed
    setTimeout(() => {
        localStorage.removeItem('cart'); // Clear cart
    }, 2000);
}

// Function to show the empty cart alert
function showEmptyCartAlert() {
    const alertBox = document.getElementById("empty-cart-alert");
    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.remove("show");
    }, 3000); // Hide alert after 3 seconds
}

// Function to close popup and redirect
function closeOrderPopup() {
    document.getElementById("order-success-popup").style.display = "none";
    stopConfetti(); // Stop confetti
    window.location.href = "index.html"; // Redirect back to homepage
}

// Confetti Effect
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");
const confettiPieces = [];

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createConfettiPiece() {
    return {
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        size: Math.random() * 6 + 4,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360
    };
}

function updateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((piece, index) => {
        piece.y += piece.speed;
        piece.angle += 2;
        confettiCtx.fillStyle = piece.color;
        confettiCtx.beginPath();
        confettiCtx.arc(piece.x, piece.y, piece.size, 0, Math.PI * 2);
        confettiCtx.fill();

        // Remove confetti when it leaves the screen
        if (piece.y > confettiCanvas.height) {
            confettiPieces[index] = createConfettiPiece();
        }
    });

    requestAnimationFrame(updateConfetti);
}

function startConfetti() {
    for (let i = 0; i < 100; i++) {
        confettiPieces.push(createConfettiPiece());
    }
    updateConfetti();
}

function stopConfetti() {
    confettiPieces.length = 0;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}
