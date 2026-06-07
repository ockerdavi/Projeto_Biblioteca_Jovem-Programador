// Altere esta URL para o endereço real da API do grupo de Back-End
const API_URL = "/api/livros";

const formLivro = document.getElementById('form-livro');
const tabelaLivrosBody = document.querySelector('#tabela-livros tbody');

document.addEventListener('DOMContentLoaded', listarLivros);

if (formLivro) {
    formLivro.addEventListener('submit', function (event) {
        event.preventDefault();
        salvarLivro();
    });
}

// GET - Listar Livros da API
async function listarLivros() {
    if (!tabelaLivrosBody) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar dados da API');
        
        const livros = await response.json();
        tabelaLivrosBody.innerHTML = ""; 
        
        const badgeTotal = document.getElementById('badge-total');
        if (badgeTotal) {
            badgeTotal.innerText = `Acervo - ${livros.length} títulos`;
        }

        livros.forEach(livro => {
            // Garante tratamento se a propriedade vier com nome diferente do Back-end
            const qtdDisponivel = livro.quantidadeDisponivel ?? livro.disponiveis ?? livro.quantidade ?? 0;
            const qtdAlugados = livro.quantidadeAlugada ?? livro.alugados ?? 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center">${String(livro.id).padStart(2, '0')}</td>
                <td class="text-left font-serif bold">${livro.titulo}</td>
                <td class="text-center bold">${qtdDisponivel}</td>
                <td class="text-center bold">${qtdAlugados}</td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editarLivro('${livro.id}')">Editar</button>
                        <button class="btn-action btn-delete" onclick="deletarLivro('${livro.id}')">Excluir</button>
                    </div>
                </td>
            `;
            tabelaLivrosBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao listar livros:", error);
        alert("Não foi possível conectar à API. Verifique se o Back-End está rodando.");
    }
}

// POST ou PUT - Salvar Livro na API
async function salvarLivro() {
    const id = document.getElementById("livro-id").value;
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const isbn = document.getElementById("isbn").value;
    const categoria = document.getElementById("categoria").value;
    const quantidadeTotal = Number(document.getElementById("quantidade").value);

    // DADOS FORMATADOS: Alinhados com os inputs existentes no HTML atual
    const dadosLivro = { 
        titulo, 
        autor, 
        isbn, 
        categoria,
        quantidadeTotal
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
            body: JSON.stringify(dadosLivro)
        });

        if (!response.ok) throw new Error('Erro ao salvar os dados na API');

        resetarFormulario();
        listarLivros();
    } catch (error) {
        console.error("Erro ao salvar livro:", error);
        alert("Ocorreu um erro ao salvar o livro na API.");
    }
}

// GET (por ID) - Prepara o formulário capturando dados da API
async function editarLivro(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar detalhes do livro');
        
        const livro = await response.json();

        document.getElementById("livro-id").value = livro.id;
        document.getElementById("titulo").value = livro.titulo;
        document.getElementById("autor").value = livro.autor;
        document.getElementById("isbn").value = livro.isbn;
        document.getElementById("categoria").value = livro.categoria || "";
        document.getElementById("quantidade").value = livro.quantidadeTotal || livro.quantidade || "";
        
        if (document.getElementById('titulo-form')) document.getElementById('titulo-form').innerText = 'Atualizar Livro';
        if (document.getElementById('btn-salvar')) document.getElementById('btn-salvar').innerText = 'Atualizar';
        if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error("Erro ao carregar livro para edição:", error);
    }
}

// DELETE - Deletar Livro da API
async function deletarLivro(id) {
    if (!confirm("Deseja realmente excluir este livro?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error('Erro ao deletar livro na API');
        
        listarLivros();
    } catch (error) {
        console.error("Erro ao deletar livro:", error);
        alert("Não foi possível excluir o livro.");
    }
}

function resetarFormulario() {
    if (!formLivro) return;
    formLivro.reset();
    document.getElementById('livro-id').value = '';
    if (document.getElementById('titulo-form')) document.getElementById('titulo-form').innerText = 'Cadastrar Livro';
    if (document.getElementById('btn-salvar')) document.getElementById('btn-salvar').innerText = 'Salvar';
    if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = 'none';
}
