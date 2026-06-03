const formLivro = document.getElementById("form-livro");
const tabelaLivrosBody = document.querySelector("#tabela-livros tbody");

document.addEventListener("DOMContentLoaded", listarLivros);

formLivro.addEventListener("submit", function (event) {
    event.preventDefault();
    salvarLivro();
});

// SIMULA GET
function listarLivros() {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    tabelaLivrosBody.innerHTML = "";

    const badgeTotal = document.getElementById("badge-total");
    badgeTotal.innerText = `Acervo - ${livros.length} títulos`;

    livros.forEach(livro => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="text-center">${String(livro.id).padStart(2, "0")}</td>
            <td class="text-left font-serif bold">${livro.titulo}</td>
            <td class="text-center bold">${livro.quantidade}</td>
            <td class="text-center bold">${livro.alugados || 0}</td>
            <td class="text-center">
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editarLivro(${livro.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="deletarLivro(${livro.id})">Excluir</button>
                </div>
            </td>
        `;

        tabelaLivrosBody.appendChild(tr);
    });
}

// SIMULA POST E PUT
function salvarLivro() {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];

    const id = document.getElementById("livro-id").value;

    const dadosLivro = {
        id: id ? Number(id) : Date.now(),
        titulo: document.getElementById("titulo").value,
        autor: document.getElementById("autor").value,
        isbn: document.getElementById("isbn").value,
        categoria: document.getElementById("categoria").value,
        quantidade: Number(document.getElementById("quantidade").value),
        alugados: 0
    };

    if (id) {
        const index = livros.findIndex(livro => livro.id === Number(id));
        livros[index] = dadosLivro;
        console.log("PUT - Livro atualizado:", dadosLivro);
    } else {
        livros.push(dadosLivro);
        console.log("POST - Livro cadastrado:", dadosLivro);
    }

    localStorage.setItem("livros", JSON.stringify(livros));

    resetarFormulario();
    listarLivros();
}

// PREPARA PUT
function editarLivro(id) {
    const livros = JSON.parse(localStorage.getItem("livros")) || [];
    const livro = livros.find(livro => livro.id === id);

    document.getElementById("livro-id").value = livro.id;
    document.getElementById("titulo").value = livro.titulo;
    document.getElementById("autor").value = livro.autor;
    document.getElementById("isbn").value = livro.isbn;
    document.getElementById("categoria").value = livro.categoria;
    document.getElementById("quantidade").value = livro.quantidade;

    document.getElementById("titulo-form").innerText = "Atualizar Livro";
    document.getElementById("btn-salvar").innerText = "Atualizar";
    document.getElementById("btn-cancelar").style.display = "block";

    console.log("GET por ID - Livro carregado:", livro);
}

// SIMULA DELETE
function deletarLivro(id) {
    if (!confirm("Deseja realmente excluir este livro?")) return;

    let livros = JSON.parse(localStorage.getItem("livros")) || [];

    livros = livros.filter(livro => livro.id !== id);

    localStorage.setItem("livros", JSON.stringify(livros));

    console.log("DELETE - Livro removido ID:", id);

    listarLivros();
}

function resetarFormulario() {
    formLivro.reset();

    document.getElementById("livro-id").value = "";
    document.getElementById("titulo-form").innerText = "Cadastrar Livro";
    document.getElementById("btn-salvar").innerText = "Salvar";
    document.getElementById("btn-cancelar").style.display = "none";
}