// Aponta fixamente para o backend do Spring Boot, independente da porta do frontend
const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/clientes`;
const SESSAO_STORAGE_KEY = "biblioteca_usuario_logado";
const USUARIOS_STORAGE_KEY = "biblioteca_usuarios_teste";

const formCliente = document.getElementById("form-cliente");
const tabelaClientesBody = document.querySelector("#tabela-clientes tbody");

let usuarioLogado = null;

// Inicializa a tela conforme o perfil do usuario logado.
document.addEventListener("DOMContentLoaded", inicializarTelaClientes);

if (formCliente) {
    formCliente.addEventListener("submit", function (event) {
        event.preventDefault();
        salvarCliente();
    });
}

function inicializarTelaClientes() {
    usuarioLogado = JSON.parse(localStorage.getItem(SESSAO_STORAGE_KEY) || "null");

    if (usuarioLogado?.perfil === "ALUNO") {
        prepararTelaDoAluno();
        return;
    }

    prepararTelaDoBibliotecario();
    listarClientes();
}

// Aluno ve somente os proprios dados, nunca a lista de outros clientes.
function prepararTelaDoAluno() {
    document.getElementById("lista-clientes-card")?.classList.add("hidden");
    document.getElementById("perfil-aluno-card")?.classList.remove("hidden");

    const tituloPagina = document.getElementById("titulo-pagina");
    const badgeTotal = document.getElementById("badge-total");
    const tituloForm = document.getElementById("titulo-form");
    const btnSalvar = document.getElementById("btn-salvar");

    if (tituloPagina) tituloPagina.innerText = "Meus Dados";
    if (badgeTotal) badgeTotal.innerText = "Area do cliente";
    if (tituloForm) tituloForm.innerText = "Atualizar meus dados";
    if (btnSalvar) btnSalvar.innerText = "Atualizar dados";

    preencherPerfilAluno();
    preencherFormularioAluno();
}

function prepararTelaDoBibliotecario() {
    document.getElementById("lista-clientes-card")?.classList.remove("hidden");
    document.getElementById("perfil-aluno-card")?.classList.add("hidden");
}

function preencherPerfilAluno() {
    const avatar = document.getElementById("perfil-aluno-avatar");
    const nome = document.getElementById("perfil-aluno-nome");
    const email = document.getElementById("perfil-aluno-email");

    if (nome) nome.innerText = usuarioLogado?.nome || "Meus dados";
    if (email) email.innerText = usuarioLogado?.email || "";

    if (!avatar) return;

    if (usuarioLogado?.foto) {
        avatar.innerHTML = `<img src="${usuarioLogado.foto}" alt="Foto de ${usuarioLogado.nome}">`;
    } else {
        avatar.innerText = obterIniciais(usuarioLogado?.nome);
    }
}

function preencherFormularioAluno() {
    const dadosAluno = carregarUsuarios().find(usuario => usuario.email === usuarioLogado?.email) || usuarioLogado;

    document.getElementById("cliente-id").value = "";
    document.getElementById("nome-completo").value = dadosAluno.nomeCompleto || dadosAluno.nome || "";
    document.getElementById("telefone").value = dadosAluno.telefone || dadosAluno.whatsapp || "";
    document.getElementById("email").value = dadosAluno.email || "";
    document.getElementById("cpf").value = dadosAluno.cpf || "";
    document.getElementById("cep").value = dadosAluno.cep || "";
    document.getElementById("rua").value = dadosAluno.rua || "";
    document.getElementById("numero-casa").value = dadosAluno.numeroCasa || "";
    document.getElementById("referencia").value = dadosAluno.referencia || "";
}

// Busca todos os clientes no backend e renderiza a lista somente para bibliotecario.
async function listarClientes() {
    if (!tabelaClientesBody) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao buscar clientes");

        const clientes = await response.json();
        tabelaClientesBody.innerHTML = "";

        const badgeTotal = document.getElementById("badge-total");
        if (badgeTotal) {
            badgeTotal.innerText = `Clientes - ${clientes.length} cadastrados`;
        }

        clientes.forEach(cliente => {
            const endereco = `${cliente.rua || ""}, ${cliente.numeroCasa || ""}`;
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="text-center">${String(cliente.id).padStart(2, "0")}</td>
                <td class="text-left font-serif bold">${cliente.nomeCompleto || ""}</td>
                <td class="text-center bold">${cliente.telefone || ""}</td>
                <td class="text-left">${cliente.email || ""}</td>
                <td class="text-center bold">${cliente.cep || ""}</td>
                <td class="text-left">${endereco}</td>
                <td class="text-left">${cliente.referencia || ""}</td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editarCliente('${cliente.id}')">Editar</button>
                        <button class="btn-action btn-delete" onclick="deletarCliente('${cliente.id}')">Excluir</button>
                    </div>
                </td>
            `;

            tabelaClientesBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao listar clientes:", error);
        alert("Nao foi possivel conectar a API de clientes.");
    }
}

// Salva no backend para bibliotecario; para aluno atualiza somente os proprios dados locais.
async function salvarCliente() {
    if (usuarioLogado?.perfil === "ALUNO") {
        atualizarDadosAluno();
        return;
    }

    const id = document.getElementById("cliente-id").value;
    const dadosCliente = obterDadosFormularioCliente();

    try {
        let url = API_URL;
        let metodo = "POST";

        if (id) {
            url = `${API_URL}/${id}`;
            metodo = "PUT";
        }

        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosCliente)
        });

        if (!response.ok) throw new Error("Erro ao salvar cliente");

        resetarFormulario();
        listarClientes();
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        alert("Ocorreu um erro ao salvar o cliente.");
    }
}

function obterDadosFormularioCliente() {
    return {
        nomeCompleto: document.getElementById("nome-completo").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        cpf: document.getElementById("cpf").value,
        cep: document.getElementById("cep").value,
        rua: document.getElementById("rua").value,
        numeroCasa: document.getElementById("numero-casa").value,
        referencia: document.getElementById("referencia").value,
        ativo: true
    };
}

async function atualizarDadosAluno() {
    const dados = obterDadosFormularioCliente();
    const usuarios = carregarUsuarios();
    const indiceUsuario = usuarios.findIndex(usuario => usuario.email === usuarioLogado.email);

    const usuarioAtualizado = {
        ...usuarios[indiceUsuario],
        ...usuarioLogado,
        nome: dados.nomeCompleto,
        nomeCompleto: dados.nomeCompleto,
        telefone: dados.telefone,
        whatsapp: dados.telefone,
        email: dados.email,
        cpf: dados.cpf,
        cep: dados.cep,
        rua: dados.rua,
        numeroCasa: dados.numeroCasa,
        referencia: dados.referencia
    };

    if (indiceUsuario >= 0) {
        usuarios[indiceUsuario] = usuarioAtualizado;
        localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios));
    }

    localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify(usuarioAtualizado));
    usuarioLogado = usuarioAtualizado;
    preencherPerfilAluno();

    const salvoNoBackend = await salvarDadosAlunoNoBackend(dados);
    if (salvoNoBackend) {
        alert("Seus dados foram atualizados no sistema.");
        return;
    }

    alert("Seus dados foram atualizados nesta sessao, mas nao foi possivel salvar no backend.");
}

// Sincroniza os dados do aluno com o backend usando a API de clientes existente.
async function salvarDadosAlunoNoBackend(dados) {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao consultar clientes");

        const clientes = await response.json();
        const clienteExistente = clientes.find(cliente => cliente.email === usuarioLogado.email || cliente.email === dados.email);
        const url = clienteExistente ? `${API_URL}/${clienteExistente.id}` : API_URL;
        const metodo = clienteExistente ? "PUT" : "POST";

        const salvarResponse = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        return salvarResponse.ok;
    } catch (error) {
        console.error("Erro ao salvar dados do aluno no backend:", error);
        return false;
    }
}

async function editarCliente(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar cliente");

        const cliente = await response.json();

        document.getElementById("cliente-id").value = cliente.id;
        document.getElementById("nome-completo").value = cliente.nomeCompleto || "";
        document.getElementById("telefone").value = cliente.telefone || "";
        document.getElementById("email").value = cliente.email || "";
        document.getElementById("cpf").value = cliente.cpf || "";
        document.getElementById("cep").value = cliente.cep || "";
        document.getElementById("rua").value = cliente.rua || "";
        document.getElementById("numero-casa").value = cliente.numeroCasa || "";
        document.getElementById("referencia").value = cliente.referencia || "";

        if (document.getElementById("titulo-form")) document.getElementById("titulo-form").innerText = "Atualizar Cliente";
        if (document.getElementById("btn-salvar")) document.getElementById("btn-salvar").innerText = "Atualizar";
        if (document.getElementById("btn-cancelar")) document.getElementById("btn-cancelar").style.display = "block";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Erro ao carregar cliente para edicao:", error);
    }
}

async function deletarCliente(id) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Erro ao deletar cliente");

        listarClientes();
    } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        alert("Nao foi possivel excluir o cliente.");
    }
}

function resetarFormulario() {
    if (!formCliente) return;
    if (usuarioLogado?.perfil === "ALUNO") {
        preencherFormularioAluno();
        return;
    }

    formCliente.reset();
    document.getElementById("cliente-id").value = "";
    if (document.getElementById("titulo-form")) document.getElementById("titulo-form").innerText = "Cadastrar Cliente";
    if (document.getElementById("btn-salvar")) document.getElementById("btn-salvar").innerText = "Salvar";
    if (document.getElementById("btn-cancelar")) document.getElementById("btn-cancelar").style.display = "none";
}

function carregarUsuarios() {
    return JSON.parse(localStorage.getItem(USUARIOS_STORAGE_KEY) || "[]");
}

function obterIniciais(nome) {
    return String(nome || "AL")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join("");
}
