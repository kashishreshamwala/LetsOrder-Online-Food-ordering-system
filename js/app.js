
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYU8CauRrpGhjOyd_PeBVF96iSf4SAQS4",
    authDomain: "lets-order-a88ea.firebaseapp.com",
    projectId: "lets-order-a88ea",
    storageBucket: "lets-order-a88ea.appspot.com",
    messagingSenderId: "830345864855",
    appId: "1:830345864855:web:6fb6d99e39b4dfef86abd2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    loadMenuItems();
    setupFilters();
});

// Function to filter menu items based on search query
function searchMenuItems() {
    const searchInput = document.getElementById("search-input").value.trim().toLowerCase();
    const items = document.querySelectorAll(".detail-card");

    if (searchInput === "") {
        // If input is empty, show all items
        items.forEach(item => {
            item.style.display = "block";
        });
        return;
    }

    items.forEach(item => {
        const category = item.getAttribute("data-item-category").toLowerCase();
        
        // Check if the entered text matches any category
        if (category.includes(searchInput)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Attach event listener to the search button
document.getElementById("search-btn").addEventListener("click", searchMenuItems);

// Allow "Enter" key to perform search
document.getElementById("search-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchMenuItems();
    }
});

function loadMenuItems() {
    const menuContainer = document.getElementById("menuItemsContainer");
    onSnapshot(collection(db, "menuItems"), (snapshot) => {
        menuContainer.innerHTML = "";
        snapshot.forEach(doc => {
            const item = doc.data();
            const menuItem = document.createElement("div");
            menuItem.classList.add("detail-card");
            menuItem.setAttribute("data-item-category", item.category);
            menuItem.innerHTML = `
                <img src="${item.image}" class="detail-img">
                <div class="detail-desc">
                    <h4>${item.name}</h4>
                    <p class="price">Price: &#8377;${item.price}</p>
                    <button class="add-to-cart-btn" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">Add To Cart</button>
                </div>
            `;
            menuContainer.appendChild(menuItem);
        });
        attachAddToCartListeners();
    });
}


function setupFilters() {
    document.querySelectorAll(".filter-card").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelectorAll(".filter-card").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            applyCategoryFilter(this.getAttribute("data-category"));
        });
    });
}

function applyCategoryFilter(category) {
    const items = document.querySelectorAll(".detail-card");
    items.forEach(item => {
        if (category === 'all' || item.getAttribute("data-item-category") === category) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// JavaScript to filter menu items based on category selection
document.addEventListener("DOMContentLoaded", function () {
    const filterCards = document.querySelectorAll(".filter-card");
    const menuItems = document.querySelectorAll(".detail-card");

    filterCards.forEach(card => {
        card.addEventListener("click", function () {
            const category = this.getAttribute("data-category");
            
            menuItems.forEach(item => {
                const itemCategory = item.getAttribute("data-item-category");
                
                if (category === "all" || itemCategory === category) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
});

// Ensure cart is properly retrieved from localStorage
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Function to save cart data persistently
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    document.cookie = "cart=" + JSON.stringify(cartItems) + "; path=/"; // Also store in cookies for backup
}

// Function to display cart popup items
function displayCartItems() {
    const cartItemsTable = document.querySelector('#cart-items tbody');
    cartItemsTable.innerHTML = ""; // Clear previous content

    if (cartItems.length === 0) {
        cartItemsTable.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Cart is empty.</td></tr>";
        document.getElementById('cart-total').textContent = "₹0.00";
        document.getElementById('cart-count').textContent = "0";
        return;
    }

    let totalAmount = 0;
    let totalCount = 0;

    cartItems.forEach(item => {
        const newRow = cartItemsTable.insertRow();
        newRow.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; border-radius:5px;"></td>
            <td>${item.name}</td>
            <td>
                <button class="decrease-qty">-</button>
                <span class="item-count">${item.quantity}</span>
                <button class="increase-qty">+</button>
            </td>
            <td class="item-price">₹${item.price.toFixed(2)}</td>
            <td class="item-total">₹${(item.quantity * item.price).toFixed(2)}</td>
            <td><button class="remove-item">❌</button></td>
        `;

        totalAmount += item.quantity * item.price;
        totalCount += item.quantity;

        // Add event listeners for quantity and removal
        newRow.querySelector('.increase-qty').addEventListener('click', function () {
            updateQuantity(item.name, 1);
        });

        newRow.querySelector('.decrease-qty').addEventListener('click', function () {
            updateQuantity(item.name, -1);
        });

        newRow.querySelector('.remove-item').addEventListener('click', function () {
            removeItem(item.name);
        });
    });

    document.getElementById('cart-total').textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById('cart-count').textContent = totalCount;
}

// Function to add items to cart
function addToCart(itemName, itemPrice, itemImage) {
    if (!itemName || !itemPrice || !itemImage) {
        console.error("Invalid item details:", { itemName, itemPrice, itemImage });
        return; // Stop execution if any parameter is missing
    }

    let existingItem = cartItems.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ name: itemName, quantity: 1, price: parseFloat(itemPrice), image: itemImage });
    }

    saveCartToLocalStorage();
    displayCartItems();
    showCartNotification(); // Show popup message

}

// Function to update item quantity
function updateQuantity(itemName, change) {
    let item = cartItems.find(item => item.name === itemName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cartItems = cartItems.filter(i => i.name !== itemName);
        }
    }

    saveCartToLocalStorage();
    displayCartItems();
}

// Function to remove an item from the cart
function removeItem(itemName) {
    cartItems = cartItems.filter(item => item.name !== itemName);
    saveCartToLocalStorage();
    displayCartItems();
}

// Function to display the cart notification
function showCartNotification() {
    const notification = document.getElementById("cart-notification");

    if (notification) {
        notification.classList.add("show");

        setTimeout(() => {
            notification.classList.add("hide");
            setTimeout(() => {
                notification.classList.remove("show", "hide");
            }, 500);
        }, 2000); // Hide after 2 seconds
    }
}

// Ensure cart remains on page reload
window.addEventListener('load', function () {
    displayCartItems();
});

// Function to toggle cart popup visibility
function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup) {
        cartPopup.classList.toggle('active');
        displayCartItems(); // Ensure items are displayed properly
    } else {
        console.error("Cart popup element not found!");
    }
}

// Close Cart Popup
document.getElementById("close-cart").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById('cart-popup').classList.remove('active');
});
// ----------------------------------------------------------
document.getElementById("viewOrderBtn").addEventListener("click", function (event) {
     // Prevent any default link behavior
     event.preventDefault();

     // Check if the user is logged in (sessionStorage or your auth system)
    if (!sessionStorage.getItem("userLoggedIn")) {
        alert("To view your order, you need to log in first.");
        window.location.href = "login.html"; // Redirect to login page
    } else {
        window.location.href = "viewOrder.html"; // Redirect to order page if logged in
    }
});

// Attach event listeners to "Add to Cart" buttons dynamically
function attachAddToCartListeners() {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", function () {
            const itemName = this.getAttribute("data-name");
            const itemPrice = this.getAttribute("data-price");
            const itemImage = this.getAttribute("data-image");
            addToCart(itemName, itemPrice, itemImage);
        });
    });
}

// Ensure cart icon opens the cart popup
document.addEventListener("DOMContentLoaded", function () {
    const cartIcon = document.getElementById('cart-icon'); // Ensure this ID is in your HTML
    
    if (cartIcon) {
        cartIcon.addEventListener("click", toggleCartPopup);
    } else {
        console.error("Cart icon element not found!");
    }
});


// View Order Function
function viewOrder() {
    window.location.href = "viewOrder.html";
}

// Navigation menu toggle for mobile
const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');

mobile.addEventListener("click", function () {
    mobile.classList.toggle("is-active");
    mobileLink.classList.toggle("active");
});

mobileLink.addEventListener("click", function () {
    if (window.innerWidth <= 768 && mobile.classList.contains("is-active")) {
        mobile.classList.toggle("is-active");
        mobileLink.classList.toggle("active");
    }
});
// Ensure profile button toggles dropdown
document.getElementById("profile-btn").addEventListener("click", function (event) {
    event.preventDefault();
    toggleDropdown();
});

// Profile Dropdown Toggle
function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    if (dropdown) {
        dropdown.classList.toggle("show");
    } else {
        console.error("Dropdown menu not found!");
    }
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    const profileButton = document.getElementById("profile-btn");
    const dropdown = document.getElementById("dropdownMenu");

    if (dropdown && profileButton && !profileButton.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove("show");
    }
});
 
// Smooth scrolling for menus
$(document).ready(function () {
    var step = 100;
    var stepFilter = 60;

    $(".back").on("click", function (e) {
        e.preventDefault();
        $(".highlight-wrapper").animate({ scrollLeft: "-=" + step + "px" });
    });

    $(".next").on("click", function (e) {
        e.preventDefault();
        $(".highlight-wrapper").animate({ scrollLeft: "+=" + step + "px" });
    });

    $(".back-menus").bind("click", function (e) {
        e.preventDefault();
        $(".filter-wrapper").animate({ scrollLeft: "-=" + stepFilter + "px" });
    });

    $(".next-menus").bind("click", function (e) {
        e.preventDefault();
        $(".filter-wrapper").animate({ scrollLeft: "+=" + stepFilter + "px" });
    });

    // Add to Cart Button Event Listener
    $(".add-to-cart-btn").on("click", function () {
        const itemName = $(this).data("name");
        const itemPrice = $(this).data("price");
        const itemImage = $(this).data("image");
        addToCart(itemName, itemPrice, itemImage);
    });

    // Remove item from cart event listener
    $("#cart-items").on("click", ".remove-item", function () {
        const row = $(this).closest("tr");
        const itemName = row.find("td:nth-child(2)").text().trim();
        removeItem(itemName);
    });
});

// Logout Functionality
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Error: " + error.message);
    });
});
