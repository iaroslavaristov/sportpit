// ============================================
// НАСТРОЙКИ SUPABASE
// ============================================

const SUPABASE_URL = 'https://xhrsphorialopjzbrzks.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhocnNwaG9yaWFsb3BqemJyemtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzA1MjksImV4cCI6MjA4MTU0NjUyOX0.850HIvFKRcJwjN8g4-59YMrEMoAcovs0jsSEZROEi0g';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let currentUser = null;

// ============================================
// УТИЛИТЫ
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// ============================================
// ФУНКЦИИ АВТОРИЗАЦИИ
// ============================================

async function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('reg-first-name').value.trim();
    const lastName = document.getElementById('reg-last-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }

    const submitBtn = document.getElementById('submit-register');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone
                }
            }
        });

        if (error) throw error;

        if (data.user) {
            showNotification('Регистрация успешна! Проверьте почту для подтверждения.', 'success');
            closeModal('register-modal');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const submitBtn = document.getElementById('submit-login');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        showNotification('С возвращением!', 'success');
        closeModal('login-modal');
    } catch (error) {
        showNotification('Неверный email или пароль', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) showNotification('Ошибка при выходе', 'error');
}

async function handleSaveProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.classList.add('loading');

    try {
        const { error } = await supabase.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone
            }
        });

        if (error) throw error;
        showNotification('Профиль обновлен', 'success');
    } catch (error) {
        showNotification('Ошибка обновления', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.classList.remove('loading');
    }
}

// ============================================
// УПРАВЛЕНИЕ UI
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function updateUI(user) {
    const profileCard = document.getElementById('profile-card');
    const authStatus = document.getElementById('auth-status');
    
    if (user) {
        currentUser = user;
        profileCard.style.display = 'block';
        authStatus.style.display = 'none';
        
        document.getElementById('profile-name').textContent = `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`;
        document.getElementById('profile-email').textContent = user.email;
        
        document.getElementById('first-name').value = user.user_metadata.first_name || '';
        document.getElementById('last-name').value = user.user_metadata.last_name || '';
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.user_metadata.phone || '';
    } else {
        currentUser = null;
        profileCard.style.display = 'none';
        authStatus.style.display = 'block';
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => mainNav.classList.toggle('active'));
    }

    // Слушатели модалок
    document.getElementById('login-btn')?.addEventListener('click', () => openModal('login-modal'));
    document.getElementById('register-btn')?.addEventListener('click', () => openModal('register-modal'));
    document.getElementById('close-login')?.addEventListener('click', () => closeModal('login-modal'));
    document.getElementById('close-register')?.addEventListener('click', () => closeModal('register-modal'));
    
    // Формы
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('profile-form')?.addEventListener('submit', handleSaveProfile);
    
    // Выход
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Закрытие по клику на оверлей
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // Слушатель состояния авторизации (автоматически обновляет UI)
    supabase.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user || null);
    });
});
