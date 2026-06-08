const SESSAO_STORAGE_KEY_NAV = "biblioteca_usuario_logado";
const RESERVAS_STORAGE_KEY_NAV = "biblioteca_reservas_teste";

document.addEventListener("DOMContentLoaded", mostrarUsuarioLogado);

// Mostra nome e foto do usuario logado no topo das telas internas.
function mostrarUsuarioLogado() {
    const nav = document.querySelector(".top-actions");
    const usuario = JSON.parse(localStorage.getItem(SESSAO_STORAGE_KEY_NAV) || "null");

    if (!nav || !usuario) return;

    const chip = document.createElement("div");
    chip.className = "user-chip";

    const foto = usuario.foto
        ? `<img src="${usuario.foto}" alt="Foto de ${usuario.nome}">`
        : `<span class="user-avatar">${obterIniciais(usuario.nome)}</span>`;

    chip.innerHTML = `
        ${foto}
        <div>
            <strong>${usuario.nome}</strong>
            <small>${usuario.instituicao || usuario.perfil || ""}</small>
        </div>
    `;

    nav.prepend(chip);

    if (usuario.perfil === "BIBLIOTECARIO") {
        nav.insertBefore(criarBotaoNotificacoes(), chip.nextSibling);
    }
}

// Cria o sino de notificacoes do bibliotecario com as reservas pendentes.
function criarBotaoNotificacoes() {
    const reservasPendentes = carregarReservasPendentes();
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "notification-button";
    botao.setAttribute("aria-label", "Abrir notificacoes de reservas");
    botao.onclick = abrirNotificacoesReservas;
    botao.innerHTML = `
        <span class="notification-icon">🔔</span>
        ${reservasPendentes > 0 ? `<span class="notification-count">${reservasPendentes}</span>` : ""}
    `;

    return botao;
}

// Envia o bibliotecario para a lista de reservas na tela de livros.
function abrirNotificacoesReservas() {
    window.location.href = "./livros.html#reservas";
}

function carregarReservasPendentes() {
    const reservas = JSON.parse(localStorage.getItem(RESERVAS_STORAGE_KEY_NAV) || "[]");
    return reservas.filter(reserva => reserva.status === "PENDENTE").length;
}

// Encerra a sessao local e volta para o login.
function sairDoSistema() {
    localStorage.removeItem(SESSAO_STORAGE_KEY_NAV);
    window.location.href = "./login.html";
}

// Tenta fechar a aba; se o navegador bloquear, volta para o login.
function fecharTela() {
    window.close();
    setTimeout(function () {
        if (!window.closed) {
            window.location.href = "./login.html";
        }
    }, 150);
}

function obterIniciais(nome) {
    return String(nome || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join("");
}
