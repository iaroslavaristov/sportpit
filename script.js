// ============================================
// ОБЩИЕ ФУНКЦИИ ДЛЯ ВСЕХ СТРАНИЦ
// ============================================

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initWishlistButtons(); // Для кнопок добавления в вишлист
    
    // Проверяем, на какой странице находимся
    if (document.querySelector('.filter-buttons')) {
        initCatalogFilter();
    }
    
    if (document.querySelector('.nav-link')) {
        initNavigation();
    }
    
    // Инициализация кликов по карточкам товаров
    initProductCards();
    
    // Инициализация счетчика вишлиста
    setTimeout(updateWishlistCount, 100);
    
    // Проверяем, находимся ли на странице вишлиста
    if (document.querySelector('.wishlist-header')) {
        initWishlistPage(); // Инициализация страницы вишлиста
    }
});

// ============================================
// МОБИЛЬНОЕ МЕНЮ
// ============================================

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            if (!nav.contains(event.target) && !mobileMenuBtn.contains(event.target) && nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        });
    }
}

// ============================================
// НАВИГАЦИЯ
// ============================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        // Определяем активную ссылку на основе текущей страницы
        const linkHref = link.getAttribute('href');
        if ((currentPage === 'index.html' && linkHref === 'index.html') ||
            (currentPage === 'catalog.html' && linkHref === 'catalog.html') ||
            (currentPage === 'wishlist.html' && linkHref === 'wishlist.html') ||
            (currentPage === linkHref && linkHref !== '#')) {
            link.classList.add('active');
        }
        
        link.addEventListener('click', function(e) {
            // Убираем активный класс у всех ссылок
            navLinks.forEach(item => item.classList.remove('active'));
            
            // Добавляем активный класс к текущей ссылке
            this.classList.add('active');
            
            // Закрываем мобильное меню при клике на ссылку
            if (window.innerWidth <= 768) {
                const nav = document.querySelector('.nav');
                if (nav) nav.classList.remove('active');
            }
            
            // Если ссылка ведет на ту же страницу, предотвращаем переход
            if (linkHref === '#' || linkHref === currentPage) {
                e.preventDefault();
            }
        });
    });
}

// ============================================
// ВИШЛИСТ - КНОПКИ ДОБАВЛЕНИЯ В ВИШЛИСТ (для каталога и главной)
// ============================================

function initWishlistButtons() {
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    
    wishlistButtons.forEach(button => {
        // Загружаем состояние вишлиста из localStorage
        const productId = getProductId(button);
        if (isInWishlist(productId)) {
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.style.color = '#e74c3c';
            }
        }
        
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            const productId = getProductId(this);
            
            if (icon.classList.contains('far')) {
                // Добавляем в вишлист
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.color = '#e74c3c';
                addToWishlist(productId);
                
                // Получаем информацию о товаре для уведомления
                const productCard = this.closest('.product-card');
                const productName = productCard?.querySelector('h3')?.textContent || 'Товар';
                
                showNotification(`Товар "${productName}" добавлен в вишлист!`, 'success');
            } else {
                // Удаляем из вишлиста
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.color = '#e74c3c';
                removeFromWishlist(productId);
                
                showNotification(`Товар удален из вишлиста!`, 'success');
            }
        });
    });
}

// ============================================
// ФИЛЬТРАЦИЯ КАТАЛОГА
// ============================================

function initCatalogFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categorySections = document.querySelectorAll('.category-section');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс к текущей кнопке
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Показываем/скрываем категории
            categorySections.forEach(section => {
                if (category === 'all') {
                    showCategory(section);
                } else {
                    if (section.id === category) {
                        showCategory(section);
                    } else {
                        hideCategory(section);
                    }
                }
            });
            
            // Прокручиваем к началу каталога
            const catalogSection = document.querySelector('.catalog');
            if (catalogSection) {
                catalogSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Инициализируем анимации
    setTimeout(() => {
        categorySections.forEach(section => {
            section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        });
    }, 100);
}

function showCategory(section) {
    section.classList.remove('hidden');
    setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }, 10);
}

function hideCategory(section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    setTimeout(() => {
        section.classList.add('hidden');
    }, 300);
}

// ============================================
// КАРТОЧКИ ТОВАРОВ
// ============================================

function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Не переходим по карточке, если кликнули на кнопку вишлиста
            if (!e.target.closest('.add-to-wishlist')) {
                const productId = getProductId(this) || '1';
                console.log(`Переход на страницу товара ID: ${productId}`);
                // В будущем: window.location.href = `product.html?id=${productId}`;
            }
        });
    });
}

// ============================================
// УТИЛИТЫ ВИШЛИСТА (LocalStorage)
// ============================================

function getProductId(element) {
    // Генерируем ID на основе данных продукта
    const productCard = element.closest('.product-card');
    if (!productCard) return Math.random().toString(36).substr(2, 9);
    
    const brand = productCard.querySelector('.brand')?.textContent || '';
    const name = productCard.querySelector('h3')?.textContent || '';
    return btoa(`${brand}-${name}`).substr(0, 20); // Простой хэш
}

function getWishlist() {
    const wishlist = localStorage.getItem('sportfuel_wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

function saveWishlist(wishlist) {
    localStorage.setItem('sportfuel_wishlist', JSON.stringify(wishlist));
}

function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
}

function addToWishlist(productId) {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        saveWishlist(wishlist);
        updateWishlistCount();
    }
}

function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    saveWishlist(wishlist);
    updateWishlistCount();
}

function updateWishlistCount() {
    const wishlist = getWishlist();
    const wishlistLinks = document.querySelectorAll('a[href*="wishlist"], .nav-link[href*="wishlist"]');
    
    wishlistLinks.forEach(link => {
        // Удаляем старый счетчик если есть
        const oldCounter = link.querySelector('.wishlist-counter');
        if (oldCounter) oldCounter.remove();
        
        if (wishlist.length > 0) {
            const counter = document.createElement('span');
            counter.className = 'wishlist-counter';
            counter.textContent = wishlist.length;
            counter.style.cssText = `
                background-color: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                margin-left: 5px;
            `;
            link.appendChild(counter);
        }
    });
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================

function showNotification(message, type = 'success') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(notification => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    
    // Стили в зависимости от типа
    const bgColor = type === 'success' ? '#2ecc71' : 
                    type === 'error' ? '#e74c3c' : 
                    type === 'info' ? '#3498db' : '#2ecc71';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 300px;
        word-break: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Добавляем стили для анимации, если их еще нет
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Отображение текущего года в футере
function updateCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Обновляем год при загрузке
updateCurrentYear();

// Обработка ошибок загрузки изображений
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const parent = this.parentElement;
            if (parent && parent.classList.contains('product-img')) {
                const fallbackIcon = document.createElement('i');
                fallbackIcon.className = 'fas fa-jar';
                fallbackIcon.style.cssText = `
                    font-size: 60px;
                    color: #3498db;
                `;
                parent.appendChild(fallbackIcon);
            }
        });
    });
});

// Плавная прокрутка для всех внутренних ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// ФУНКЦИИ ДЛЯ СТРАНИЦЫ ВИШЛИСТА
// ============================================

// Инициализация страницы вишлиста
function initWishlistPage() {
    if (!document.querySelector('.wishlist-header')) return;
    
    // Загружаем и отображаем вишлист
    loadWishlistItems();
    
    // Инициализируем кнопки управления вишлистом
    initWishlistPageButtons();
    
    // Загружаем рекомендуемые товары
    loadRecommendedItems();
    
    // Инициализируем модальное окно заказа
    initOrderModal();
}

// Загрузка товаров из вишлиста
function loadWishlistItems() {
    const wishlist = getWishlist();
    const container = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('empty-wishlist');
    const itemsContainer = document.getElementById('wishlist-items-container');
    const summary = document.getElementById('wishlist-summary');
    
    if (!container || !emptyState || !itemsContainer || !summary) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Если вишлист пуст
    if (wishlist.length === 0) {
        emptyState.classList.add('active');
        itemsContainer.classList.remove('active');
        summary.style.display = 'none';
        updateWishlistStats(0, 0, 0);
        return;
    }
    
    // Показываем контейнер с товарами
    emptyState.classList.remove('active');
    itemsContainer.classList.add('active');
    summary.style.display = 'block';
    
    let totalPrice = 0;
    let itemsCount = 0;
    
    // Массив для хранения данных о товарах
    const wishlistItems = [];
    
    // Загружаем данные о каждом товаре
    wishlist.forEach((productId, index) => {
        // В реальном приложении здесь был бы запрос к БД
        // Для демонстрации создаем mock-товары
        const mockProduct = createMockProduct(productId, index);
        wishlistItems.push(mockProduct);
        totalPrice += mockProduct.price;
        itemsCount++;
        
        // Создаем элемент товара
        const itemElement = createWishlistItemElement(mockProduct);
        container.appendChild(itemElement);
    });
    
    // Обновляем статистику
    updateWishlistStats(itemsCount, totalPrice, totalPrice / itemsCount);
    
    // Сохраняем текущий список товаров для сортировки
    window.currentWishlistItems = wishlistItems;
    
    // Инициализируем обработчики для созданных кнопок
    initWishlistItemButtons();
}

// Создание mock-товара (в реальном приложении данные из БД)
function createMockProduct(productId, index) {
    const brands = ['Optimum Nutrition', 'Dymatize', 'BSN', 'MuscleTech', 'MyProtein', 'Rule 1'];
    const products = [
        { name: 'Gold Standard 100% Whey', desc: 'Сывороточный протеин с быстрым усвоением', price: 4299, weight: '2.27 кг', flavor: 'Шоколад' },
        { name: 'ISO100 Hydrolyzed', desc: 'Гидролизат сывороточного протеина', price: 5199, weight: '1.8 кг', flavor: 'Ваниль' },
        { name: 'Syntha-6 Protein Powder', desc: 'Мультикомпонентный протеин', price: 3999, weight: '2.27 кг', flavor: 'Печенье и сливки' },
        { name: 'Nitro-Tech Whey Gold', desc: 'Сывороточный протеин с креатином', price: 4899, weight: '1.8 кг', flavor: 'Молочный шоколад' },
        { name: 'C4 Original Pre-Workout', desc: 'Предтренировочный комплекс', price: 2499, weight: '420 г', flavor: 'Арбуз' },
        { name: 'Hydroxycut Hardcore Elite', desc: 'Термогенный жиросжигатель', price: 2299, weight: '180 капсул', flavor: '-' },
        { name: 'Opti-Men Multivitamin', desc: 'Мультивитамины для мужчин', price: 1899, weight: '180 таблеток', flavor: '-' },
        { name: 'Animal Pak Multivitamin', desc: 'Комплекс витаминов и аминокислот', price: 2499, weight: '44 пакета', flavor: '-' }
    ];
    
    const brandIndex = index % brands.length;
    const productIndex = index % products.length;
    
    return {
        id: productId,
        brand: brands[brandIndex],
        name: products[productIndex].name,
        description: products[productIndex].desc,
        price: products[productIndex].price,
        weight: products[productIndex].weight,
        flavor: products[productIndex].flavor,
        image: `https://m.media-amazon.com/images/I/${['71C2qPA+JQL', '71aBX+gvljL', '71L60+mrTXL'][index % 3]}._AC_SL1500_.jpg`,
        addedDate: new Date(Date.now() - index * 86400000) // Разные даты для сортировки
    };
}

// Создание элемента товара для вишлиста
function createWishlistItemElement(product) {
    const item = document.createElement('div');
    item.className = 'wishlist-item';
    item.dataset.id = product.id;
    
    item.innerHTML = `
        <div class="wishlist-item-img">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="wishlist-item-info">
            <span class="wishlist-item-brand">${product.brand}</span>
            <h3 class="wishlist-item-title">${product.name}</h3>
            <p class="wishlist-item-description">${product.description}</p>
            <div class="wishlist-item-details">
                <span class="weight">${product.weight}</span>
                <span class="flavor">${product.flavor}</span>
            </div>
        </div>
        <div class="wishlist-item-actions">
            <div class="wishlist-item-price">${product.price.toLocaleString('ru-RU')} ₽</div>
            <div class="wishlist-item-buttons">
                <button class="btn-remove" title="Удалить из вишлиста" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-move-to-cart" title="Добавить в корзину" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <a href="catalog.html" class="btn-view" title="Посмотреть в каталоге">
                    <i class="fas fa-eye"></i>
                </a>
            </div>
        </div>
    `;
    
    return item;
}

// Инициализация кнопок на странице вишлиста (УПРАВЛЕНИЕ ВИШЛИСТОМ)
function initWishlistPageButtons() {
    // Кнопка очистки вишлиста
    const clearBtn = document.getElementById('clear-wishlist');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите очистить весь вишлист?')) {
                localStorage.removeItem('sportfuel_wishlist');
                loadWishlistItems();
                updateWishlistCount();
                showNotification('Вишлист очищен', 'success');
            }
        });
    }
    
    // Кнопка добавления всех в корзину
    const addAllBtn = document.getElementById('add-all-to-cart');
    if (addAllBtn) {
        addAllBtn.addEventListener('click', function() {
            const wishlist = getWishlist();
            if (wishlist.length === 0) {
                showNotification('Вишлист пуст', 'info');
                return;
            }
            
            // В реальном приложении здесь был бы запрос к API
            showNotification(`${wishlist.length} товаров добавлены в корзину`, 'success');
            console.log('Товары добавлены в корзину:', wishlist);
        });
    }
    
    // Кнопка купить все - теперь открывает модальное окно
    const buyAllBtn = document.getElementById('buy-all');
    if (buyAllBtn) {
        // Убираем старый обработчик и оставляем только для открытия модалки
        buyAllBtn.removeEventListener('click', buyAllBtn._oldClickHandler);
        buyAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const wishlist = getWishlist();
            if (wishlist.length === 0) {
                showNotification('Вишлист пуст. Добавьте товары для оформления заказа.', 'info');
                return;
            }
            
            // Открытие модального окна будет обработано в initOrderModal()
        });
    }
    
    // Сортировка
    const sortSelect = document.getElementById('sort-wishlist');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortWishlistItems(this.value);
        });
    }
}

// Инициализация кнопок на элементах вишлиста
function initWishlistItemButtons() {
    // Кнопки удаления
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.dataset.id;
            
            if (confirm('Удалить товар из вишлиста?')) {
                removeFromWishlist(productId);
                loadWishlistItems();
                updateWishlistCount();
                showNotification('Товар удален из вишлиста', 'success');
            }
        });
    });
    
    // Кнопки добавления в корзину
    document.querySelectorAll('.btn-move-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.dataset.id;
            
            // В реальном приложении здесь был бы запрос к API
            showNotification('Товар добавлен в корзину', 'success');
            console.log('Товар добавлен в корзину:', productId);
        });
    });
}

// Сортировка товаров в вишлисте
function sortWishlistItems(sortBy) {
    const container = document.getElementById('wishlist-grid');
    if (!container || !window.currentWishlistItems) return;
    
    let sortedItems = [...window.currentWishlistItems];
    
    switch(sortBy) {
        case 'date':
            sortedItems.sort((a, b) => b.addedDate - a.addedDate);
            break;
        case 'date-old':
            sortedItems.sort((a, b) => a.addedDate - b.addedDate);
            break;
        case 'price-low':
            sortedItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedItems.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-reverse':
            sortedItems.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    // Обновляем отображение
    container.innerHTML = '';
    sortedItems.forEach(product => {
        const itemElement = createWishlistItemElement(product);
        container.appendChild(itemElement);
    });
    
    // Инициализируем кнопки на новых элементах
    initWishlistItemButtons();
    
    showNotification('Сортировка применена', 'info');
}

// Обновление статистики вишлиста
function updateWishlistStats(count, total, average) {
    // Обновляем заголовок
    const countElement = document.getElementById('wishlist-count');
    const priceElement = document.getElementById('total-price');
    const avgElement = document.getElementById('average-price');
    
    if (countElement) countElement.textContent = count;
    if (priceElement) priceElement.textContent = total.toLocaleString('ru-RU') + ' ₽';
    if (avgElement) avgElement.textContent = average.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
    
    // Обновляем итоговую информацию
    const summaryCount = document.getElementById('summary-count');
    const summaryTotal = document.getElementById('summary-total');
    const summaryAverage = document.getElementById('summary-average');
    
    if (summaryCount) summaryCount.textContent = count;
    if (summaryTotal) summaryTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';
    if (summaryAverage) summaryAverage.textContent = average.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽';
}

// Загрузка рекомендуемых товаров
function loadRecommendedItems() {
    const container = document.getElementById('recommended-grid');
    if (!container) return;
    
    // Mock-данные рекомендуемых товаров
    const recommendedProducts = [
        { name: 'Whey Protein Isolate', brand: 'MuscleTech', price: 4599, image: 'https://m.media-amazon.com/images/I/71inbYSIqYL._AC_SL1500_.jpg' },
        { name: 'Pre-Workout Explosion', brand: 'BSN', price: 2799, image: 'https://m.media-amazon.com/images/I/71L60+mrTXL._AC_SL1500_.jpg' },
        { name: 'Omega-3 Fish Oil', brand: 'NOW Foods', price: 1299, image: 'https://m.media-amazon.com/images/I/81NED7c1nuL._AC_SL1500_.jpg' },
        { name: 'Mass Gainer XXL', brand: 'Optimum Nutrition', price: 5899, image: 'https://m.media-amazon.com/images/I/71C2qPA+JQL._AC_SL1500_.jpg' }
    ];
    
    container.innerHTML = '';
    
    recommendedProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'recommended-item';
        
        item.innerHTML = `
            <div class="recommended-item-img">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="recommended-item-info">
                <span class="brand" style="font-size: 12px; color: #3498db; font-weight: 600; display: block; margin-bottom: 5px;">${product.brand}</span>
                <h3 class="recommended-item-title">${product.name}</h3>
                <div class="recommended-item-price">${product.price.toLocaleString('ru-RU')} ₽</div>
                <div class="recommended-item-actions">
                    <button class="add-to-wishlist" style="background: none; border: none; font-size: 20px; color: #e74c3c; cursor: pointer;">
                        <i class="far fa-heart"></i>
                    </button>
                    <a href="catalog.html" class="btn" style="padding: 8px 15px; font-size: 14px;">Подробнее</a>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Инициализируем кнопки вишлиста на рекомендуемых товарах
    initWishlistButtons();
}

// ============================================
// МОДАЛЬНОЕ ОКНО ОФОРМЛЕНИЯ ЗАКАЗА
// ============================================

// Инициализация модального окна заказа
function initOrderModal() {
    const modal = document.getElementById('order-modal');
    const buyAllBtn = document.getElementById('buy-all');
    const modalClose = document.getElementById('modal-close');
    const cancelOrder = document.getElementById('cancel-order');
    const submitOrder = document.getElementById('submit-order');
    const continueShopping = document.getElementById('continue-shopping');
    const orderForm = document.getElementById('order-form');
    
    if (!modal || !buyAllBtn) return;
    
    // Открытие модального окна
    buyAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const wishlist = getWishlist();
        if (wishlist.length === 0) {
            showNotification('Вишлист пуст. Добавьте товары для оформления заказа.', 'info');
            return;
        }
        
        // Рассчитываем стоимость
        let totalPrice = 0;
        if (window.currentWishlistItems) {
            window.currentWishlistItems.forEach(item => {
                totalPrice += item.price;
            });
        } else {
            // Если currentWishlistItems не определен, пересчитываем
            const items = getWishlist();
            items.forEach((itemId, index) => {
                const mockProduct = createMockProduct(itemId, index);
                totalPrice += mockProduct.price;
            });
        }
        
        // Обновляем информацию в модальном окне
        updateOrderModalInfo(wishlist.length, totalPrice);
        
        // Сбрасываем форму и показываем её
        resetOrderForm();
        
        // Показываем модальное окно
        openModal(modal);
    });
    
    // Закрытие модального окна
    if (modalClose) {
        modalClose.addEventListener('click', () => closeModal(modal));
    }
    
    if (cancelOrder) {
        cancelOrder.addEventListener('click', () => closeModal(modal));
    }
    
    // Продолжить покупки после успешного заказа
    if (continueShopping) {
        continueShopping.addEventListener('click', () => {
            closeModal(modal);
            window.location.href = 'catalog.html';
        });
    }
    
    // Клик по overlay для закрытия
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Отправка формы заказа
    if (submitOrder && orderForm) {
        submitOrder.addEventListener('click', function(e) {
            e.preventDefault();
            processOrderForm(orderForm, modal);
        });
        
        // Также обрабатываем отправку формы через Enter
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processOrderForm(orderForm, modal);
        });
    }
    
    // Валидация полей формы в реальном времени
    initFormValidation();
}

// Обновление информации в модальном окне
function updateOrderModalInfo(itemCount, totalPrice) {
    const itemCountEl = document.getElementById('modal-item-count');
    const totalPriceEl = document.getElementById('modal-total-price');
    const paymentAmountEl = document.getElementById('modal-payment-amount');
    
    if (itemCountEl) itemCountEl.textContent = itemCount;
    if (totalPriceEl) totalPriceEl.textContent = totalPrice.toLocaleString('ru-RU') + ' ₽';
    if (paymentAmountEl) paymentAmountEl.textContent = totalPrice.toLocaleString('ru-RU') + ' ₽';
}

// Открытие модального окна
function openModal(modal) {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// Закрытие модального окна
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        document.body.style.overflow = 'auto';
    }, 300);
}

// Сброс формы заказа
function resetOrderForm() {
    const form = document.getElementById('order-form');
    const successMessage = document.getElementById('order-success');
    const modalFooter = document.querySelector('.modal-footer');
    
    if (form) {
        form.reset();
        form.style.display = 'block';
    }
    if (successMessage) successMessage.classList.remove('active');
    if (modalFooter) modalFooter.style.display = 'flex';
    
    // Скрываем все ошибки
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });
    
    // Убираем классы ошибок с полей
    document.querySelectorAll('.form-control.error').forEach(field => {
        field.classList.remove('error');
    });
    
    // Активируем кнопку отправки
    const submitBtn = document.getElementById('submit-order');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Подтвердить заказ';
        submitBtn.classList.remove('loading');
    }
}

// Инициализация валидации формы
function initFormValidation() {
    const formFields = document.querySelectorAll('#order-form .form-control[required]');
    
    formFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            // Убираем ошибку при вводе
            const errorId = this.id + '-error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.classList.remove('show');
                this.classList.remove('error');
            }
        });
    });
}

// Валидация отдельного поля
function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    const errorElement = document.getElementById(fieldId + '-error');
    
    let isValid = true;
    let errorMessage = '';
    
    switch(fieldId) {
        case 'first-name':
        case 'last-name':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Минимум 2 символа';
            } else if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Только буквы, пробелы и дефисы';
            }
            break;
            
        case 'phone':
            const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
            if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                isValid = false;
                errorMessage = 'Введите корректный номер телефона';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введите корректный email адрес';
            }
            break;
    }
    
    if (!isValid && errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        field.classList.add('error');
    } else {
        if (errorElement) errorElement.classList.remove('show');
        field.classList.remove('error');
    }
    
    return isValid;
}

// Проверка всей формы
function validateForm(form) {
    const requiredFields = form.querySelectorAll('.form-control[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Проверка чекбокса политики конфиденциальности
    const privacyCheckbox = document.getElementById('privacy-policy');
    if (privacyCheckbox && !privacyCheckbox.checked) {
        isValid = false;
        showNotification('Пожалуйста, согласитесь с политикой конфиденциальности', 'error');
    }
    
    return isValid;
}

// Обработка отправки формы заказа
function processOrderForm(form, modal) {
    // Проверяем валидность формы
    if (!validateForm(form)) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    // Получаем данные из формы
    const formData = {
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        comment: document.getElementById('comment').value.trim(),
        orderItems: getWishlist(),
        orderDate: new Date().toISOString(),
        orderTotal: calculateOrderTotal()
    };
    
    // Показываем состояние загрузки
    const submitBtn = document.getElementById('submit-order');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
    }
    
    // Имитация отправки на сервер (в реальном приложении здесь был бы fetch/axios)
    setTimeout(() => {
        // Генерируем номер заказа
        const orderNumber = 'SF-' + new Date().getFullYear() + '-' + 
                          String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        
        // Показываем сообщение об успехе
        showOrderSuccess(orderNumber, formData);
        
        // Сохраняем заказ в localStorage (для истории)
        saveOrderToHistory(orderNumber, formData);
        
        // Очищаем вишлист после успешного заказа
        localStorage.removeItem('sportfuel_wishlist');
        updateWishlistCount();
        
        // Обновляем страницу вишлиста, если мы на ней
        if (document.querySelector('.wishlist-header')) {
            loadWishlistItems();
        }
        
        showNotification('Заказ успешно оформлен!', 'success');
        
        // Восстанавливаем кнопку
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }, 1500);
}

// Расчет общей суммы заказа
function calculateOrderTotal() {
    let total = 0;
    if (window.currentWishlistItems) {
        window.currentWishlistItems.forEach(item => {
            total += item.price;
        });
    }
    return total;
}

// Показ сообщения об успешном заказе
function showOrderSuccess(orderNumber, formData) {
    const orderSuccess = document.getElementById('order-success');
    const orderNumberEl = document.getElementById('order-number');
    const form = document.getElementById('order-form');
    
    if (orderSuccess && orderNumberEl && form) {
        // Обновляем номер заказа
        orderNumberEl.textContent = `Заказ №${orderNumber}`;
        
        // Показываем сообщение об успехе, скрываем форму
        form.style.display = 'none';
        orderSuccess.classList.add('active');
        
        // Обновляем кнопки в футере модального окна
        const modalFooter = document.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.style.display = 'none';
        }
    }
    
    // В реальном приложении здесь бы отправлялись данные на сервер
    console.log('Заказ оформлен:', {
        orderNumber,
        ...formData,
        orderTotal: calculateOrderTotal()
    });
}

// Сохранение заказа в историю (localStorage)
function saveOrderToHistory(orderNumber, formData) {
    const orders = JSON.parse(localStorage.getItem('sportfuel_orders') || '[]');
    
    const order = {
        id: orderNumber,
        date: new Date().toISOString(),
        items: window.currentWishlistItems || [],
        total: calculateOrderTotal(),
        customer: {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            email: formData.email
        },
        status: 'pending' // В ожидании обработки
    };
    
    orders.push(order);
    localStorage.setItem('sportfuel_orders', JSON.stringify(orders));
}