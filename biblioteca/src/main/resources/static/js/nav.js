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
        ? `<img src="${usuario.foto}" alt="Foto de ${usuario.nomeCompleto || usuario.nome}">`
        : `<span class="user-avatar">${obterIniciais(usuario.nomeCompleto || usuario.nome)}</span>`;

    chip.innerHTML = `
        ${foto}
        <div>
            <strong>${usuario.nomeCompleto || usuario.nome}</strong>
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

// ============================================
// FUNÇÕES DE LOGOUT CORRIGIDAS
// ============================================

// Função principal para fazer logout e sair do sistema
function sairDoSistema() {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
        // Remove os dados da sessão
        localStorage.removeItem(SESSAO_STORAGE_KEY_NAV);
        
        // Opcional: limpar também as reservas se quiser
        // localStorage.removeItem(RESERVAS_STORAGE_KEY_NAV);
        
        // Redireciona para a tela de login
        window.location.href = "./login.html";
    }
}

// Função chamada pelo botão "Fechar" ou "Sair"
function fecharTela() {
    if (confirm("Deseja realmente sair do sistema?")) {
        // Remove o usuário logado
        localStorage.removeItem(SESSAO_STORAGE_KEY_NAV);
        
        // Redireciona para o login
        window.location.href = "./login.html";
    }
}

// Função alternativa (tenta fechar a aba, mas se não conseguir, faz logout)
function fecharOuSair() {
    // Primeiro faz o logout
    localStorage.removeItem(SESSAO_STORAGE_KEY_NAV);
    
    // Tenta fechar a janela
    // window.close() não funciona sempre em navegadores modernos quando a página não foi aberta por script.
    // Em vez disso, redirecionamos para a tela de login para garantir comportamento consistente.
    window.location.href = "./login.html";
}

function obterIniciais(nome) {
    if (!nome) return "U";
    return String(nome)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join("");
}