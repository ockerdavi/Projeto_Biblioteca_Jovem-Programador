// EmprestimoUpdateDTO.java
package br.com.escola.biblioteca.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class EmprestimoUpdateDTO {
    private Long clienteId;
    private Long livroId;
    private LocalDate dataEmprestimo;
    private LocalDate dataPrevistaEntrega;
    private LocalDate dataEntrega;
    private Integer diasPermitidos;
    private String status;
    private BigDecimal multa;
    private BigDecimal valorMultaDiaria;
    
    // Construtores
    public EmprestimoUpdateDTO() {}
    
    public EmprestimoUpdateDTO(Long clienteId, Long livroId, LocalDate dataEmprestimo, 
                                LocalDate dataPrevistaEntrega, LocalDate dataEntrega, 
                                Integer diasPermitidos, String status, 
                                BigDecimal multa, BigDecimal valorMultaDiaria) {
        this.clienteId = clienteId;
        this.livroId = livroId;
        this.dataEmprestimo = dataEmprestimo;
        this.dataPrevistaEntrega = dataPrevistaEntrega;
        this.dataEntrega = dataEntrega;
        this.diasPermitidos = diasPermitidos;
        this.status = status;
        this.multa = multa;
        this.valorMultaDiaria = valorMultaDiaria;
    }
    
    // Getters
    public Long getClienteId() { return clienteId; }
    public Long getLivroId() { return livroId; }
    public LocalDate getDataEmprestimo() { return dataEmprestimo; }
    public LocalDate getDataPrevistaEntrega() { return dataPrevistaEntrega; }
    public LocalDate getDataEntrega() { return dataEntrega; }
    public Integer getDiasPermitidos() { return diasPermitidos; }
    public String getStatus() { return status; }
    public BigDecimal getMulta() { return multa; }
    public BigDecimal getValorMultaDiaria() { return valorMultaDiaria; }
    
    // Setters
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public void setLivroId(Long livroId) { this.livroId = livroId; }
    public void setDataEmprestimo(LocalDate dataEmprestimo) { this.dataEmprestimo = dataEmprestimo; }
    public void setDataPrevistaEntrega(LocalDate dataPrevistaEntrega) { this.dataPrevistaEntrega = dataPrevistaEntrega; }
    public void setDataEntrega(LocalDate dataEntrega) { this.dataEntrega = dataEntrega; }
    public void setDiasPermitidos(Integer diasPermitidos) { this.diasPermitidos = diasPermitidos; }
    public void setStatus(String status) { this.status = status; }
    public void setMulta(BigDecimal multa) { this.multa = multa; }
    public void setValorMultaDiaria(BigDecimal valorMultaDiaria) { this.valorMultaDiaria = valorMultaDiaria; }
}