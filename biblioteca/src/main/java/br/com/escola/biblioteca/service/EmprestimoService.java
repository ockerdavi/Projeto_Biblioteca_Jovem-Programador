// Define o pacote onde esta classe de serviço está localizada
package br.com.escola.biblioteca.service;

// Importa as entidades de modelo necessárias (Emprestimo e Livro)
import br.com.escola.biblioteca.model.Emprestimo;
import br.com.escola.biblioteca.model.Livro;

// Importa os repositórios para comunicação com o banco de dados
import br.com.escola.biblioteca.repository.EmprestimoRepository;
import br.com.escola.biblioteca.repository.LivroRepository;

// Importa a anotação do Spring para identificar esta classe como um componente de serviço
import org.springframework.stereotype.Service;

// Importa classes utilitárias do Java para cálculos financeiros e de datas
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

// Indica ao Spring que esta classe contém a lógica de negócio do sistema
@Service
public class EmprestimoService {

    // Declara as dependências dos repositórios como finais (imutáveis)
    private final EmprestimoRepository repository;
    private final LivroRepository livroRepository;

    // Construtor para injeção de dependência automática pelo Spring
    public EmprestimoService(
            EmprestimoRepository repository,
            LivroRepository livroRepository) {

        this.repository = repository;
        this.livroRepository = livroRepository;
    }

    // Método responsável por registrar um novo empréstimo de livro
    public Emprestimo emprestar(Emprestimo emprestimo) {

        // Recupera o livro associado ao empréstimo enviado
        Livro livro = emprestimo.getLivro();

        // Verifica se a quantidade de livros disponíveis em estoque é zero ou menor
        if (livro.getQuantidadeDisponivel() <= 0) {
            // Lança um erro caso o livro não esteja disponível para empréstimo
            throw new RuntimeException("Livro indispinível");
        }

        // Subtrai 1 da quantidade de livros disponíveis no estoque
        livro.setQuantidadeDisponivel(
                livro.getQuantidadeDisponivel() - 1);

        // Adiciona 1 à quantidade de livros atualmente alugados
        livro.setQuantidadeAlugada(
                livro.getQuantidadeAlugada() + 1);

        // Atualiza as quantidades do livro no banco de dados
        livroRepository.save(livro);

        // Define a data do empréstimo como a data atual do sistema
        emprestimo.setDataEmprestimo(LocalDate.now());

        // Calcula e define a data prevista de entrega somando os dias permitidos à data atual
        emprestimo.setDataPrevistaEntrega(
                LocalDate.now().plusDays(
                        emprestimo.getDiasPermitidos()));
        
        // Define o status inicial do registro como "EMPRESTADO"
        emprestimo.setStatus("EMPRESTADO");
        
        // Inicializa o valor da multa como zero
        emprestimo.setMulta(BigDecimal.ZERO);
        
        // Salva o novo empréstimo no banco de dados e retorna o objeto persistido
        return repository.save(emprestimo);
    }

    // Método responsável por processar a devolução de um livro pelo ID do empréstimo
    public Emprestimo devolver(Long id) {
        // Busca o empréstimo pelo ID; se não encontrar, lança uma exceção
        Emprestimo emprestimo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empréstimo não encontrado"));
        
        // Define a data em que a entrega está sendo feita como a data atual
        emprestimo.setDataEntrega(LocalDate.now());
        
        // Recupera o livro que está sendo devolvido
        Livro livro = emprestimo.getLivro();
        
        // Devolve 1 unidade para a quantidade de livros disponíveis no estoque
        livro.setQuantidadeDisponivel(
                livro.getQuantidadeDisponivel() + 1);
        
        // Subtrai 1 unidade da quantidade de livros alugados
        livro.setQuantidadeAlugada(
                livro.getQuantidadeAlugada() - 1);
        
        // Salva as alterações de estoque do livro no banco de dados
        livroRepository.save(livro);
        
        // Calcula a diferença em dias entre a data prevista de entrega e a data real de entrega
        long diasAtrasados = ChronoUnit.DAYS.between(
                emprestimo.getDataPrevistaEntrega(),
                LocalDate.now());
        
        // Se a diferença de dias for maior que zero, significa que há atraso
        if (diasAtrasados > 0) {
            // Multiplica o valor da multa diária pelo número de dias em atraso
            BigDecimal multa = emprestimo
                    .getValorMultaDiaria()
                    .multiply(BigDecimal.valueOf(diasAtrasados));
            
            // Define o valor calculado da multa no empréstimo
            emprestimo.setMulta(multa);
            
            // Altera o status do empréstimo para "ATRASADO"
            emprestimo.setStatus("ATRASADO");
        } else {
            // Se não houver atraso, define o status do empréstimo como "ENTREGUE"
            emprestimo.setStatus("ENTREGUE");
        }
        
        // Atualiza e salva as informações finais do empréstimo no banco de dados
        return repository.save(emprestimo);
    }
}
