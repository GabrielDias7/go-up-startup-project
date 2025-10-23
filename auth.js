// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4NJ2LB6ZTkxqC6mLpBAOfhMdRamraXPY",
  authDomain: "go-upx.firebaseapp.com",
  projectId: "go-upx",
  storageBucket: "go-upx.firebasestorage.app",
  messagingSenderId: "1005492650531",
  appId: "1:1005492650531:web:3084d0e98a6818d03b2796",
  measurementId: "G-XTLTNL7B44"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginCard = document.querySelector('.login-card');
const registerCard = document.querySelector('.register-card');
const registerError = document.getElementById('register-error');
const loginError = document.getElementById('login-error');
const showPasswordReset = document.getElementById('show-password-reset');
const passwordResetCard = document.querySelector('.password-reset-card');
const passwordResetForm = document.getElementById('password-reset-form');
const passwordResetError = document.getElementById('password-reset-error');
const passwordResetSuccess = document.getElementById('password-reset-success');
const showLoginFromReset = document.getElementById('show-login-from-reset');

// Toggle between login and register forms
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'block';
    registerCard.style.display = 'none';
    passwordResetCard.style.display = 'none'; // Garante que o card de redefinição de senha esteja oculto
    clearFormError(registerError);
    clearFormError(passwordResetError);
    clearFormSuccess(passwordResetSuccess);
});

showPasswordReset.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'none';
    passwordResetCard.style.display = 'block';
    clearFormError(loginError);
    clearFormError(registerError);
    clearFormError(passwordResetError);
    clearFormSuccess(passwordResetSuccess);
});

showLoginFromReset.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'block';
    registerCard.style.display = 'none';
    passwordResetCard.style.display = 'none';
    clearFormError(passwordResetError);
    clearFormSuccess(passwordResetSuccess);
});

function showFormError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function clearFormError(element) {
    element.style.display = 'none';
}

function showFormSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.style.color = 'var(--success-color)'; // Usa a cor de sucesso definida no CSS
}

function clearFormSuccess(element) {
    element.style.display = 'none';
}

// Login event
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError(loginError);
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            window.location.href = 'index.html';
        })
        .catch((error) => {
            showFormError(loginError, "Email ou senha inválidos. Tente novamente.");
        });
});

// Register event
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError(registerError); // Limpa erros anteriores

    const email = registerForm['register-email'].value;
    const password = registerForm['register-password'].value;
    const confirmPassword = registerForm['register-confirm-password'].value;

    // Reset input styles
    registerForm['register-password'].parentElement.classList.remove('error');
    registerForm['register-confirm-password'].parentElement.classList.remove('error');

    if (password.length < 6) {
        showFormError(registerError, 'A senha deve ter pelo menos 6 caracteres.');
        registerForm['register-password'].parentElement.classList.add('error');
        return;
    }

    if (password !== confirmPassword) {
        showFormError(registerError, 'As senhas não coincidem. Tente novamente.');
        registerForm['register-password'].parentElement.classList.add('error');
        registerForm['register-confirm-password'].parentElement.classList.add('error');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registered and signed in
            window.location.href = 'index.html';
        })
        .catch((error) => {
            showFormError(registerError, 'Não foi possível criar a conta. ' + error.message);
        });
});

// Password Reset event
passwordResetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError(passwordResetError);
    clearFormSuccess(passwordResetSuccess);

    const email = passwordResetForm['reset-email'].value;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            showFormSuccess(passwordResetSuccess, 'Um email de redefinição de senha foi enviado para ' + email + '. Verifique sua caixa de entrada e a pasta de spam.');
            passwordResetForm.reset(); // Limpa o campo de email
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found') {
                showFormError(passwordResetError, 'Nenhuma conta encontrada com este endereço de e-mail.');
            } else {
                showFormError(passwordResetError, 'Erro ao enviar email de redefinição. Tente novamente mais tarde.');
                console.error("Password Reset Error:", error); // Log do erro para depuração
            }
        });
});

// Animated Background with tsParticles
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('ecoTrocaTheme') || 'light';
    document.body.classList.toggle('dark-theme', currentTheme === 'dark');
    
    // Set theme on body for login page as well
    const setTheme = (theme) => {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem('ecoTrocaTheme', theme);
    };
});
