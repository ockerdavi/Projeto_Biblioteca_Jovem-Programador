const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/livros`;
const SESSAO_STORAGE_KEY = "biblioteca_usuario_logado";
const RESERVAS_STORAGE_KEY = "biblioteca_reservas_teste";

const formLivro = document.getElementById("form-livro");
const cardsContainer = document.getElementById("cards-container");
const campoBuscaLivro = document.getElementById("busca-livro");

let livrosCache = [];
let usuarioLogado = null;
let modal = null;

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

function obterUrlImagem(capaUrl) {
    if (!capaUrl) return null;
    if (capaUrl.startsWith('http')) return capaUrl;

    // Se já tem /uploads, usa direto
    if (capaUrl.startsWith('/uploads')) {
        return `${API_BASE_URL}${capaUrl}`;
    }

    // Caso contrário, assume que é só o nome do arquivo
    const nomeArquivo = capaUrl.split('/').pop();
    return `${API_BASE_URL}/uploads/capas/${nomeArquivo}`;
}

// Inicializa o modal
function inicializarModal() {
    modal = document.getElementById("bookModal");
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) {
        closeBtn.onclick = function () {
            fecharModal();
        };
    }
    window.onclick = function (event) {
        if (event.target === modal) {
            fecharModal();
        }
    };
}

function fecharModal() {
    if (modal) {
        modal.style.display = "none";
    }
}

// Substitua as funções abrirModal e renderizarLivros por estas versões corrigidas

function abrirModal(livro) {
    if (!modal) return;

    document.getElementById("modal-titulo").textContent = livro.titulo || "N/A";
    document.getElementById("modal-autor").textContent = livro.autor || "N/A";
    document.getElementById("modal-isbn").textContent = livro.isbn || "N/A";
    document.getElementById("modal-categoria").textContent = livro.categoria || "N/A";
    document.getElementById("modal-quantidade").textContent = livro.quantidadeTotal || livro.quantidade || 0;
    document.getElementById("modal-disponiveis").textContent = livro.quantidadeDisponivel ?? livro.disponiveis ?? 0;
    document.getElementById("modal-alugados").textContent = livro.quantidadeAlugada ?? livro.alugados ?? 0;

    const multaValor = livro.valorMultaDiaria ? `R$ ${livro.valorMultaDiaria}` : "R$ 2,00";
    document.getElementById("modal-multa").textContent = multaValor;

    const modalImage = document.getElementById("modal-image");

    // CORREÇÃO: Construir URL correta da imagem
    let urlImagem = "";
    if (livro.capaUrl) {
        if (livro.capaUrl.startsWith('http')) {
            urlImagem = livro.capaUrl;
        } else {
            urlImagem = `${API_BASE_URL}${livro.capaUrl}`;
        }
        modalImage.src = urlImagem;
        modalImage.onerror = function () {
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23f0f0f0'/%3E%3Ctext x='100' y='150' text-anchor='middle' fill='%23999' font-size='14'%3ESem capa%3C/text%3E%3C/svg%3E";
        };
    } else {
        modalImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23f0f0f0'/%3E%3Ctext x='100' y='150' text-anchor='middle' fill='%23999' font-size='14'%3ESem capa%3C/text%3E%3C/svg%3E";
    }

    modal.style.display = "block";
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

    cardsContainer.innerHTML = "";

    const badgeTotal = document.getElementById("badge-total");
    if (badgeTotal) {
        badgeTotal.innerText = `Acervo - ${livrosFiltrados.length} títulos`;
    }

    livrosFiltrados.forEach(livro => {
        const qtdDisponivel = livro.quantidadeDisponivel ?? livro.disponiveis ?? livro.quantidade ?? 0;
        const qtdAlugados = livro.quantidadeAlugada ?? livro.alugados ?? 0;

        const card = document.createElement("div");
        card.className = "book-card";

        // CORREÇÃO: Construir URL correta da imagem
        let imagemHtml = '';
        if (livro.capaUrl) {
            let urlImagem = livro.capaUrl;
            if (!urlImagem.startsWith('http')) {
                urlImagem = `${API_BASE_URL}${urlImagem}`;
            }
            imagemHtml = `<img src="${urlImagem}" alt="Capa de ${livro.titulo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'250\\' viewBox=\\'0 0 200 250\\'%3E%3Crect width=\\'200\\' height=\\'250\\' fill=\\'%23f0f0f0\\'/%3E%3Ctext x=\\'100\\' y=\\'125\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-size=\\'12\\'%3ESem capa%3C/text%3E%3C/svg%3E'">`;
        } else {
            imagemHtml = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%23f0f0f0'/%3E%3Ctext x='100' y='125' text-anchor='middle' fill='%23999' font-size='12'%3ESem capa%3C/text%3E%3C/svg%3E" alt="Sem capa">`;
        }

        card.innerHTML = `
            <div class="book-card-image">
                ${imagemHtml}
            </div>
            <div class="book-card-content">
                <div class="book-card-title">${livro.titulo}</div>
                <div class="book-card-author">${livro.autor || "Autor desconhecido"}</div>
                <div class="book-card-stats">
                    <span class="book-card-available">📚 Disponível: ${qtdDisponivel}</span>
                    <span class="book-card-rented">📖 Alugado: ${qtdAlugados}</span>
                </div>
                <div class="book-card-actions">
                    ${aluno ? renderizarAcoesAlunoCard(livro, qtdDisponivel) : renderizarAcoesBibliotecarioCard(livro)}
                </div>
            </div>
        `;

        card.addEventListener("click", function (e) {
            if (e.target.tagName !== 'BUTTON') {
                abrirModal(livro);
            }
        });

        cardsContainer.appendChild(card);
    });
}

function inicializarTelaLivros() {
    usuarioLogado = JSON.parse(localStorage.getItem(SESSAO_STORAGE_KEY) || "null");
    configurarTelaPorPerfil();
    listarLivros();
    renderizarReservasBibliotecario();
    renderizarNotificacoesAluno();
    carregarMeusEmprestimos();
    destacarReservasAoAbrir();
    inicializarModal();
}

function configurarTelaPorPerfil() {
    const perfil = usuarioLogado?.perfil || "BIBLIOTECARIO";
    const aluno = perfil === "ALUNO";

    document.getElementById("area-form-livro")?.classList.toggle("hidden", aluno);
    document.getElementById("area-busca-aluno")?.classList.toggle("hidden", !aluno);
    document.getElementById("area-notificacoes-aluno")?.classList.toggle("hidden", !aluno);
    document.getElementById("area-reservas-bibliotecario")?.classList.toggle("hidden", aluno);
    document.getElementById("area-meus-emprestimos")?.classList.toggle("hidden", !aluno);

    const tituloPagina = document.getElementById("titulo-pagina");
    if (tituloPagina) {
        tituloPagina.innerText = aluno ? "Minha Biblioteca" : "Dashboard Biblioteca";
    }
}

async function listarLivros() {
    if (!cardsContainer) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao buscar dados da API");

        livrosCache = await response.json();
        renderizarLivros(livrosCache);
    } catch (error) {
        console.error("Erro ao listar livros:", error);
        alert("Não foi possível conectar a API. Verifique se o Back-End está rodando.");
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

    cardsContainer.innerHTML = "";

    const badgeTotal = document.getElementById("badge-total");
    if (badgeTotal) {
        badgeTotal.innerText = `Acervo - ${livrosFiltrados.length} títulos`;
    }

    livrosFiltrados.forEach(livro => {
        const qtdDisponivel = livro.quantidadeDisponivel ?? livro.disponiveis ?? livro.quantidade ?? 0;
        const qtdAlugados = livro.quantidadeAlugada ?? livro.alugados ?? 0;

        const card = document.createElement("div");
        card.className = "book-card";

        const urlImagem = obterUrlImagem(livro.capaUrl);
        let imagemHtml = '';

        if (urlImagem) {
            imagemHtml = `<img src="${urlImagem}" alt="Capa de ${livro.titulo}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'250\\' viewBox=\\'0 0 200 250\\'%3E%3Crect width=\\'200\\' height=\\'250\\' fill=\\'%23f0f0f0\\'/%3E%3Ctext x=\\'100\\' y=\\'125\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-size=\\'12\\'%3ESem capa%3C/text%3E%3C/svg%3E'">`;
        } else {
            imagemHtml = `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%23f0f0f0'/%3E%3Ctext x='100' y='125' text-anchor='middle' fill='%23999' font-size='12'%3ESem capa%3C/text%3E%3C/svg%3E" alt="Sem capa">`;
        }

        card.innerHTML = `
            <div class="book-card-image">
                ${imagemHtml}
            </div>
            <div class="book-card-content">
                <div class="book-card-title">${livro.titulo}</div>
                <div class="book-card-author">${livro.autor || "Autor desconhecido"}</div>
                <div class="book-card-stats">
                    <span class="book-card-available">📚 Disponível: ${qtdDisponivel}</span>
                    <span class="book-card-rented">📖 Alugado: ${qtdAlugados}</span>
                </div>
                <div class="book-card-actions">
                    ${aluno ? renderizarAcoesAlunoCard(livro, qtdDisponivel) : renderizarAcoesBibliotecarioCard(livro)}
                </div>
            </div>
        `;

        card.addEventListener("click", function (e) {
            if (e.target.tagName !== 'BUTTON') {
                abrirModal(livro);
            }
        });

        cardsContainer.appendChild(card);
    });
}

function renderizarAcoesAlunoCard(livro, qtdDisponivel) {
    return `<button class="btn-card-reserve" onclick="event.stopPropagation(); reservarLivro('${livro.id}')" ${qtdDisponivel > 0 ? "" : "disabled"}>📖 Reservar</button>`;
}

function renderizarAcoesBibliotecarioCard(livro) {
    return `
        <button class="btn-card-edit" onclick="event.stopPropagation(); editarLivro('${livro.id}')">✏️ Editar</button>
        <button class="btn-card-delete" onclick="event.stopPropagation(); deletarLivro('${livro.id}')">🗑️ Excluir</button>
    `;
}

async function carregarMeusEmprestimos() {
    const tabelaBody = document.getElementById("tabela-meus-emprestimos-body");
    if (!tabelaBody || !usuarioLogado || !usuarioLogado.id) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/emprestimos/cliente/${usuarioLogado.id}`);
        if (!response.ok) throw new Error("Erro ao buscar empréstimos");

        const emprestimos = await response.json();
        tabelaBody.innerHTML = "";

        if (emprestimos.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum empréstimo ou reserva encontrado</td></tr>';
            return;
        }

        emprestimos.forEach(emp => {
            const tr = document.createElement("tr");

            let statusTexto = "";
            let statusClass = "";
            switch (emp.status) {
                case "PENDENTE":
                    statusTexto = "⏳ Reserva Pendente";
                    statusClass = "status-pendente";
                    break;
                case "AUTORIZADA":
                    statusTexto = "✅ Reserva Autorizada";
                    statusClass = "status-autorizada";
                    break;
                case "EM_ANDAMENTO":
                    statusTexto = "📚 Emprestado";
                    statusClass = "status-emprestado";
                    break;
                case "DEVOLVIDO":
                    statusTexto = "✔️ Devolvido";
                    statusClass = "status-devolvido";
                    break;
                case "DEVOLVIDO_COM_MULTA":
                    statusTexto = "⚠️ Devolvido com Multa";
                    statusClass = "status-multa";
                    break;
                default:
                    statusTexto = emp.status;
                    statusClass = "";
            }

            const multa = emp.multa ? `R$ ${emp.multa}` : "R$ 0,00";
            const dataEmprestimo = emp.dataEmprestimo ? formatarDataTela(emp.dataEmprestimo) : "-";
            const dataPrevista = emp.dataPrevistaEntrega ? formatarDataTela(emp.dataPrevistaEntrega) : "-";

            tr.innerHTML = `
                <td class="text-center">${String(emp.id).padStart(2, "0")}</td>
                <td class="text-left font-serif bold">${emp.livro?.titulo || "-"}</td>
                <td class="text-center ${statusClass} bold">${statusTexto}</td>
                <td class="text-center">${dataEmprestimo}</td>
                <td class="text-center">${dataPrevista}</td>
                <td class="text-center bold">${multa}</td>
            `;

            tabelaBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);
        tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center">Erro ao carregar empréstimos</td></tr>';
    }
}

async function reservarLivro(id) {
    const livro = livrosCache.find(item => String(item.id) === String(id));
    if (!livro || !usuarioLogado) return;

    try {
        const payload = {
            clienteId: usuarioLogado.id,
            livroId: livro.id,
            status: 'PENDENTE'
        };

        const resp = await fetch(`${API_BASE_URL}/api/emprestimos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const erro = await resp.text();
            alert('Falha ao criar reserva: ' + (erro || resp.statusText));
            return;
        }

        alert('Reserva solicitada com sucesso!');
        await listarLivros();
        await renderizarReservasBibliotecario();
        await renderizarNotificacoesAluno();
        await carregarMeusEmprestimos();
    } catch (err) {
        console.error('Erro ao reservar livro:', err);
        alert('Erro ao reservar: ' + err.message);
    }
}

async function renderizarReservasBibliotecario() {
    const tabelaReservas = document.getElementById("tabela-reservas-body");
    if (!tabelaReservas) return;

    try {
        const respPend = await fetch(`${API_BASE_URL}/api/emprestimos/status/PENDENTE`);
        const respAut = await fetch(`${API_BASE_URL}/api/emprestimos/status/AUTORIZADA`);
        const pendentes = respPend.ok ? await respPend.json() : [];
        const autorizadas = respAut.ok ? await respAut.json() : [];

        const todas = [...pendentes, ...autorizadas];

        // Limpar a tabela
        tabelaReservas.innerHTML = "";

        if (todas.length === 0) {
            // Criar uma linha de "nenhum dado" que ocupa todas as colunas
            const tr = document.createElement("tr");
            tr.className = "empty-row";
            const td = document.createElement("td");
            td.colSpan = 7;
            td.textContent = "📭 Nenhuma reserva pendente";
            td.style.textAlign = "center";
            td.style.padding = "40px 20px";
            td.style.color = "var(--text-muted)";
            td.style.fontStyle = "italic";
            tr.appendChild(td);
            tabelaReservas.appendChild(tr);
            return;
        }

        todas.forEach(emp => {
            const tr = document.createElement("tr");
            const validade = emp.dataPrevistaEntrega ? formatarDataTela(emp.dataPrevistaEntrega) : "-";
            const vencendo = emp.status === "AUTORIZADA" && diasAte(emp.dataPrevistaEntrega) <= 1;

            const alunoNome = emp.cliente?.nomeCompleto || (emp.cliente?.email || "-");
            const livroTitulo = emp.livro?.titulo || "-";
            
            const valorMultaDiaria = emp.livro?.valorMultaDiaria || 2.00;
            const multaFormatada = `R$ ${parseFloat(valorMultaDiaria).toFixed(2)}`;

            tr.innerHTML = `
                <td class="text-center">${String(emp.id).padStart(2, "0")}</td>
                <td class="text-left font-serif bold">${alunoNome}</td>
                <td class="text-left">${livroTitulo}</td>
                <td class="text-center bold">${emp.status}</td>
                <td class="text-center ${vencendo ? "reservation-expiring" : "bold"}">${validade}</td>
                <td class="text-center bold">${multaFormatada}</td>
                <td class="text-center">
                    <div class="action-buttons">
                        ${renderizarAcoesReserva(emp)}
                    </div>
                </td>
            `;

            tabelaReservas.appendChild(tr);
        });

    } catch (err) {
        console.error('Erro ao listar reservas:', err);
        tabelaReservas.innerHTML = "";
        const tr = document.createElement("tr");
        tr.className = "empty-row";
        const td = document.createElement("td");
        td.colSpan = 7;
        td.textContent = "❌ Erro ao carregar reservas";
        td.style.textAlign = "center";
        td.style.padding = "40px 20px";
        td.style.color = "var(--color-danger)";
        tr.appendChild(td);
        tabelaReservas.appendChild(tr);
    }
}

function renderizarAcoesReserva(reservaOrEmp) {
    const status = reservaOrEmp.status;
    const id = reservaOrEmp.id;
    if (status === "PENDENTE") {
        return `<button class="btn-action btn-edit" onclick="autorizarReserva('${id}')">✅ OK Reserva</button>`;
    }

    if (status === "AUTORIZADA") {
        return `<button class="btn-action btn-delete" onclick="darBaixaReserva('${id}')">📦 Dar baixa</button>`;
    }

    return '<button class="btn-action btn-edit" disabled>✔️ Finalizada</button>';
}

async function autorizarReserva(id) {
    try {
        const respGet = await fetch(`${API_BASE_URL}/api/emprestimos/${id}`);
        if (!respGet.ok) throw new Error('Empréstimo não encontrado');
        const emp = await respGet.json();

        const validade = new Date();
        validade.setDate(validade.getDate() + 2);

        const payload = {
            clienteId: emp.cliente?.id,
            livroId: emp.livro?.id,
            status: 'AUTORIZADA',
            dataPrevistaEntrega: formatarDataISO(validade)
        };

        const resp = await fetch(`${API_BASE_URL}/api/emprestimos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const erro = await resp.text();
            throw new Error(erro || 'Erro ao autorizar reserva');
        }

        const reserva = {
            id: id,
            livroTitulo: emp.livro?.titulo,
            alunoNome: emp.cliente?.nomeCompleto || emp.cliente?.email,
            alunoWhatsapp: emp.cliente?.whatsapp || '',
            status: 'AUTORIZADA',
            validadeRetirada: formatarDataISO(validade)
        };

        reserva.mensagemWhatsapp = montarMensagemWhatsapp(reserva);
        reserva.whatsappEnviado = Boolean(obterNumeroWhatsapp(reserva.alunoWhatsapp));

        abrirMensagemWhatsapp(reserva);
        alert(`Reserva autorizada com sucesso!`);
        await renderizarReservasBibliotecario();
        await carregarMeusEmprestimos();
        await renderizarNotificacoesAluno();
        await listarLivros();
    } catch (err) {
        console.error('Erro ao autorizar reserva:', err);
        alert('Erro ao autorizar reserva: ' + err.message);
    }
}

async function darBaixaReserva(id) {
    try {
        const respGet = await fetch(`${API_BASE_URL}/api/emprestimos/${id}`);
        if (!respGet.ok) throw new Error('Empréstimo não encontrado');
        const emp = await respGet.json();

        const payload = {
            clienteId: emp.cliente?.id,
            livroId: emp.livro?.id,
            status: 'EM_ANDAMENTO'
        };

        const resp = await fetch(`${API_BASE_URL}/api/emprestimos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const erro = await resp.text();
            throw new Error(erro || 'Erro ao efetivar retirada');
        }

        alert('Retirada registrada com sucesso!');
        await renderizarReservasBibliotecario();
        await carregarMeusEmprestimos();
        await listarLivros();
    } catch (err) {
        console.error('Erro ao dar baixa na reserva:', err);
        alert('Erro ao processar retirada: ' + err.message);
    }
}

async function renderizarNotificacoesAluno() {
    const lista = document.getElementById("lista-notificacoes-aluno");
    if (!lista || !usuarioLogado || !usuarioLogado.id) return;

    try {
        const resp = await fetch(`${API_BASE_URL}/api/emprestimos/cliente/${usuarioLogado.id}`);
        if (!resp.ok) throw new Error('Erro ao buscar notificações');
        const emprestimos = await resp.json();

        const relevantes = emprestimos.filter(e => e.status === 'PENDENTE' || e.status === 'AUTORIZADA');
        lista.innerHTML = "";

        if (relevantes.length === 0) {
            lista.innerHTML = "<li>Nenhuma notificação de reserva no momento.</li>";
            return;
        }

        const emp = relevantes[relevantes.length - 1];
        const mensagem = emp.status === 'PENDENTE'
            ? `🔔 Reserva solicitada para "${emp.livro?.titulo}". Aguarde autorização.`
            : `✅ Sua reserva para "${emp.livro?.titulo}" foi autorizada! Validade: ${formatarDataTela(emp.dataPrevistaEntrega)}.`;

        const li = document.createElement('li');
        li.className = 'notification-item';
        li.innerHTML = `
            <span>${mensagem}</span>
            <button type="button" class="notification-ok" onclick="fecharNotificacao(this)">OK</button>
        `;
        lista.appendChild(li);
    } catch (err) {
        console.error('Erro ao renderizar notificações:', err);
    }
}

function fecharNotificacao(botao) {
    const li = botao.closest('li');
    if (li) li.remove();
}

async function salvarLivro() {
    const id = document.getElementById("livro-id").value;
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const isbn = document.getElementById("isbn").value;
    const categoria = document.getElementById("categoria").value;
    const quantidadeTotal = Number(document.getElementById("quantidade").value);

    // CORREÇÃO: Verificar se o elemento existe antes de acessar
    const valorMultaElement = document.getElementById("valorMulta");
    const valorMulta = valorMultaElement ? valorMultaElement.value : "";

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("autor", autor);
    formData.append("isbn", isbn);
    formData.append("categoria", categoria);
    formData.append("quantidade", quantidadeTotal);

    if (valorMulta && !isNaN(parseFloat(valorMulta))) {
        formData.append("valorMultaDiaria", valorMulta);
    }

    const capaInput = document.getElementById("capa");
    if (capaInput && capaInput.files && capaInput.files.length > 0) {
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
            body: formData
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
        if (livro.valorMultaDiaria) {
            document.getElementById("valorMulta").value = livro.valorMultaDiaria;
        }

        const previewDiv = document.getElementById("preview-capa");
        if (previewDiv) {
            if (livro.capaUrl) {
                const urlImagem = obterUrlImagem(livro.capaUrl);
                previewDiv.innerHTML = `
                    <div style="margin-top: 10px;">
                        <label style="font-size: 12px; color: #666;">Capa atual:</label>
                        <div>
                            <img src="${urlImagem}" alt="Capa atual" style="max-width: 100px; max-height: 120px; margin-top: 5px; border-radius: 4px;">
                        </div>
                    </div>
                `;
            } else {
                previewDiv.innerHTML = "";
            }
        }

        document.getElementById("titulo-form").innerText = "Atualizar Livro";
        document.getElementById("btn-salvar").innerText = "Atualizar";
        document.getElementById("btn-cancelar").style.display = "block";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Erro ao carregar livro para edição:", error);
        alert("Erro ao carregar dados do livro");
    }
}

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
        alert("Não foi possível excluir o livro.");
    }
}

function resetarFormulario() {
    if (!formLivro) return;
    formLivro.reset();
    document.getElementById("livro-id").value = "";
    document.getElementById("valorMulta").value = "";

    const previewDiv = document.getElementById("preview-capa");
    if (previewDiv) {
        previewDiv.innerHTML = "";
    }

    const capaInput = document.getElementById("capa");
    if (capaInput) {
        capaInput.value = "";
    }

    document.getElementById("titulo-form").innerText = "Cadastrar Livro";
    document.getElementById("btn-salvar").innerText = "Salvar";
    document.getElementById("btn-cancelar").style.display = "none";
}

function montarMensagemWhatsapp(reserva) {
    return `Olá, ${reserva.alunoNome}! Sua reserva do livro "${reserva.livroTitulo}" está autorizada. Você tem 2 dias para retirar na biblioteca.`;
}

function abrirMensagemWhatsapp(reserva) {
    const numeroWhatsapp = obterNumeroWhatsapp(reserva.alunoWhatsapp);
    if (!numeroWhatsapp) return;
    const mensagem = encodeURIComponent(reserva.mensagemWhatsapp);
    window.open(`https://wa.me/${numeroWhatsapp}?text=${mensagem}`, "_blank");
}

function obterNumeroWhatsapp(numero) {
    return String(numero || "").replace(/\D/g, "");
}

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

window.editarLivro = editarLivro;
window.deletarLivro = deletarLivro;
window.reservarLivro = reservarLivro;
window.autorizarReserva = autorizarReserva;
window.darBaixaReserva = darBaixaReserva;
window.fecharNotificacao = fecharNotificacao;
window.resetarFormulario = resetarFormulario;
window.fecharModal = fecharModal;