/**
 * Store Module
 * Handles store functionality and data loading
 */

// Load store data
async function loadStoreData() {
    try {
        // Load featured items
        await loadFeaturedItems();
        
        // Load special offers
        await loadSpecialOffers();
        
        // Load new releases
        await loadNewReleases();
        
        // Load top sellers
        await loadTopSellers();
        
        // Load recommended items
        await loadRecommendedItems();
        
    } catch (error) {
        console.error('Error loading store data:', error);
        window.uiModule.showNotification('Failed to load store content', 'error');
    }
}

// Load featured items
async function loadFeaturedItems() {
    try {
        const featuredItems = await window.api.getFeaturedItems();
        // Update featured banner
        // Implementation pending
    } catch (error) {
        console.error('Error loading featured items:', error);
    }
}

// Load special offers
async function loadSpecialOffers() {
    try {
        const specialOffers = await window.api.getSpecialOffers();
        updateItemsGrid('special-offers', specialOffers);
    } catch (error) {
        console.error('Error loading special offers:', error);
    }
}

// Load new releases
async function loadNewReleases() {
    try {
        const newReleases = await window.api.getNewReleases();
        updateItemsGrid('new-releases', newReleases);
    } catch (error) {
        console.error('Error loading new releases:', error);
    }
}

// Load top sellers
async function loadTopSellers() {
    try {
        const topSellers = await window.api.getTopSellers();
        updateItemsGrid('top-sellers', topSellers);
    } catch (error) {
        console.error('Error loading top sellers:', error);
    }
}

// Load recommended items
async function loadRecommendedItems() {
    try {
        const recommendedItems = await window.api.getRecommendedItems();
        updateItemsGrid('recommended', recommendedItems);
    } catch (error) {
        console.error('Error loading recommended items:', error);
    }
}

// Update items grid
function updateItemsGrid(section, items) {
    const grid = document.querySelector(`.store-section.${section} .items-grid`);
    if (!grid) return;
    
    if (!items || items.length === 0) {
        grid.innerHTML = '<p>No items available.</p>';
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="store-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.image || '../assets/default-item.png'}" alt="${item.name}">
                ${item.discount ? `<span class="discount-badge">-${item.discount}%</span>` : ''}
            </div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="item-price">
                    ${item.discount ? `
                        <span class="original-price">$${item.originalPrice}</span>
                        <span class="discounted-price">$${item.price}</span>
                    ` : `
                        <span class="price">$${item.price}</span>
                    `}
                </div>
            </div>
            <button class="btn-primary btn-sm add-to-cart" data-id="${item.id}">
                Add to Cart
            </button>
        </div>
    `).join('');
    
    // Add event listeners to Add to Cart buttons
    grid.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-id');
            addToCart(itemId);
        });
    });
}

// Add item to cart
async function addToCart(itemId) {
    try {
        await window.api.addToCart(itemId);
        window.uiModule.showNotification('Item added to cart', 'success');
    } catch (error) {
        console.error('Error adding item to cart:', error);
        window.uiModule.showNotification('Failed to add item to cart', 'error');
    }
}

// Initialize store module
function initStore() {
    // Add event listeners for category buttons
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            // Add active class to clicked button
            e.target.classList.add('active');
            // Load category content
            loadCategoryContent(e.target.textContent.toLowerCase());
        });
    });
    
    // Load initial store data
    loadStoreData();
}

// Load category content
async function loadCategoryContent(category) {
    try {
        const items = await window.api.getCategoryItems(category);
        // Update store content based on category
        // Implementation pending
    } catch (error) {
        console.error('Error loading category content:', error);
        window.uiModule.showNotification('Failed to load category content', 'error');
    }
}

// Export module
window.storeModule = {
    initStore,
    loadStoreData,
    addToCart
}; 