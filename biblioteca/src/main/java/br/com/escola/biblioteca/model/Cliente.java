package br.com.escola.biblioteca.model;
/* */
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @NotBlank(message = "Nome completo é obrigatório")
@Column(name = "nome_completo")
private String nomeCompleto;

    @NotBlank(message = "Telefone é obrigatório")
    @Column(name = "telefone")
    private String telefone;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Column(name = "email", unique = true)
    private String email;

    @NotBlank(message = "CPF é obrigatório")
    @Column(name = "cpf", unique = true)
    private String cpf;

    @NotBlank(message = "CEP é obrigatório")
    @Column(name = "cep")
    private String cep;

    @NotBlank(message = "Rua é obrigatória")
    @Column(name = "rua")
    private String rua;

    @NotBlank(message = "Número da casa é obrigatório")
    @Column(name = "numero_casa")
    private String numeroCasa;

    @Column(name = "referencia")
    private String referencia;

    @Column(name = "Ativo")
    private boolean ativo = true;
}
