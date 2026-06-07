// Endpoint do backend Spring Boot para o modulo de clientes.
const API_URL = "/api/clientes";

// Elementos principais da tela de clientes.
const formCliente = document.getElementById("form-cliente");
const tabelaClientesBody = document.querySelector("#tabela-clientes tbody");

// Carrega a tabela assim que a pagina estiver pronta.
document.addEventListener("DOMContentLoaded", listarClientes);

if (formCliente) {
    formCliente.addEventListener("submit", function (event) {
        event.preventDefault();
        salvarCliente();
    });
}

// Busca todos os clientes no backend e renderiza as linhas da tabela.
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

// Envia os dados do formulario para cadastrar ou atualizar um cliente.
async function salvarCliente() {
    const id = document.getElementById("cliente-id").value;
    const dadosCliente = {
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

// Busca um cliente por ID e preenche o formulario para edicao.
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

// Exclui um cliente cadastrado no backend.
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

// Limpa o formulario e volta a tela para o modo de cadastro.
function resetarFormulario() {
    if (!formCliente) return;

    formCliente.reset();
    document.getElementById("cliente-id").value = "";
    if (document.getElementById("titulo-form")) document.getElementById("titulo-form").innerText = "Cadastrar Cliente";
    if (document.getElementById("btn-salvar")) document.getElementById("btn-salvar").innerText = "Salvar";
    if (document.getElementById("btn-cancelar")) document.getElementById("btn-cancelar").style.display = "none";
}
