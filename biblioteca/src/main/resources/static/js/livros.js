// Endpoint do backend Spring Boot para o modulo de livros.
const API_BASE_URL = window.location.port === "5500" ? "http://localhost:8080" : "";
const API_URL = `${API_BASE_URL}/api/livros`;
const SESSAO_STORAGE_KEY = "biblioteca_usuario_logado";
const RESERVAS_STORAGE_KEY = "biblioteca_reservas_teste";

const formLivro = document.getElementById("form-livro");
const tabelaLivrosBody = document.querySelector("#tabela-livros tbody");
const campoBuscaLivro = document.getElementById("busca-livro");

let livrosCache = [];
let usuarioLogado = null;

document.addEventListener("DOMContentLoaded", inicializarTelaLivros);

if (formLivro) {
    formLivro.addEventListener("submit", function (event) {
        event.preventDefault();
        salvarLivro();
    });
}

if (campoBuscaLivro) {
    campoBuscaLivro.addEventListener("input", function () {
        renderizarLivros(livrosCache);
    });
}

// Configura a tela conforme o perfil logado.
function inicializarTelaLivros() {
    usuarioLogado = JSON.parse(localStorage.getItem(SESSAO_STORAGE_KEY) || "null");
    configurarTelaPorPerfil();
    listarLivros();
    renderizarReservasBibliotecario();
    renderizarNotificacoesAluno();
    destacarReservasAoAbrir();
}

function configurarTelaPorPerfil() {
    const perfil = usuarioLogado?.perfil || "BIBLIOTECARIO";
    const aluno = perfil === "ALUNO";

    document.getElementById("area-form-livro")?.classList.toggle("hidden", aluno);
    document.getElementById("area-busca-aluno")?.classList.toggle("hidden", !aluno);
    document.getElementById("area-notificacoes-aluno")?.classList.toggle("hidden", !aluno);
    document.getElementById("area-reservas-bibliotecario")?.classList.toggle("hidden", aluno);

    const tituloPagina = document.getElementById("titulo-pagina");
    if (tituloPagina) {
        tituloPagina.innerText = aluno ? "Pesquisa e Reserva de Livros" : "Dashboard Biblioteca";
    }
}

// Busca os livros no backend e atualiza a tabela.
async function listarLivros() {
    if (!tabelaLivrosBody) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao buscar dados da API");

        livrosCache = await response.json();
        renderizarLivros(livrosCache);
    } catch (error) {
        console.error("Erro ao listar livros:", error);
        alert("Nao foi possivel conectar a API. Verifique se o Back-End esta rodando.");
    }
}

function renderizarLivros(livros) {
    const perfil = usuarioLogado?.perfil || "BIBLIOTECARIO";
    const aluno = perfil === "ALUNO";
    const termoBusca = (campoBuscaLivro?.value || "").trim().toLowerCase();
    const livrosFiltrados = livros.filter(livro => {
        if (!termoBusca) return true;
        return [livro.titulo, livro.autor, livro.categoria]
            .some(valor => String(valor || "").toLowerCase().includes(termoBusca));
    });

    tabelaLivrosBody.innerHTML = "";

    const badgeTotal = document.getElementById("badge-total");
    if (badgeTotal) {
        badgeTotal.innerText = `Acervo - ${livrosFiltrados.length} titulos`;
    }

    livrosFiltrados.forEach(livro => {
        const qtdDisponivel = livro.quantidadeDisponivel ?? livro.disponiveis ?? livro.quantidade ?? 0;
        const qtdAlugados = livro.quantidadeAlugada ?? livro.alugados ?? 0;
        const tr = document.createElement("tr");

        // Construir a célula do título com imagem
        let tituloHtml = '';
        if (livro.capaUrl) {
            tituloHtml = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${API_URL}${livro.capaUrl}" alt="Capa" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'50\\' viewBox=\\'0 0 40 50\\'%3E%3Crect width=\\'40\\' height=\\'50\\' fill=\\'%23f0f0f0\\'/%3E%3Ctext x=\\'20\\' y=\\'25\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-size=\\'10\\'%3ESem capa%3C/text%3E%3C/svg%3E'">
                    <span>${livro.titulo}</span>
                </div>
            `;
        } else {
            tituloHtml = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 50px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 10px;">Sem capa</div>
                    <span>${livro.titulo}</span>
                </div>
            `;
        }

        tr.innerHTML = `
            <td class="text-center">${String(livro.id).padStart(2, "0")}</td>
            <td class="text-left font-serif bold">${tituloHtml}</td>
            <td class="text-center bold">${qtdDisponivel}</td>
            <td class="text-center bold">${qtdAlugados}</td>
            <td class="text-center">
                <div class="action-buttons">
                    ${aluno ? renderizarAcoesAluno(livro, qtdDisponivel) : renderizarAcoesBibliotecario(livro)}
                </div>
            </td>
        `;

        tabelaLivrosBody.appendChild(tr);
    });
}

function renderizarAcoesAluno(livro, qtdDisponivel) {
    const reservaExistente = carregarReservas().some(reserva =>
        reserva.livroId === livro.id &&
        reserva.alunoEmail === usuarioLogado?.email &&
        ["PENDENTE", "AUTORIZADA"].includes(reserva.status)
    );

    if (reservaExistente) {
        return '<button class="btn-action btn-edit" disabled>Reservado</button>';
    }

    return `<button class="btn-action btn-edit" onclick="reservarLivro('${livro.id}')" ${qtdDisponivel > 0 ? "" : "disabled"}>Reservar</button>`;
}

function renderizarAcoesBibliotecario(livro) {
    return `
        <button class="btn-action btn-edit" onclick="editarLivro('${livro.id}')">Editar</button>
        <button class="btn-action btn-delete" onclick="deletarLivro('${livro.id}')">Excluir</button>
    `;
}

// Cria uma reserva local para o bibliotecario aprovar.
function reservarLivro(id) {
    const livro = livrosCache.find(item => String(item.id) === String(id));
    if (!livro || !usuarioLogado) return;

    const reservas = carregarReservas();
    reservas.push({
        id: obterProximoIdReserva(reservas),
        livroId: livro.id,
        livroTitulo: livro.titulo,
        alunoNome: usuarioLogado.nome,
        alunoEmail: usuarioLogado.email,
        alunoWhatsapp: usuarioLogado.whatsapp || "",
        status: "PENDENTE",
        dataSolicitacao: formatarDataISO(new Date()),
        validadeRetirada: "",
        notificacaoAluno: "Reserva solicitada. Aguarde autorizacao do bibliotecario.",
        notificacaoVisualizada: false
    });

    salvarReservas(reservas);
    alert("Reserva solicitada. O bibliotecario recebera a notificacao para autorizar.");
    renderizarLivros(livrosCache);
    renderizarNotificacoesAluno();
}

// Lista reservas para o bibliotecario aprovar ou dar baixa.
function renderizarReservasBibliotecario() {
    const tabelaReservas = document.getElementById("tabela-reservas-body");
    if (!tabelaReservas) return;

    tabelaReservas.innerHTML = "";

    carregarReservas().forEach(reserva => {
        const tr = document.createElement("tr");
        const validade = reserva.validadeRetirada ? formatarDataTela(reserva.validadeRetirada) : "-";
        const vencendo = reserva.status === "AUTORIZADA" && diasAte(reserva.validadeRetirada) <= 1;

        tr.innerHTML = `
            <td class="text-center">${String(reserva.id).padStart(2, "0")}</td>
            <td class="text-left font-serif bold">${reserva.alunoNome}</td>
            <td class="text-left">${reserva.livroTitulo}</td>
            <td class="text-center bold">${reserva.status}</td>
            <td class="text-center ${vencendo ? "reservation-expiring" : "bold"}">${validade}</td>
            <td class="text-center">
                <div class="action-buttons">
                    ${renderizarAcoesReserva(reserva)}
                </div>
            </td>
        `;

        tabelaReservas.appendChild(tr);
    });
}

function renderizarAcoesReserva(reserva) {
    if (reserva.status === "PENDENTE") {
        return `<button class="btn-action btn-edit" onclick="autorizarReserva('${reserva.id}')">OK Reserva</button>`;
    }

    if (reserva.status === "AUTORIZADA") {
        return `<button class="btn-action btn-delete" onclick="darBaixaReserva('${reserva.id}')">Dar baixa</button>`;
    }

    return '<button class="btn-action btn-edit" disabled>Finalizada</button>';
}

function autorizarReserva(id) {
    const reservas = carregarReservas();
    const reserva = reservas.find(item => String(item.id) === String(id));
    if (!reserva) return;

    const validade = new Date();
    validade.setDate(validade.getDate() + 2);

    reserva.status = "AUTORIZADA";
    reserva.validadeRetirada = formatarDataISO(validade);
    reserva.notificacaoAluno = `Sua reserva do livro "${reserva.livroTitulo}" foi autorizada. Voce tem 2 dias para retirar na biblioteca.`;
    reserva.notificacaoVisualizada = false;
    reserva.mensagemWhatsapp = montarMensagemWhatsapp(reserva);
    reserva.whatsappEnviado = Boolean(obterNumeroWhatsapp(reserva.alunoWhatsapp));

    salvarReservas(reservas);
    abrirMensagemWhatsapp(reserva);
    alert(`Reserva autorizada. O aluno recebeu a notificacao no sistema.\n\nMensagem para WhatsApp:\n${reserva.mensagemWhatsapp}`);
    renderizarReservasBibliotecario();
}

function darBaixaReserva(id) {
    const reservas = carregarReservas();
    const reserva = reservas.find(item => String(item.id) === String(id));
    if (!reserva) return;

    reserva.status = "RETIRADO";
    reserva.notificacaoAluno = `Livro "${reserva.livroTitulo}" retirado na biblioteca.`;
    reserva.notificacaoVisualizada = false;
    salvarReservas(reservas);
    renderizarReservasBibliotecario();
}

function renderizarNotificacoesAluno() {
    const lista = document.getElementById("lista-notificacoes-aluno");
    if (!lista || !usuarioLogado) return;

    const minhasReservas = carregarReservas().filter(reserva =>
        reserva.alunoEmail === usuarioLogado.email && !reserva.notificacaoVisualizada
    );
    lista.innerHTML = "";

    if (minhasReservas.length === 0) {
        lista.innerHTML = "<li>Nenhuma notificacao de reserva no momento.</li>";
        return;
    }

    const reservaMaisRecente = minhasReservas[minhasReservas.length - 1];
    const li = document.createElement("li");
    li.className = "notification-item";
    li.innerHTML = `
        <span>${reservaMaisRecente.notificacaoAluno || `Reserva ${reservaMaisRecente.status.toLowerCase()} para ${reservaMaisRecente.livroTitulo}.`}</span>
        <button type="button" class="notification-ok" onclick="confirmarNotificacaoAluno('${reservaMaisRecente.id}')">OK</button>
    `;
    lista.appendChild(li);
}

// Marca a notificacao do aluno como lida sem apagar a reserva.
function confirmarNotificacaoAluno(id) {
    const reservas = carregarReservas();
    const reserva = reservas.find(item => String(item.id) === String(id));

    if (!reserva) return;

    reserva.notificacaoVisualizada = true;
    salvarReservas(reservas);
    renderizarNotificacoesAluno();
}

// POST ou PUT - Salvar Livro na API (com suporte a imagem)
async function salvarLivro() {
    const id = document.getElementById("livro-id").value;
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const isbn = document.getElementById("isbn").value;
    const categoria = document.getElementById("categoria").value;
    const quantidadeTotal = Number(document.getElementById("quantidade").value);
    
    // Criar FormData para enviar com imagem
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("autor", autor);
    formData.append("isbn", isbn);
    formData.append("categoria", categoria);
    formData.append("quantidade", quantidadeTotal);
    
    // Adicionar imagem se existir
    const capaInput = document.getElementById("capa");
    if (capaInput && capaInput.files.length > 0) {
        formData.append("capa", capaInput.files[0]);
    }

    try {
        let url = API_URL;
        let metodo = "POST";

        if (id) {
            url = `${API_URL}/${id}`;
            metodo = "PUT";
        }

        const response = await fetch(url, {
            method: metodo,
            body: formData // Não usar headers 'Content-Type' com FormData
        });

        if (!response.ok) {
            const erro = await response.text();
            throw new Error(erro || "Erro ao salvar os dados na API");
        }

        alert(id ? "Livro atualizado com sucesso!" : "Livro cadastrado com sucesso!");
        resetarFormulario();
        listarLivros();
    } catch (error) {
        console.error("Erro ao salvar livro:", error);
        alert("Ocorreu um erro ao salvar o livro: " + error.message);
    }
}

// GET por ID - Prepara o formulario para edicao.
async function editarLivro(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar detalhes do livro");

        const livro = await response.json();

        document.getElementById("livro-id").value = livro.id;
        document.getElementById("titulo").value = livro.titulo;
        document.getElementById("autor").value = livro.autor;
        document.getElementById("isbn").value = livro.isbn;
        document.getElementById("categoria").value = livro.categoria || "";
        document.getElementById("quantidade").value = livro.quantidadeTotal || livro.quantidade || "";

        // Mostrar preview da capa atual se existir
        const previewDiv = document.getElementById("preview-capa");
        if (previewDiv) {
            if (livro.capaUrl) {
                previewDiv.innerHTML = `
                    <div style="margin-top: 10px;">
                        <label style="font-size: 12px; color: #666;">Capa atual:</label>
                        <div>
                            <img src="${API_URL}${livro.capaUrl}" alt="Capa atual" style="max-width: 100px; max-height: 120px; margin-top: 5px; border-radius: 4px;">
                        </div>
                    </div>
                `;
            } else {
                previewDiv.innerHTML = "";
            }
        }

        if (document.getElementById("titulo-form")) document.getElementById("titulo-form").innerText = "Atualizar Livro";
        if (document.getElementById("btn-salvar")) document.getElementById("btn-salvar").innerText = "Atualizar";
        if (document.getElementById("btn-cancelar")) document.getElementById("btn-cancelar").style.display = "block";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Erro ao carregar livro para edicao:", error);
        alert("Erro ao carregar dados do livro");
    }
}

// DELETE - Deletar Livro da API
async function deletarLivro(id) {
    if (!confirm("Deseja realmente excluir este livro?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Erro ao deletar livro na API");

        alert("Livro excluído com sucesso!");
        listarLivros();
    } catch (error) {
        console.error("Erro ao deletar livro:", error);
        alert("Nao foi possivel excluir o livro.");
    }
}

function resetarFormulario() {
    if (!formLivro) return;
    formLivro.reset();
    document.getElementById("livro-id").value = "";
    
    // Limpar preview da imagem
    const previewDiv = document.getElementById("preview-capa");
    if (previewDiv) {
        previewDiv.innerHTML = "";
    }
    
    // Limpar input de arquivo
    const capaInput = document.getElementById("capa");
    if (capaInput) {
        capaInput.value = "";
    }
    
    if (document.getElementById("titulo-form")) document.getElementById("titulo-form").innerText = "Cadastrar Livro";
    if (document.getElementById("btn-salvar")) document.getElementById("btn-salvar").innerText = "Salvar";
    if (document.getElementById("btn-cancelar")) document.getElementById("btn-cancelar").style.display = "none";
}

function carregarReservas() {
    return JSON.parse(localStorage.getItem(RESERVAS_STORAGE_KEY) || "[]");
}

function salvarReservas(reservas) {
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservas));
}

function obterProximoIdReserva(reservas) {
    if (reservas.length === 0) return 1;
    return Math.max(...reservas.map(reserva => Number(reserva.id))) + 1;
}

function montarMensagemWhatsapp(reserva) {
    return `Ola, ${reserva.alunoNome}! Sua reserva do livro "${reserva.livroTitulo}" esta autorizada. Voce tem 2 dias para retirar na biblioteca.`;
}

// Abre o WhatsApp com a mensagem pronta quando o aluno tem numero cadastrado.
function abrirMensagemWhatsapp(reserva) {
    const numeroWhatsapp = obterNumeroWhatsapp(reserva.alunoWhatsapp);

    if (!numeroWhatsapp) return;

    const mensagem = encodeURIComponent(reserva.mensagemWhatsapp);
    window.open(`https://wa.me/${numeroWhatsapp}?text=${mensagem}`, "_blank");
}

function obterNumeroWhatsapp(numero) {
    return String(numero || "").replace(/\D/g, "");
}

// Quando vem do sininho, rola a pagina direto para as reservas dos alunos.
function destacarReservasAoAbrir() {
    if (window.location.hash !== "#reservas") return;

    setTimeout(function () {
        const areaReservas = document.getElementById("area-reservas-bibliotecario");

        if (!areaReservas || areaReservas.classList.contains("hidden")) return;

        areaReservas.scrollIntoView({ behavior: "smooth", block: "start" });
        areaReservas.classList.add("reservation-focus");
    }, 250);
}

function formatarDataISO(data) {
    return data.toISOString().split("T")[0];
}

function formatarDataTela(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function diasAte(dataISO) {
    if (!dataISO) return 999;
    const hoje = new Date(formatarDataISO(new Date()));
    const data = new Date(dataISO);
    return Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
}

// Função de preview da imagem (chamada pelo HTML)
function previewImagem(input) {
    const preview = document.getElementById('preview-capa');
    if (!preview) return;
    
    // Limpar preview atual
    preview.innerHTML = '';
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '150px';
            img.style.maxHeight = '200px';
            img.style.marginTop = '10px';
            img.style.borderRadius = '4px';
            img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            preview.appendChild(img);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Tornar funções globais acessíveis pelo HTML
window.editarLivro = editarLivro;
window.deletarLivro = deletarLivro;
window.reservarLivro = reservarLivro;
window.autorizarReserva = autorizarReserva;
window.darBaixaReserva = darBaixaReserva;
window.confirmarNotificacaoAluno = confirmarNotificacaoAluno;
window.resetarFormulario = resetarFormulario;
window.previewImagem = previewImagem;