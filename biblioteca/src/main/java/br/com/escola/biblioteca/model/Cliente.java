package main.java.br.com.escola.biblioteca.model;

import jakarta.persistence.*; 
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

private String nomeCompleto;
private String telefone; 
private String email;
private String cep;
private String rua;
private String numeroCasa;
private String referencia;

}