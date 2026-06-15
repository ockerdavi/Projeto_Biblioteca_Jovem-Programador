const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/clientes`;
const SESSAO_STORAGE_KEY = "biblioteca_usuario_logado";
const USUARIOS_STORAGE_KEY = "biblioteca_usuarios_teste";

const formCliente = document.getElementById("form-cliente");
const tabelaClientesBody = document.querySelector("#tabela-clientes tbody");

let usuarioLogado = null;

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

    if (nome) nome.innerText = usuarioLogado?.nomeCompleto || usuarioLogado?.nome || "Meus dados";
    if (email) email.innerText = usuarioLogado?.email || "";

    if (!avatar) return;

    if (usuarioLogado?.foto) {
        avatar.innerHTML = `<img src="${usuarioLogado.foto}" alt="Foto">`;
    } else {
        avatar.innerText = obterIniciais(usuarioLogado?.nomeCompleto || usuarioLogado?.nome);
    }
}

function preencherFormularioAluno() {
    const usuarios = carregarUsuarios();
    const dadosAluno = usuarios.find(u => u.email === usuarioLogado?.email) || usuarioLogado;

    document.getElementById("cliente-id").value = dadosAluno?.id || "";
    document.getElementById("nome-completo").value = dadosAluno?.nomeCompleto || dadosAluno?.nome || "";
    document.getElementById("telefone").value = dadosAluno?.telefone || "";
    document.getElementById("email").value = dadosAluno?.email || "";
    document.getElementById("senha").value = "";
    document.getElementById("cpf").value = dadosAluno?.cpf || "";
    document.getElementById("perfil").value = dadosAluno?.perfil || "ALUNO";
    document.getElementById("cep").value = dadosAluno?.cep || "";
    document.getElementById("rua").value = dadosAluno?.rua || "";
    document.getElementById("numero-casa").value = dadosAluno?.numeroCasa || "";
    document.getElementById("referencia").value = dadosAluno?.referencia || "";
}

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
                <td class="text-center bold">${cliente.perfil || "ALUNO"}</td>
                <td class="text-center bold">${cliente.cpf || ""}</td>
                <td class="text-center bold">${cliente.cep || ""}</td>
                <td class="text-left">${endereco}</td>
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

async function salvarCliente() {
    if (usuarioLogado?.perfil === "ALUNO") {
        await atualizarDadosAluno();
        return;
    }

    const id = document.getElementById("cliente-id").value;
    
    // Obter TODOS os campos com valores padrão (NUNCA null)
    const dadosCliente = {
        nomeCompleto: document.getElementById("nome-completo")?.value || "Nome não informado",
        telefone: document.getElementById("telefone")?.value || "",
        email: document.getElementById("email")?.value || "email@exemplo.com",
        senha: document.getElementById("senha")?.value || "senha123",
        cpf: document.getElementById("cpf")?.value || "00000000000",
        perfil: document.getElementById("perfil")?.value || "ALUNO",
        cep: document.getElementById("cep")?.value || "00000000",
        rua: document.getElementById("rua")?.value || "Rua não informada",
        numeroCasa: document.getElementById("numero-casa")?.value || "0",
        referencia: document.getElementById("referencia")?.value || "",
        ativo: true,
        whatsapp: document.getElementById("telefone")?.value || "",
        instituicao: ""
    };

    // Validar se os campos OBRIGATÓRIOS foram preenchidos (não os padrão)
    if (dadosCliente.nomeCompleto === "Nome não informado") {
        alert("Por favor, preencha o Nome Completo");
        return;
    }
    
    if (dadosCliente.email === "email@exemplo.com") {
        alert("Por favor, preencha o Email");
        return;
    }
    
    if (document.getElementById("senha")?.value === "") {
        alert("Por favor, preencha a Senha");
        return;
    }

    console.log("Enviando dados:", dadosCliente);

    try {
        let url = API_URL;
        let metodo = "POST";

        if (id) {
            url = `${API_URL}/${id}`;
            metodo = "PUT";
            // Para update, não enviar senha se estiver vazia
            if (!document.getElementById("senha")?.value) {
                delete dadosCliente.senha;
            }
        }

        const response = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosCliente)
        });

        if (!response.ok) {
            const erroText = await response.text();
            console.error("Erro do backend:", erroText);
            throw new Error("Erro ao salvar cliente");
        }

        alert(id ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
        resetarFormulario();
        listarClientes();
        
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        alert("Ocorreu um erro ao salvar o cliente. Verifique se todos os campos obrigatórios estão preenchidos.");
    }
}

async function atualizarDadosAluno() {
    // Obter dados com valores padrão
    const dados = {
        nomeCompleto: document.getElementById("nome-completo")?.value || "",
        telefone: document.getElementById("telefone")?.value || "",
        email: document.getElementById("email")?.value || "",
        senha: document.getElementById("senha")?.value || "",
        cpf: document.getElementById("cpf")?.value || "",
        perfil: "ALUNO",
        cep: document.getElementById("cep")?.value || "",
        rua: document.getElementById("rua")?.value || "",
        numeroCasa: document.getElementById("numero-casa")?.value || "",
        referencia: document.getElementById("referencia")?.value || "",
        ativo: true
    };
    
    // Validar campos obrigatórios
    if (!dados.nomeCompleto || !dados.email || !dados.cpf) {
        alert("Nome, Email e CPF são obrigatórios!");
        return;
    }
    
    const usuarios = carregarUsuarios();
    const indiceUsuario = usuarios.findIndex(u => u.email === usuarioLogado.email);

    const usuarioAtualizado = {
        ...usuarioLogado,
        ...dados
    };
    
    if (dados.senha && dados.senha !== "") {
        usuarioAtualizado.senha = dados.senha;
    }

    if (indiceUsuario >= 0) {
        usuarios[indiceUsuario] = usuarioAtualizado;
        localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios));
    }

    localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify(usuarioAtualizado));
    usuarioLogado = usuarioAtualizado;
    preencherPerfilAluno();

    const salvoNoBackend = await salvarDadosAlunoNoBackend(usuarioAtualizado);
    if (salvoNoBackend) {
        alert("Seus dados foram atualizados no sistema.");
    } else {
        alert("Seus dados foram atualizados localmente.");
    }
}

async function salvarDadosAlunoNoBackend(dados) {
    try {
        const dadosEnvio = {
            nomeCompleto: dados.nomeCompleto || "",
            telefone: dados.telefone || "",
            email: dados.email || "",
            cpf: dados.cpf || "00000000000",
            perfil: "ALUNO",
            cep: dados.cep || "",
            rua: dados.rua || "",
            numeroCasa: dados.numeroCasa || "",
            referencia: dados.referencia || "",
            ativo: true
        };
        
        if (dados.senha) {
            dadosEnvio.senha = dados.senha;
        }
        
        if (dados.id) {
            const response = await fetch(`${API_URL}/${dados.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosEnvio)
            });
            return response.ok;
        } else {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosEnvio)
            });
            if (response.ok) {
                const novoCliente = await response.json();
                dados.id = novoCliente.id;
                localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify(dados));
            }
            return response.ok;
        }
    } catch (error) {
        console.error("Erro ao salvar no backend:", error);
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
        document.getElementById("senha").value = "";
        document.getElementById("cpf").value = cliente.cpf || "";
        document.getElementById("perfil").value = cliente.perfil || "ALUNO";
        document.getElementById("cep").value = cliente.cep || "";
        document.getElementById("rua").value = cliente.rua || "";
        document.getElementById("numero-casa").value = cliente.numeroCasa || "";
        document.getElementById("referencia").value = cliente.referencia || "";

        document.getElementById("titulo-form").innerText = "Atualizar Cliente";
        document.getElementById("btn-salvar").innerText = "Atualizar";
        document.getElementById("btn-cancelar").style.display = "block";

        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("Erro ao carregar cliente:", error);
        alert("Erro ao carregar dados do cliente.");
    }
}

async function deletarCliente(id) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Erro ao deletar cliente");

        alert("Cliente excluído com sucesso!");
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
    document.getElementById("senha").value = "";
    document.getElementById("perfil").value = "";
    document.getElementById("titulo-form").innerText = "Cadastrar Cliente";
    document.getElementById("btn-salvar").innerText = "Salvar";
    document.getElementById("btn-cancelar").style.display = "none";
}

function fecharTela() {
    if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.removeItem(SESSAO_STORAGE_KEY);
        window.location.href = './login.html';
    }
}

function carregarUsuarios() {
    return JSON.parse(localStorage.getItem(USUARIOS_STORAGE_KEY) || "[]");
}

function obterIniciais(nome) {
    if (!nome) return "AL";
    return String(nome)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join("");
}