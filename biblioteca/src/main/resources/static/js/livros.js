// Inicializa o array buscando dados salvos localmente ou cria um array vazio
let livros = JSON.parse(localStorage.getItem("livros")) || [];

const formLivro = document.getElementById('form-livro');
const tabelaLivrosBody = document.querySelector('#tabela-livros tbody');

// Executa a listagem assim que a página carregar
document.addEventListener('DOMContentLoaded', listarLivros);

formLivro.addEventListener('submit', function (event) {
    event.preventDefault();
    salvarLivro();
});

// Função para Salvar ou Atualizar o livro no LocalStorage
function salvarLivro() {
    const id = document.getElementById("livro-id").value;
    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const isbn = document.getElementById("isbn").value;
    const ano = Number(document.getElementById("ano").value);
    const quantidadeTotal = Number(document.getElementById("quantidadeTotal").value);

    // Validação de quantidade básica
    if (quantidadeTotal <= 0) {
        alert("A quantidade total deve ser maior que zero.");
        return;
    }

    if (id) {
        // Atualiza um livro existente
        const index = livros.findIndex(livro => String(livro.id) === String(id));
        
        if (index !== -1) {
            // Garante que o usuário não abaixe a quantidade total para menos do que já foi emprestado
            if (quantidadeTotal < livros[index].quantidadeEmprestada) {
                alert(`Não é possível reduzir a quantidade total para ${quantidadeTotal}, pois já existem ${livros[index].quantidadeEmprestada} livros emprestados.`);
                return;
            }

            livros[index].titulo = titulo;
            livros[index].autor = autor;
            livros[index].isbn = isbn;
            livros[index].ano = ano;
            livros[index].quantidadeTotal = quantidadeTotal;
            
            // Recalcula disponíveis baseado no que já foi emprestado
            livros[index].quantidadeDisponivel = quantidadeTotal - livros[index].quantidadeEmprestada;
        }
    } else {
        // Cria um novo livro
        const novoLivro = {
            id: Date.now(),
            titulo: titulo,
            autor: autor,
            isbn: isbn,
            ano: ano,
            quantidadeTotal: quantidadeTotal,
            quantidadeDisponivel: quantidadeTotal, // Inicialmente tudo está disponível
            quantidadeEmprestada: 0 // Inicia com 0 empréstimos
        };
        livros.push(novoLivro);
    }

    // Salva no navegador e recarrega a tabela
    localStorage.setItem("livros", JSON.stringify(livros));
    resetarFormulario();
    listarLivros();
}

// Função para renderizar a tabela
function listarLivros() {
    // Garante que o elemento existe antes de tentar limpar
    if (!tabelaLivrosBody) return;
    
    tabelaLivrosBody.innerHTML = ""; // Limpa a tabela
    
    // Atualiza o contador de registros se o badge existir na tela
    const badgeTotal = document.getElementById('badge-total');
    if (badgeTotal) {
        badgeTotal.innerText = `${livros.length} registros`;
    }

    livros.forEach(livro => {
        const tr = document.createElement('tr');
        
        // Preenche as colunas incluindo as de estoque
        tr.innerHTML = `
            <td class="text-center">${livro.id}</td>
            <td class="text-left font-serif">${livro.titulo}</td>
            <td class="text-left">${livro.autor}</td>
            <td class="text-center">${livro.ano}</td>
            <td class="text-center bold">${livro.quantidadeTotal}</td>
            <td class="text-center bold" style="color: #4a6b3d;">${livro.quantidadeDisponivel}</td>
            <td class="text-center bold" style="color: #8a3a3a;">${livro.quantidadeEmprestada}</td>
            <td class="text-center action-buttons">
                <button class="btn-action btn-edit" onclick="editarLivro(${livro.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="deletarLivro(${livro.id})">Excluir</button>
            </td>
        `;
        tabelaLivrosBody.appendChild(tr);
    });
}

// Prepara o formulário para edição
function editarLivro(id) {
    const livro = livros.find(livro => String(livro.id) === String(id));
    
    if (livro) {
        document.getElementById("livro-id").value = livro.id;
        document.getElementById("titulo").value = livro.titulo;
        document.getElementById("autor").value = livro.autor;
        document.getElementById("isbn").value = livro.isbn;
        document.getElementById("ano").value = livro.ano;
        document.getElementById("quantidadeTotal").value = livro.quantidadeTotal;
        
        // Altera os textos do formulário para o modo de edição
        if (document.getElementById('titulo-form')) document.getElementById('titulo-form').innerText = 'Atualizar Livro';
        if (document.getElementById('btn-salvar')) document.getElementById('btn-salvar').innerText = 'Atualizar';
        if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Reseta o formulário voltando ao estado de cadastro
function resetarFormulario() {
    if (!formLivro) return;
    
    formLivro.reset();
    document.getElementById('livro-id').value = '';
    
    if (document.getElementById('titulo-form')) document.getElementById('titulo-form').innerText = 'Cadastrar Novo Livro';
    if (document.getElementById('btn-salvar')) document.getElementById('btn-salvar').innerText = 'Salvar Livro';
    if (document.getElementById('btn-cancelar')) document.getElementById('btn-cancelar').style.display = 'none';
}

// Remove o livro da lista e atualiza o LocalStorage
function deletarLivro(id) {
    const confirmar = confirm("Deseja excluir este livro?");
    if (confirmar) {
        livros = livros.filter(livro => String(livro.id) !== String(id));
        localStorage.setItem("livros", JSON.stringify(livros));
        listarLivros();
    }
}