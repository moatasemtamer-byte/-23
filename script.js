// Menu data - all items with their details
const menuData = {
    balady: [
        { id: 1, name: "فول بلدي", icon: "●", hasExtras: true },
        { id: 2, name: "طعمية بلدي", icon: "●", hasExtras: true },
        { id: 3, name: "بابا غنوج بلدي", icon: "●", hasExtras: true },
        { id: 4, name: "مسقعة بلدي", icon: "●", hasExtras: true },
        { id: 5, name: "بطاطس كاتشب مايونيز بلدي", icon: "●", hasExtras: true },
        { id: 6, name: "بطاطس طحينة بلدي", icon: "●", hasExtras: true },
        { id: 13, name: "سندوتش بيض طحينه", icon: "●", hasExtras: true }
    ],
    shami: [
        { id: 7, name: "فول شامي", icon: "●", hasExtras: true },
        { id: 8, name: "طعمية شامي", icon: "●", hasExtras: true },
        { id: 9, name: "بابا غنوج شامي", icon: "●", hasExtras: true },
        { id: 10, name: "مسقعة شامي", icon: "●", hasExtras: true },
        { id: 11, name: "بطاطس كاتشب مايونيز شامي", icon: "●", hasExtras: true },
        { id: 12, name: "بطاطس طحينة شامي", icon: "●", hasExtras: true }
    ],
    appetizer: [
        { id: 24, name: "علبة بتنجان مخلل", icon: "●", hasExtras: false },
        { id: 25, name: "علبة بتنجان مقلي", icon: "●", hasExtras: false },
        { id: 26, name: "علبة مسقعة", icon: "●", hasExtras: false },
        { id: 27, name: "علبة حمص", icon: "●", hasExtras: false },
        { id: 28, name: "علبة متبل", icon: "●", hasExtras: false },
        { id: 29, name: "علبة طحينة", icon: "●", hasExtras: false },
        { id: 30, name: "علبة مخلل مشكل", icon: "●", hasExtras: false },
        { id: 31, name: "علبة زيتون", icon: "●", hasExtras: false },
        { id: 32, name: "علبة سلطة خضراء", icon: "●", hasExtras: false }
    ],
    jar: [
        { id: 14, name: "علبة فول جامبو", icon: "●", hasExtras: false },
        { id: 15, name: "علبة فول صغيرة", icon: "●", hasExtras: false },
        { id: 16, name: "علبة طعمية كبيرة", icon: "●", hasExtras: false },
        { id: 17, name: "علبة فول خلاط جامبو", icon: "●", hasExtras: false },
        { id: 18, name: "علبة فول خلاط صغيرة", icon: "●", hasExtras: false },
        { id: 19, name: "علبة فول ساده جامبو", icon: "●", hasExtras: false },
        { id: 20, name: "علبة فول ساده صغيرة", icon: "●", hasExtras: false },
        { id: 21, name: "باكت بطاطس", icon: "●", hasExtras: false },
        { id: 22, name: "قرص طعميه محشيه", icon: "●", hasExtras: false },
        { id: 23, name: "رغيف شامي", icon: "●", hasExtras: false }
    ]
};

// Global state to track orders
const orderState = {};

// Current active tab
let currentTab = 'balady';

/**
 * Initialize the app
 */
function init() {
    console.log('Initializing app...');
    renderAllTabs();
    showTab('balady'); // Show first tab by default
    console.log('App initialized successfully!');
}

/**
 * Render all tabs with their menu items
 */
function renderAllTabs() {
    Object.keys(menuData).forEach(category => {
        renderTab(category);
    });
}

/**
 * Render a specific tab's content
 */
function renderTab(category) {
    const container = document.getElementById(category);
    if (!container) {
        console.error(`Container for ${category} not found!`);
        return;
    }
    
    const items = menuData[category];
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">-</div>
                <p>لا توجد عناصر في هذا القسم</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="menu-item">
            <div class="item-header">
                <div class="item-name">
                    <span class="item-icon">${item.icon}</span>
                    ${item.name}
                </div>
                <div class="quantity-controls">
                    <button class="btn btn-minus" onclick="changeQuantity(${item.id}, -1)">−</button>
                    <span class="quantity" id="qty-${item.id}">0</span>
                    <button class="btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            ${item.hasExtras ? `
                <div class="extras">
                    <label class="checkbox-label">
                        <input type="checkbox" id="extras-${item.id}" onchange="updateExtras(${item.id})">
                        عليه بتنجان مخلل
                    </label>
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the clicked tab
    const clickedTab = Array.from(document.querySelectorAll('.tab')).find(
        tab => tab.getAttribute('data-tab') === tabName
    );
    if (clickedTab) {
        clickedTab.classList.add('active');
    }

    showTab(tabName);
}

/**
 * Show specific tab content
 */
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(tabName);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
}

/**
 * Change quantity for an item
 */
function changeQuantity(itemId, delta) {
    // Initialize order state for this item if not exists
    if (!orderState[itemId]) {
        orderState[itemId] = { quantity: 0, hasExtras: false };
    }

    // Update quantity (minimum 0)
    orderState[itemId].quantity = Math.max(0, orderState[itemId].quantity + delta);
    
    // Update display
    updateQuantityDisplay(itemId);
    updateTotals();
}

/**
 * Update extras checkbox state
 */
function updateExtras(itemId) {
    if (!orderState[itemId]) {
        orderState[itemId] = { quantity: 0, hasExtras: false };
    }
    
    const checkbox = document.getElementById(`extras-${itemId}`);
    if (checkbox) {
        orderState[itemId].hasExtras = checkbox.checked;
    }
}

/**
 * Update quantity display for a specific item
 */
function updateQuantityDisplay(itemId) {
    const qtyElement = document.getElementById(`qty-${itemId}`);
    if (qtyElement && orderState[itemId]) {
        qtyElement.textContent = orderState[itemId].quantity;
    }
}

/**
 * Update total counts and show/hide elements
 */
function updateTotals() {
    // Calculate total items
    const total = Object.values(orderState).reduce((sum, item) => sum + item.quantity, 0);
    
    // Update count displays
    const totalCountElement = document.getElementById('totalCount');
    const floatingCountElement = document.getElementById('floatingCount');
    
    if (totalCountElement) {
        totalCountElement.textContent = total;
    }
    if (floatingCountElement) {
        floatingCountElement.textContent = total;
    }
    
    // Show/hide badge and button
    const badge = document.getElementById('totalBadge');
    const btn = document.getElementById('generateBtn');
    
    if (total > 0) {
        if (badge) badge.style.display = 'flex';
        if (btn) btn.classList.add('show');
    } else {
        if (badge) badge.style.display = 'none';
        if (btn) btn.classList.remove('show');
    }
}

/**
 * Generate order text
 */
function generateOrder() {
    console.log('Generating order...');
    
    let orderText = "سلام عليكم لو سمحت ممكن :\n\n";
    let hasItems = false;

    // Collect all ordered items
    const allItems = [];
    Object.keys(menuData).forEach(category => {
        menuData[category].forEach(item => {
            if (orderState[item.id] && orderState[item.id].quantity > 0) {
                allItems.push({
                    ...item,
                    category,
                    state: orderState[item.id]
                });
            }
        });
    });

    // Sort by ID to maintain consistent order
    allItems.sort((a, b) => a.id - b.id);

    // Build order text
    allItems.forEach(item => {
        hasItems = true;
        let prefix = "";
        
        // Determine prefix based on category
        if (item.category === 'balady' || item.category === 'shami') {
            prefix = "سندوتش";
        } else if (item.category === 'jar' || item.category === 'appetizer') {
            // Don't add prefix if name already contains these words
            if (!item.name.includes("علبة") && !item.name.includes("باكت") && 
                !item.name.includes("قرص") && !item.name.includes("رغيف")) {
                prefix = "علبة";
            }
        }

        // Build line
        let line = `${item.state.quantity} ${prefix} ${item.name}`.replace(/\s+/g, ' ').trim();
        
        // Add extras if checked
        if (item.state.hasExtras) {
            line += " عليه بتنجان مخلل";
        }
        
        orderText += line + "\n";
    });

    // Don't show modal if no items
    if (!hasItems) {
        alert('الرجاء اختيار عناصر أولاً');
        return;
    }

    // Add payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    orderText += "\n";
    if (paymentMethod === 'instapay') {
        orderText += "دفع انستا باي";
    } else {
        orderText += "الدفع كاش";
    }

    // Display order in modal
    const orderTextElement = document.getElementById('orderText');
    if (orderTextElement) {
        orderTextElement.textContent = orderText;
    }
    
    openModal();
}

/**
 * Open the order preview modal
 */
function openModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.add('show');
        // Reset success message
        const successMsg = document.getElementById('successMsg');
        if (successMsg) {
            successMsg.classList.remove('show');
        }
    }
}

/**
 * Close the order preview modal
 */
function closeModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Copy order to clipboard
 */
function copyOrder() {
    const orderText = document.getElementById('orderText').textContent;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(orderText)
            .then(() => {
                showSuccess();
            })
            .catch(err => {
                console.error('Clipboard API failed:', err);
                fallbackCopy(orderText);
            });
    } else {
        // Fallback for older browsers
        fallbackCopy(orderText);
    }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showSuccess();
        } else {
            alert('فشل النسخ. الرجاء نسخ النص يدوياً');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('فشل النسخ. الرجاء نسخ النص يدوياً');
    }
    
    document.body.removeChild(textarea);
}

/**
 * Show success message
 */
function showSuccess() {
    const msg = document.getElementById('successMsg');
    if (msg) {
        msg.classList.add('show');
        setTimeout(() => {
            msg.classList.remove('show');
        }, 2000);
    }
}

/**
 * Close modal when clicking outside
 */
document.addEventListener('click', function(event) {
    const modal = document.getElementById('orderModal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

/**
 * Prevent body scroll when modal is open
 */
function updateBodyScroll() {
    const modal = document.getElementById('orderModal');
    if (modal && modal.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

/**
 * Update order preview when payment method changes
 */
function updatePaymentPreview() {
    // Regenerate the order text with new payment method
    let orderText = "سلام عليكم لو سمحت ممكن :\n\n";

    const allItems = [];
    Object.keys(menuData).forEach(category => {
        menuData[category].forEach(item => {
            if (orderState[item.id] && orderState[item.id].quantity > 0) {
                allItems.push({
                    ...item,
                    category,
                    state: orderState[item.id]
                });
            }
        });
    });

    allItems.sort((a, b) => a.id - b.id);

    allItems.forEach(item => {
        let prefix = "";
        
        if (item.category === 'balady' || item.category === 'shami') {
            prefix = "سندوتش";
        } else if (item.category === 'jar' || item.category === 'appetizer') {
            if (!item.name.includes("علبة") && !item.name.includes("باكت") && 
                !item.name.includes("قرص") && !item.name.includes("رغيف")) {
                prefix = "علبة";
            }
        }

        let line = `${item.state.quantity} ${prefix} ${item.name}`.replace(/\s+/g, ' ').trim();
        
        if (item.state.hasExtras) {
            line += " عليه بتنجان مخلل";
        }
        
        orderText += line + "\n";
    });

    // Add payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    orderText += "\n";
    if (paymentMethod === 'instapay') {
        orderText += "دفع انستا باي";
    } else {
        orderText += "الدفع كاش";
    }

    document.getElementById('orderText').textContent = orderText;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('App script loaded successfully!');
