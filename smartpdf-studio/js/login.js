const loginBtn = document.getElementById('loginBtn');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            alert('Bitte E-Mail und Passwort ausfüllen.');
            return;
        }

        alert('Login ist vorbereitet, aber in Phase 2 noch deaktiviert.');
    });
}