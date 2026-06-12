package br.com.escola.biblioteca.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "whatsapp")
    private String whatsapp;

    @Column(name = "instituicao")
    private String instituicao;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Column(name = "email", unique = true)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "senha")
    private String senha;

    @Column(name = "perfil")
    private String perfil;

    @Lob
    @Column(name = "foto", columnDefinition = "TEXT")
    private String foto;

    @NotBlank(message = "CPF é obrigatório")
    @Column(name = "cpf", unique = true)
    private String cpf;

    // TORNAR OPCIONAIS - remover @NotBlank
    @Column(name = "cep")
    private String cep;

    @Column(name = "rua")
    private String rua;

    @Column(name = "numero_casa")
    private String numeroCasa;

    @Column(name = "referencia")
    private String referencia;

    @Column(name = "ativo")
    private Boolean ativo = true;
}