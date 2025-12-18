// ============================================
// КЛЮЧИ SUPABASE (hardcoded для простоты и надежности)
// ============================================
const SUPABASE_URL = 'https://xhrsphorialopjzbrzks.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4OMhbEhuZaTsTNwU06vdaQ_HlaT4BT7';

// Инициализация Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Настраиваем слушатели и интерфейс
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => mainNav.classList.toggle('active'));
    }

    document.getElementById('login-btn')?.addEventListener('click', () => openModal('login-modal'));
    document.getElementById('register-btn')?.addEventListener('click', () => openModal('register-modal'));
    document.getElementById('close-login')?.addEventListener('click', () => closeModal('login-modal'));
    document.getElementById('close-register')?.addEventListener('click', () => closeModal('register-modal'));
    
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('profile-form')?.addEventListener('submit', handleSaveProfile);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // Слушатель состояния авторизации
    supabase.auth.onAuthStateChange((event, session) => {
        updateUI(session?.user || null);
    });

    // Инициальная проверка сессии
    checkSession();
});

async function checkSession() {
    const { data: { user } } = await supabase.auth.getUser();
    updateUI(user);
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const submitBtn = document.getElementById('submit-login');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        showNotification('С возвращением!', 'success');
        closeModal('login-modal');
    } catch (error) {
        showNotification(error.message || 'Неверный email или пароль', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

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

async function handleSaveProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    const submitBtn = document.getElementById('save-btn');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone
            }
        });

        if (error) throw error;

        showNotification('Профиль обновлен!', 'success');
        updateUI(data.user); // Обновляем UI после сохранения
    } catch (error) {
        showNotification(error.message || 'Ошибка сохранения профиля', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        showNotification('Вы вышли из системы', 'info');
    } catch (error) {
        showNotification(error.message || 'Ошибка выхода', 'error');
    }
}

function updateUI(user) {
    const profileCard = document.getElementById('profile-card');
    const authStatus = document.getElementById('auth-status');

    if (user) {
        profileCard.style.display = 'block';
        authStatus.style.display = 'none';

        const fullName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'Пользователь';
        document.getElementById('profile-name').textContent = fullName;
        document.getElementById('profile-email').textContent = user.email;

        document.getElementById('first-name').value = user.user_metadata?.first_name || '';
        document.getElementById('last-name').value = user.user_metadata?.last_name || '';
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.user_metadata?.phone || '';
    } else {
        profileCard.style.display = 'none';
        authStatus.style.display = 'block';
    }
}

// Функции для модалок и уведомлений (из вашего оригинального кода, без изменений)
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}