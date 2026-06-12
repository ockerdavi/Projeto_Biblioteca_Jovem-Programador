// Lightweight glue file to keep login UI behavior separated from client management logic
const SESSAO_STORAGE_KEY = "biblioteca_usuario_logado";

function mostrarAba(aba) {
    const loginAtivo = aba === "login";
    document.getElementById("tab-login").classList.toggle("active", loginAtivo);
    document.getElementById("tab-cadastro").classList.toggle("active", !loginAtivo);
    document.getElementById("form-login").classList.toggle("hidden", !loginAtivo);
    document.getElementById("form-cadastro").classList.toggle("hidden", loginAtivo);
}

function fecharTela() {
    // On login page, "Fechar" should perform logout and redirect to index
    localStorage.removeItem(SESSAO_STORAGE_KEY);
    window.location.href = './index.html';
}

document.addEventListener('DOMContentLoaded', function () {
    // Always show the login tab when visiting the login page directly.
    // Do not auto-redirect logged users so the page can be used for login/cadastro.
    mostrarAba('login');
});
