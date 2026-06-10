// Aguarda o carregamento completo do DOM
const API_BASE_URL = "http://localhost:8080";
const EMPRESTIMOS_API_URL = `${API_BASE_URL}/api/emprestimos`;

document.addEventListener('DOMContentLoaded', () => {
    const formDevolucao = document.getElementById('form-devolucao');
    if (!formDevolucao) return;

    // 1. Injeção dinâmica do Checkbox "Data de hoje" para manter o padrão visual do CSS
    const inputData = document.getElementById('data-devolucao');
    const grupoInputData = inputData.parentElement;

    // Cria o container do checkbox
    const containerCheckbox = document.createElement('div');
    containerCheckbox.className = 'grupo-checkbox';
    containerCheckbox.style.display = 'flex';
    containerCheckbox.style.alignItems = 'center';
    containerCheckbox.style.gap = '8px';
    containerCheckbox.style.marginTop = '8px';

    // Cria o elemento checkbox
    const checkboxHoje = document.createElement('input');
    checkboxHoje.type = 'checkbox';
    checkboxHoje.id = 'checkbox-hoje';
    checkboxHoje.checked = true; // Inicia marcado por padrão (fácil usabilidade)

    // Cria a label do checkbox
    const labelHoje = document.createElement('label');
    labelHoje.htmlFor = 'checkbox-hoje';
    labelHoje.textContent = 'Usar a data de hoje';
    labelHoje.style.fontSize = '0.85rem';
    labelHoje.style.color = '#113328';
    labelHoje.style.cursor = 'pointer';

    containerCheckbox.appendChild(checkboxHoje);
    containerCheckbox.appendChild(labelHoje);
    grupoInputData.appendChild(containerCheckbox);

    // 2. Lógica de comportamento do Input de Data baseado no Checkbox
    const gerenciarEstadoData = () => {
        if (checkboxHoje.checked) {
            // Se for hoje, seta a data atual do sistema no input e desabilita a edição manual
            const hoje = new Date().toISOString().split('T')[0];
            inputData.value = hoje;
            inputData.disabled = true;
            inputData.style.opacity = '0.6';
        } else {
            // Se desmarcar, limpa e deixa o usuário escolher a data retroativa
            inputData.disabled = false;
            inputData.style.opacity = '1';
            inputData.value = '';
        }
    };

    // Executa a validação no carregamento e escuta mudanças no checkbox
    gerenciarEstadoData();
    checkboxHoje.addEventListener('change', gerenciarEstadoData);

    // 3. Interceptação do Submit do Formulário
    formDevolucao.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        // Captura dos valores do formulário
        const codigoOuIsbn = document.getElementById('codigo-livro').value.trim();
        const dataDevolucao = inputData.value;

        // Validação básica de segurança
        if (!codigoOuIsbn || !dataDevolucao) {
            showTempMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        try {
            const emprestimoId = await resolverEmprestimoId(codigoOuIsbn);
            let url = `${EMPRESTIMOS_API_URL}/devolver/${emprestimoId}`;
            let options = { method: 'PUT' };

            // Se o checkbox NÃO estiver marcado, envia a data escolhida no corpo (JSON)
            // Conforme a regra de negócio discutida pela Equipe 1
            if (!checkboxHoje.checked) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify({
                    dataEntrega: dataDevolucao
                });
            } else {
                // Se for a data de hoje, assume o comportamento padrão do backend (LocalDate.now())
                // Opcional: Se seu backend exigir o JSON mesmo com a data de hoje, basta remover o 'if' e enviar o body sempre.
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify({});
            }

            // Exibe log para debug dos devs
            console.log('Enviando requisição de devolução para:', url, options);

            const response = await fetch(url, options);

            if (response.ok) {
                showTempMessage('Devolução registrada com sucesso!', 'success');
                formDevolucao.reset();
                checkboxHoje.checked = true;
                gerenciarEstadoData();

                // Função fictícia para recarregar a tabela de multas/pendências caso necessário
                if (typeof atualizarTabelaMultas === 'function') atualizarTabelaMultas();
            } else {
                const erroTexto = await response.text();
                console.error('Erro retornado pelo backend:', response.status, erroTexto);
                showTempMessage(`Erro ao devolver: ${response.status}`, 'error');
            }

        } catch (error) {
            console.error('Falha na comunicação com o servidor:', error);
            showTempMessage(error.message || 'Falha ao conectar com o backend.', 'error');
        }
    });
});

async function resolverEmprestimoId(codigoOuIsbn) {
    if (/^\d+$/.test(codigoOuIsbn)) {
        return codigoOuIsbn;
    }

    const response = await fetch(EMPRESTIMOS_API_URL);
    if (!response.ok) throw new Error('Nao foi possivel consultar emprestimos.');

    const emprestimos = await response.json();
    const emprestimo = emprestimos.find(item =>
        item.livro?.isbn === codigoOuIsbn &&
        ['EMPRESTADO', 'EM_ANDAMENTO', 'ATRASADO'].includes(item.status)
    );

    if (!emprestimo) {
        throw new Error('Nenhum emprestimo ativo encontrado para este ISBN.');
    }

    return emprestimo.id;
}

// 4. Função auxiliar de Feedback Visual (Mantendo o padrão do seu script de teste)
function showTempMessage(msg, type) {
    const existing = document.getElementById('frontend-backend-msg');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.id = 'frontend-backend-msg';
    div.textContent = msg;
    div.style.position = 'fixed';
    div.style.right = '16px';
    div.style.bottom = '16px';
    div.style.padding = '12px 18px';
    div.style.borderRadius = '8px';
    div.style.color = '#fff';
    div.style.zIndex = '9999';
    div.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
    div.style.fontWeight = '500';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    if (type === 'success') {
        div.style.background = 'rgba(40, 167, 69, 0.95)'; // Verde sucesso
    } else {
        div.style.background = 'rgba(220, 53, 69, 0.95)'; // Vermelho erro
    }

    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}
