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

// Persons Mode
let isPersonsMode = false;
let persons = [
    { id: 1, name: "معتصم", orders: {} },
    { id: 2, name: "بابا", orders: {} },
    { id: 3, name: "ماما", orders: {} },
    { id: 4, name: "أحمد", orders: {} },
    { id: 5, name: "معتز", orders: {} },
    { id: 6, name: "أحمد الصغير", orders: {} }
];
let currentPersonId = null;
let completedPersons = new Set();

// ─── Last Order (persisted via localStorage) ───────────────────────────────
const LAST_ORDER_PREFIX = 'wahabi_lastOrder_';

/** Save a snapshot to localStorage as this person's last order */
function persistLastOrder(personId, orders) {
    // Only save if order is non-empty
    const hasItems = Object.values(orders).some(item => item.quantity > 0);
    if (!hasItems) return;
    try {
        localStorage.setItem(LAST_ORDER_PREFIX + personId, JSON.stringify(orders));
    } catch (e) {
        console.warn('Could not save last order to localStorage', e);
    }
}

/** Load the last-order snapshot from localStorage (returns null if none) */
function loadLastOrder(personId) {
    try {
        const raw = localStorage.getItem(LAST_ORDER_PREFIX + personId);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('Could not load last order from localStorage', e);
        return null;
    }
}

/** Build a human-readable preview string from an orders snapshot */
function buildLastOrderPreview(orders) {
    const lines = [];
    Object.keys(menuData).forEach(category => {
        menuData[category].forEach(item => {
            if (orders[item.id] && orders[item.id].quantity > 0) {
                let prefix = '';
                if (category === 'balady' || category === 'shami') {
                    prefix = 'سندوتش';
                } else if (category === 'jar' || category === 'appetizer') {
                    if (!item.name.includes('علبة') && !item.name.includes('باكت') &&
                        !item.name.includes('قرص') && !item.name.includes('رغيف')) {
                        prefix = 'علبة';
                    }
                }
                let line = `${orders[item.id].quantity} ${prefix} ${item.name}`.replace(/\s+/g, ' ').trim();
                if (orders[item.id].hasExtras) line += ' عليه بتنجان مخلل';
                lines.push(line);
            }
        });
    });
    return lines.join('\n');
}

// Temporary state for the "apply last order?" confirmation modal
let pendingLastOrderPersonId = null;

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

/**
 * Toggle between normal mode and persons mode
 */
function toggleMode() {
    isPersonsMode = !isPersonsMode;
    const modeToggle = document.getElementById('modeToggle');
    const personsSection = document.getElementById('personsSection');
    const tabsSection = document.querySelector('.tabs');
    const contentSection = document.querySelector('.content');
    const orderingBanner = document.getElementById('orderingBanner');
    const resetBtn = document.getElementById('resetBtn');
    
    if (isPersonsMode) {
        modeToggle.classList.add('active');
        personsSection.style.display = 'block';
        resetBtn.style.display = 'flex'; // Show reset button
        // Hide tabs and content until person is selected
        tabsSection.classList.add('hidden');
        contentSection.classList.add('hidden');
        orderingBanner.style.display = 'none';
        renderPersonsList();
        // Clear normal mode selections
        resetAllQuantities();
        currentPersonId = null;
    } else {
        modeToggle.classList.remove('active');
        personsSection.style.display = 'none';
        resetBtn.style.display = 'none'; // Hide reset button
        tabsSection.classList.remove('hidden');
        contentSection.classList.remove('hidden');
        orderingBanner.style.display = 'none';
        currentPersonId = null;
        completedPersons.clear();
        resetAllQuantities();
    }
}

/**
 * Render the persons list
 */
function renderPersonsList() {
    const container = document.getElementById('personsList');
    container.innerHTML = persons.map(person => {
        const itemCount = Object.values(person.orders).reduce((sum, item) => sum + item.quantity, 0);
        const isCompleted = completedPersons.has(person.id);
        const isSelected = currentPersonId === person.id;
        const hasLastOrder = loadLastOrder(person.id) !== null;

        // Build the optional "repeat last order" button
        const lastOrderBtn = hasLastOrder
            ? `<button class="last-order-btn" onclick="event.stopPropagation(); openLastOrderModal(${person.id})">🔁 نفس الطلب السابق</button>`
            : '';

        return `
            <div class="person-card ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}" 
                 onclick="selectPerson(${person.id})">
                <div class="person-name">${person.name}</div>
                <div class="person-items-count">${itemCount} عنصر</div>
                ${lastOrderBtn}
            </div>
        `;
    }).join('');
}

/**
 * Select a person to order for
 */
function selectPerson(personId) {
    // Save current person's order if switching
    if (currentPersonId && currentPersonId !== personId) {
        saveCurrentPersonOrder();
    }
    
    currentPersonId = personId;
    const person = persons.find(p => p.id === personId);
    
    // Load this person's order
    Object.keys(orderState).forEach(key => delete orderState[key]);
    Object.assign(orderState, person.orders);
    
    // Show tabs and content for ordering
    const tabsSection = document.querySelector('.tabs');
    const contentSection = document.querySelector('.content');
    const orderingBanner = document.getElementById('orderingBanner');
    const personsSection = document.getElementById('personsSection');
    
    tabsSection.classList.remove('hidden');
    contentSection.classList.remove('hidden');
    orderingBanner.style.display = 'flex';
    personsSection.style.display = 'none'; // Hide person list while ordering
    
    // Update ordering banner
    document.getElementById('orderingPersonName').textContent = person.name;
    
    // Re-render menu with this person's selections
    renderAllTabs();
    updateQuantitiesDisplay();
    updateTotals();
}

/**
 * Save current person's order
 */
function saveCurrentPersonOrder() {
    if (!currentPersonId) return;
    
    const person = persons.find(p => p.id === currentPersonId);
    person.orders = JSON.parse(JSON.stringify(orderState));

    // Persist to localStorage so it survives page refreshes
    persistLastOrder(currentPersonId, person.orders);
}

/**
 * Move to next person
 */
function nextPerson() {
    if (!currentPersonId) return;
    
    // Save current person's order
    saveCurrentPersonOrder();
    completedPersons.add(currentPersonId);
    
    // Reset selections
    resetAllQuantities();
    
    // Go back to person selection
    currentPersonId = null;
    const tabsSection = document.querySelector('.tabs');
    const contentSection = document.querySelector('.content');
    const orderingBanner = document.getElementById('orderingBanner');
    const personsSection = document.getElementById('personsSection');
    
    tabsSection.classList.add('hidden');
    contentSection.classList.add('hidden');
    orderingBanner.style.display = 'none';
    personsSection.style.display = 'block';
    
    renderPersonsList();
}

/**
 * Finish ordering for all persons
 */
function finishOrdering() {
    if (!currentPersonId) return;
    
    // Save current person's order
    saveCurrentPersonOrder();
    completedPersons.add(currentPersonId);
    
    // Generate the complete order
    generatePersonsOrder();
}

/**
 * Update quantities display for all items
 */
function updateQuantitiesDisplay() {
    Object.keys(orderState).forEach(itemId => {
        const qtyElement = document.getElementById(`qty-${itemId}`);
        if (qtyElement) {
            qtyElement.textContent = orderState[itemId].quantity;
        }
        
        const checkbox = document.getElementById(`extras-${itemId}`);
        if (checkbox) {
            checkbox.checked = orderState[itemId].hasExtras;
        }
    });
}

/**
 * Reset all quantities to zero
 */
function resetAllQuantities() {
    Object.keys(orderState).forEach(key => delete orderState[key]);
    
    document.querySelectorAll('.quantity').forEach(el => {
        el.textContent = '0';
    });
    
    document.querySelectorAll('.checkbox-label input').forEach(el => {
        el.checked = false;
    });
    
    updateTotals();
}

/**
 * Open manage persons modal
 */
function openManagePersons() {
    document.getElementById('managePersonsModal').classList.add('show');
    renderPersonsManager();
}

/**
 * Close manage persons modal
 */
function closeManagePersons() {
    document.getElementById('managePersonsModal').classList.remove('show');
    renderPersonsList();
}

/**
 * Render persons in manager
 */
function renderPersonsManager() {
    const container = document.getElementById('personsListManager');
    container.innerHTML = persons.map(person => `
        <div class="person-item-manager">
            <span class="person-item-name">${person.name}</span>
            <button class="remove-person-btn" onclick="removePerson(${person.id})">حذف</button>
        </div>
    `).join('');
}

/**
 * Add new person
 */
function addNewPerson() {
    const input = document.getElementById('newPersonInput');
    const name = input.value.trim();
    
    if (!name) {
        alert('الرجاء إدخال اسم الشخص');
        return;
    }
    
    const newId = Math.max(...persons.map(p => p.id), 0) + 1;
    persons.push({
        id: newId,
        name: name,
        orders: {}
    });
    
    input.value = '';
    renderPersonsManager();
}

/**
 * Remove person
 */
function removePerson(personId) {
    if (persons.length <= 1) {
        alert('يجب أن يبقى شخص واحد على الأقل');
        return;
    }
    
    const personName = persons.find(p => p.id === personId)?.name;
    if (confirm(`هل تريد حذف ${personName}؟`)) {
        persons = persons.filter(p => p.id !== personId);
        completedPersons.delete(personId);
        
        if (currentPersonId === personId) {
            currentPersonId = null;
            document.getElementById('currentPersonIndicator').style.display = 'none';
            resetAllQuantities();
        }
        
        renderPersonsManager();
    }
}

/**
 * Override generateOrder to handle persons mode
 */
const originalGenerateOrder = generateOrder;
generateOrder = function() {
    if (isPersonsMode) {
        generatePersonsOrder();
    } else {
        originalGenerateOrder();
    }
};

/**
 * Generate order for all persons
 */
function generatePersonsOrder() {
    // Save current person's order
    if (currentPersonId) {
        saveCurrentPersonOrder();
    }
    
    let orderText = "سلام عليكم لو سمحت ممكن :\n\n";
    let hasItems = false;
    
    // Collect all items from all persons (without showing names)
    const allPersonItems = [];
    
    persons.forEach(person => {
        const personOrders = person.orders;
        
        Object.keys(menuData).forEach(category => {
            menuData[category].forEach(item => {
                if (personOrders[item.id] && personOrders[item.id].quantity > 0) {
                    allPersonItems.push({
                        ...item,
                        category,
                        state: personOrders[item.id]
                    });
                }
            });
        });
    });
    
    if (allPersonItems.length === 0) {
        alert('الرجاء إضافة طلبات للأشخاص');
        return;
    }
    
    hasItems = true;
    
    // Sort all items by ID
    allPersonItems.sort((a, b) => a.id - b.id);
    
    // Build order text (combined, no person names)
    allPersonItems.forEach(item => {
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
    orderText += "\n";
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'instapay';
    if (paymentMethod === 'instapay') {
        orderText += "دفع انستا باي";
    } else {
        orderText += "الدفع كاش";
    }
    
    document.getElementById('orderText').textContent = orderText;
    document.getElementById('orderModal').classList.add('show');
}


/**
 * Open reset confirmation modal
 */
function resetAllOrders() {
    // Check if there are any orders to reset
    const hasOrders = persons.some(person => 
        Object.keys(person.orders).length > 0
    );
    
    if (!hasOrders) {
        alert('لا توجد طلبات لإعادة تعيينها');
        return;
    }
    
    document.getElementById('resetConfirmModal').classList.add('show');
}

/**
 * Close reset confirmation modal
 */
function closeResetConfirm() {
    document.getElementById('resetConfirmModal').classList.remove('show');
}

/**
 * Confirm and execute reset
 */
function confirmReset() {
    // Clear all orders for all persons
    persons.forEach(person => {
        person.orders = {};
    });
    
    // Clear completed persons
    completedPersons.clear();
    
    // Reset current selections
    resetAllQuantities();
    currentPersonId = null;
    
    // Update UI
    renderPersonsList();
    
    // Close modal
    closeResetConfirm();
    
    // Show success message
    alert('تم إعادة تعيين جميع الطلبات بنجاح');
}

/**
 * Finish all orders and generate combined order
 */
function finishAllOrders() {
    // Save current person's order if someone is selected
    if (currentPersonId) {
        saveCurrentPersonOrder();
        completedPersons.add(currentPersonId);
    }
    
    // Check if there are any orders
    const hasOrders = persons.some(person => 
        Object.keys(person.orders).length > 0
    );
    
    if (!hasOrders) {
        alert('الرجاء إضافة طلبات للأشخاص أولاً');
        return;
    }
    
    // Go back to person selection view if currently ordering
    if (currentPersonId) {
        currentPersonId = null;
        const tabsSection = document.querySelector('.tabs');
        const contentSection = document.querySelector('.content');
        const orderingBanner = document.getElementById('orderingBanner');
        const personsSection = document.getElementById('personsSection');
        
        tabsSection.classList.add('hidden');
        contentSection.classList.add('hidden');
        orderingBanner.style.display = 'none';
        personsSection.style.display = 'block';
        
        resetAllQuantities();
    }
    
    // Generate the complete order
    generatePersonsOrder();
}

// ─── Last Order Modal Logic ─────────────────────────────────────────────────

/** Open the confirmation modal showing what the last order was */
function openLastOrderModal(personId) {
    const lastOrder = loadLastOrder(personId);
    if (!lastOrder) return;

    const person = persons.find(p => p.id === personId);
    pendingLastOrderPersonId = personId;

    document.getElementById('lastOrderPersonLabel').textContent = 'الطلب السابق لـ ' + person.name;
    document.getElementById('lastOrderPreview').textContent = buildLastOrderPreview(lastOrder);
    document.getElementById('lastOrderModal').classList.add('show');
}

/** Close the last-order confirmation modal */
function closeLastOrderModal() {
    document.getElementById('lastOrderModal').classList.remove('show');
    pendingLastOrderPersonId = null;
}

/** User confirmed → load last order into this person's cart and open the menu */
function confirmApplyLastOrder() {
    if (pendingLastOrderPersonId === null) return;

    const personId = pendingLastOrderPersonId;
    closeLastOrderModal();

    const lastOrder = loadLastOrder(personId);
    if (!lastOrder) return;

    const person = persons.find(p => p.id === personId);

    // Merge: last order items are added ON TOP of whatever is already in the person's current order
    Object.keys(lastOrder).forEach(itemId => {
        if (!person.orders[itemId]) {
            person.orders[itemId] = { quantity: 0, hasExtras: false };
        }
        person.orders[itemId].quantity += lastOrder[itemId].quantity;
        if (lastOrder[itemId].hasExtras) {
            person.orders[itemId].hasExtras = true;
        }
    });

    // Now open that person's ordering view (same as clicking the card)
    selectPerson(personId);
}

