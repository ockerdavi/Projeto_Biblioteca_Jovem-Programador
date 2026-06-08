const CLIENTES_API_URL = "/api/clientes";
const LIVROS_API_URL = "/api/livros";
const EMPRESTIMOS_API_URL = "/api/emprestimos";
const STORAGE_KEY = "biblioteca_emprestimos_teste";

const formEmprestimo = document.getElementById("form-emprestimo");
const selectCliente = document.getElementById("cliente");
const selectLivro = document.getElementById("livro");
const tabelaEmprestimosBody = document.querySelector("#tabela-emprestimos tbody");

let clientes = [];
let livros = [];
let emprestimos = [];
let modoTesteLocal = false;

// Inicializa a tela carregando dados reais quando existirem, ou dados locais de teste.
document.addEventListener("DOMContentLoaded", inicializarTela);

if (formEmprestimo) {
    formEmprestimo.addEventListener("submit", function (event) {
        event.preventDefault();
        registrarEmprestimo();
    });
}

async function inicializarTela() {
    clientes = await carregarLista(CLIENTES_API_URL, obterClientesTeste());
    livros = await carregarLista(LIVROS_API_URL, obterLivrosTeste());
    emprestimos = carregarEmprestimosTeste();

    preencherSelectClientes();
    preencherSelectLivros();
    renderizarEmprestimos();
}

// Tenta buscar dados no backend. Se falhar, usa dados locais para teste visual.
async function carregarLista(url, fallback) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Backend indisponivel");
        return await response.json();
    } catch (error) {
        modoTesteLocal = true;
        return fallback;
    }
}

function preencherSelectClientes() {
    selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.innerText = cliente.nomeCompleto;
        selectCliente.appendChild(option);
    });
}

function preencherSelectLivros() {
    selectLivro.innerHTML = '<option value="">Selecione um livro</option>';

    livros.forEach(livro => {
        const disponiveis = livro.quantidadeDisponivel ?? 0;
        const option = document.createElement("option");
        option.value = livro.id;
        option.disabled = disponiveis <= 0;
        option.innerText = `${livro.titulo} (${disponiveis} disponiveis)`;
        selectLivro.appendChild(option);
    });
}

// Registra o emprestimo no modo local de teste.
async function registrarEmprestimo() {
    const cliente = clientes.find(item => String(item.id) === selectCliente.value);
    const livro = livros.find(item => String(item.id) === selectLivro.value);
    const diasPermitidos = Number(document.getElementById("dias-permitidos").value);
    const valorMultaDiaria = Number(document.getElementById("valor-multa-diaria").value);

    if (!cliente || !livro) {
        alert("Selecione um cliente e um livro.");
        return;
    }

    const hoje = new Date();
    const dataPrevista = new Date(hoje);
    dataPrevista.setDate(hoje.getDate() + diasPermitidos);

    const novoEmprestimo = {
        id: obterProximoId(),
        cliente,
        livro,
        dataEmprestimo: formatarDataISO(hoje),
        dataPrevistaEntrega: formatarDataISO(dataPrevista),
        dataEntrega: null,
        diasPermitidos,
        status: "EMPRESTADO",
        multa: 0,
        valorMultaDiaria
    };

    emprestimos.push(novoEmprestimo);
    salvarEmprestimosTeste();
    resetarFormulario();
    renderizarEmprestimos();

    if (modoTesteLocal) {
        console.info("Emprestimo registrado em modo de teste local. Nenhum dado foi enviado ao backend.");
    }
}

// Renderiza os emprestimos cadastrados no modo local.
function renderizarEmprestimos() {
    if (!tabelaEmprestimosBody) return;

    tabelaEmprestimosBody.innerHTML = "";

    const badgeTotal = document.getElementById("badge-total");
    if (badgeTotal) {
        badgeTotal.innerText = `Emprestimos - ${emprestimos.length} registros`;
    }

    emprestimos.forEach(emprestimo => {
        const tr = document.createElement("tr");
        const multa = Number(emprestimo.multa || 0).toFixed(2);
        const valorMultaDiaria = Number(emprestimo.valorMultaDiaria || 0).toFixed(2);
        const podeDevolver = emprestimo.status === "EMPRESTADO";

        tr.innerHTML = `
            <td class="text-center">${String(emprestimo.id).padStart(2, "0")}</td>
            <td class="text-left font-serif bold">${emprestimo.cliente?.nomeCompleto || ""}</td>
            <td class="text-left">${emprestimo.livro?.titulo || ""}</td>
            <td class="text-center bold">${formatarDataTela(emprestimo.dataEmprestimo)}</td>
            <td class="text-center bold">${formatarDataTela(emprestimo.dataPrevistaEntrega)}</td>
            <td class="text-center bold">${formatarDataTela(emprestimo.dataEntrega)}</td>
            <td class="text-center bold">${emprestimo.diasPermitidos || ""}</td>
            <td class="text-center bold">${emprestimo.status || ""}</td>
            <td class="text-center bold">R$ ${multa}</td>
            <td class="text-center bold">R$ ${valorMultaDiaria}</td>
            <td class="text-center">
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="devolverEmprestimo('${emprestimo.id}')" ${podeDevolver ? "" : "disabled"}>Devolver</button>
                    <button class="btn-action btn-delete" onclick="removerEmprestimo('${emprestimo.id}')">Excluir</button>
                </div>
            </td>
        `;

        tabelaEmprestimosBody.appendChild(tr);
    });
}

function devolverEmprestimo(id) {
    const emprestimo = emprestimos.find(item => String(item.id) === String(id));
    if (!emprestimo) return;

    emprestimo.dataEntrega = formatarDataISO(new Date());
    emprestimo.status = "ENTREGUE";
    emprestimo.multa = 0;

    salvarEmprestimosTeste();
    renderizarEmprestimos();
}

function removerEmprestimo(id) {
    if (!confirm("Deseja realmente excluir este emprestimo?")) return;

    emprestimos = emprestimos.filter(item => String(item.id) !== String(id));
    salvarEmprestimosTeste();
    renderizarEmprestimos();
}

function resetarFormulario() {
    if (!formEmprestimo) return;
    formEmprestimo.reset();
    document.getElementById("dias-permitidos").value = 7;
    document.getElementById("valor-multa-diaria").value = "2.00";
}

// Dados locais usados apenas enquanto nao houver EmprestimoController.
function obterClientesTeste() {
    return [
        { id: 1, nomeCompleto: "Cliente Teste", telefone: "48999990000", email: "cliente@teste.com" },
        { id: 2, nomeCompleto: "Alexandre Milton Alves", telefone: "48996275324", email: "ditecalexandre@gmail.com" }
    ];
}

function obterLivrosTeste() {
    return [
        { id: 1, titulo: "Dom Casmurro", quantidadeDisponivel: 10 },
        { id: 2, titulo: "O Cortico", quantidadeDisponivel: 4 }
    ];
}

function carregarEmprestimosTeste() {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
}

function salvarEmprestimosTeste() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emprestimos));
}

function obterProximoId() {
    if (emprestimos.length === 0) return 1;
    return Math.max(...emprestimos.map(item => Number(item.id))) + 1;
}

function formatarDataISO(data) {
    return data.toISOString().split("T")[0];
}

function formatarDataTela(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}
