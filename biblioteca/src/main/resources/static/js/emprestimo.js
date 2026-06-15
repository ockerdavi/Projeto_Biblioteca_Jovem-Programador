const API_BASE_URL = "http://localhost:8080";
const API_CLIENTES = `${API_BASE_URL}/api/clientes`;
const API_LIVROS = `${API_BASE_URL}/api/livros`;
const API_EMPRESTIMOS = `${API_BASE_URL}/api/emprestimos`;

const form = document.getElementById("form-emprestimo");
const selectCliente = document.getElementById("cliente");
const selectLivro = document.getElementById("livro");
const livroDisponivel = document.getElementById("livro-disponivel");
const tabelaBody = document.getElementById("tabela-emprestimos-body");
const badgeTotal = document.getElementById("badge-total");

let livrosCache = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarLivros();
    carregarEmprestimos();
});

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await registrarEmprestimo();
    });
}

async function carregarClientes() {
    try {
        const response = await fetch(API_CLIENTES);
        if (!response.ok) throw new Error("Erro ao carregar clientes");
        const clientes = await response.json();
        
        if (selectCliente) {
            selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';
            clientes.forEach(cliente => {
                const option = document.createElement("option");
                option.value = cliente.id;
                option.textContent = `${cliente.nomeCompleto} - ${cliente.email}`;
                selectCliente.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }
}

async function carregarLivros() {
    try {
        const response = await fetch(API_LIVROS);
        if (!response.ok) throw new Error("Erro ao carregar livros");
        livrosCache = await response.json();
        
        if (selectLivro) {
            selectLivro.innerHTML = '<option value="">Selecione um livro</option>';
            livrosCache.forEach(livro => {
                const qtdDisponivel = livro.quantidadeDisponivel ?? livro.quantidadeTotal ?? 0;
                const option = document.createElement("option");
                option.value = livro.id;
                option.textContent = `${livro.titulo} (${qtdDisponivel} disponíveis)`;
                option.disabled = qtdDisponivel <= 0;
                selectLivro.appendChild(option);
            });
        }
        
        if (selectLivro) {
            selectLivro.addEventListener("change", () => {
                const livroId = selectLivro.value;
                const livro = livrosCache.find(l => l.id == livroId);
                if (livro && livroDisponivel) {
                    const multa = livro.valorMultaDiaria ? `R$ ${livro.valorMultaDiaria}` : "R$ 2,00";
                    livroDisponivel.textContent = `Disponíveis: ${livro.quantidadeDisponivel ?? livro.quantidadeTotal} | Multa padrão: ${multa}`;
                } else if (livroDisponivel) {
                    livroDisponivel.textContent = "";
                }
            });
        }
    } catch (error) {
        console.error("Erro ao carregar livros:", error);
    }
}

async function carregarEmprestimos() {
    if (!tabelaBody) return;
    
    try {
        const response = await fetch(API_EMPRESTIMOS);
        if (!response.ok) throw new Error("Erro ao carregar empréstimos");
        
        const emprestimos = await response.json();
        tabelaBody.innerHTML = "";
        
        if (badgeTotal) {
            badgeTotal.innerText = `Emprestimos - ${emprestimos.length} registros`;
        }
        
        if (emprestimos.length === 0) {
            tabelaBody.innerHTML = '<tr><td colspan="10" class="text-center">Nenhum empréstimo registrado</td></tr>';
            return;
        }
        
        emprestimos.forEach(emp => {
            const tr = document.createElement("tr");
            const dataEmprestimo = emp.dataEmprestimo ? formatarData(emp.dataEmprestimo) : "-";
            const dataPrevista = emp.dataPrevistaEntrega ? formatarData(emp.dataPrevistaEntrega) : "-";
            const dataEntrega = emp.dataEntrega ? formatarData(emp.dataEntrega) : "-";
            const multa = emp.multa ? `R$ ${emp.multa}` : "R$ 0,00";
            
            let statusClass = "";
            let statusTexto = emp.status || "-";
            switch (emp.status) {
                case "PENDENTE":
                    statusClass = "status-pendente";
                    statusTexto = "⏳ Pendente";
                    break;
                case "AUTORIZADA":
                    statusClass = "status-autorizada";
                    statusTexto = "✅ Autorizada";
                    break;
                case "EM_ANDAMENTO":
                    statusClass = "status-emprestado";
                    statusTexto = "📚 Em andamento";
                    break;
                case "DEVOLVIDO":
                    statusClass = "status-devolvido";
                    statusTexto = "✔️ Devolvido";
                    break;
                case "DEVOLVIDO_COM_MULTA":
                    statusClass = "status-multa";
                    statusTexto = "⚠️ Devolvido com multa";
                    break;
            }
            
            tr.innerHTML = `
                <td class="text-center">${String(emp.id).padStart(2, "0")}</td>
                <td class="text-left font-serif bold">${emp.cliente?.nomeCompleto || "-"}</td>
                <td class="text-left">${emp.livro?.titulo || "-"}</td>
                <td class="text-center">${dataEmprestimo}</td>
                <td class="text-center">${dataPrevista}</td>
                <td class="text-center">${dataEntrega}</td>
                <td class="text-center">${emp.diasPermitidos || "-"}</td>
                <td class="text-center ${statusClass} bold">${statusTexto}</td>
                <td class="text-center bold">${multa}</td>
                <td class="text-center">
                    <div class="action-buttons">
                        ${emp.status === "EM_ANDAMENTO" ? `<button class="btn-action btn-edit" onclick="devolverLivro(${emp.id})">📦 Devolver</button>` : ""}
                        ${emp.status === "PENDENTE" ? `<button class="btn-action btn-edit" onclick="autorizarReserva(${emp.id})">✅ Autorizar</button>` : ""}
                        ${emp.status === "AUTORIZADA" ? `<button class="btn-action btn-delete" onclick="darBaixaReserva(${emp.id})">📖 Dar baixa</button>` : ""}
                    </div>
                </td>
            `;
            tabelaBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);
        tabelaBody.innerHTML = '<tr><td colspan="10" class="text-center">Erro ao carregar empréstimos</td></tr>';
    }
}

async function registrarEmprestimo() {
    if (!selectCliente || !selectLivro) {
        console.error("Elementos do formulário não encontrados");
        alert("Erro: Formulário não carregado corretamente");
        return;
    }
    
    const clienteId = selectCliente.value;
    const livroId = selectLivro.value;
    const diasPermitidosInput = document.getElementById("diasPermitidos");
    const multaDiariaInput = document.getElementById("multaDiaria");
    const statusInput = document.getElementById("status");
    
    if (!diasPermitidosInput) {
        console.error("Campo 'diasPermitidos' não encontrado");
        alert("Erro: Campo 'Dias permitidos' não encontrado");
        return;
    }
    
    const diasPermitidos = diasPermitidosInput.value;
    const status = statusInput ? statusInput.value : "EM_ANDAMENTO";
    
    if (!clienteId || !livroId || !diasPermitidos) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }
    
    // Payload SEM o campo valorMultaDiaria - o backend busca do livro
    const payload = {
        clienteId: parseInt(clienteId),
        livroId: parseInt(livroId),
        diasPermitidos: parseInt(diasPermitidos),
        status: status
    };
    
    console.log("Enviando payload:", payload);
    
    try {
        const response = await fetch(API_EMPRESTIMOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const erro = await response.text();
            throw new Error(erro || "Erro ao registrar empréstimo");
        }
        
        const emprestimo = await response.json();
        alert(`Empréstimo registrado com sucesso!`);
        resetarFormulario();
        carregarEmprestimos();
        carregarLivros();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao registrar empréstimo: " + error.message);
    }
}

async function devolverLivro(id) {
    if (!confirm("Confirmar devolução do livro?")) return;
    
    try {
        const response = await fetch(`${API_EMPRESTIMOS}/devolver/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) throw new Error("Erro ao registrar devolução");
        
        alert("Devolução registrada com sucesso!");
        carregarEmprestimos();
        carregarLivros();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao registrar devolução: " + error.message);
    }
}

async function autorizarReserva(id) {
    if (!confirm("Autorizar esta reserva?")) return;
    
    try {
        const response = await fetch(`${API_EMPRESTIMOS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "AUTORIZADA" })
        });
        
        if (!response.ok) throw new Error("Erro ao autorizar reserva");
        
        alert("Reserva autorizada com sucesso!");
        carregarEmprestimos();
        carregarLivros();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao autorizar reserva: " + error.message);
    }
}

async function darBaixaReserva(id) {
    if (!confirm("Confirmar retirada do livro?")) return;
    
    try {
        const response = await fetch(`${API_EMPRESTIMOS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "EM_ANDAMENTO" })
        });
        
        if (!response.ok) throw new Error("Erro ao registrar retirada");
        
        alert("Retirada registrada com sucesso!");
        carregarEmprestimos();
        carregarLivros();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao registrar retirada: " + error.message);
    }
}

function resetarFormulario() {
    if (form) form.reset();
    if (selectCliente) selectCliente.value = "";
    if (selectLivro) selectLivro.value = "";
    if (livroDisponivel) livroDisponivel.textContent = "";
    
    const diasPermitidosInput = document.getElementById("diasPermitidos");
    if (diasPermitidosInput) diasPermitidosInput.value = "7";
    
    const multaInput = document.getElementById("multaDiaria");
    if (multaInput) multaInput.value = "";
    
    const statusInput = document.getElementById("status");
    if (statusInput) statusInput.value = "EM_ANDAMENTO";
}

function formatarData(dataISO) {
    if (!dataISO) return "-";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

// Tornar funções globais
window.resetarFormulario = resetarFormulario;
window.devolverLivro = devolverLivro;
window.autorizarReserva = autorizarReserva;
window.darBaixaReserva = darBaixaReserva;