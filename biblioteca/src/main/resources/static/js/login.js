// Login / Cadastro frontend script

const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/clientes`;

const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const loginPerfil = document.getElementById("login-perfil");
const grupoModuloBibliotecario = document.getElementById("grupo-modulo-bibliotecario");
const cadastroPerfil = document.getElementById("cadastro-perfil");
const grupoCodigoBibliotecario = document.getElementById("grupo-codigo-bibliotecario");
const cadastroFoto = document.getElementById("cadastro-foto");

document.addEventListener("DOMContentLoaded", function() {
    inicializarCodigosMaster();
    configurarEventos();
});

function configurarEventos() {
    // Alterna entre os formularios de login e cadastro.
    const tabLogin = document.getElementById("tab-login");
    const tabCadastro = document.getElementById("tab-cadastro");
    
    if (tabLogin) {
        tabLogin.addEventListener("click", function() {
            mostrarAba("login");
        });
    }
    
    if (tabCadastro) {
        tabCadastro.addEventListener("click", function() {
            mostrarAba("cadastro");
        });
    }

    // Mostra o campo de codigo somente quando o usuario tenta cadastrar bibliotecario.
    if (cadastroPerfil) {
        cadastroPerfil.addEventListener("change", function() {
            const bibliotecarioSelecionado = cadastroPerfil.value === "BIBLIOTECARIO";
            if (grupoCodigoBibliotecario) {
                grupoCodigoBibliotecario.classList.toggle("hidden", !bibliotecarioSelecionado);
            }
            const codigoInput = document.getElementById("codigo-bibliotecario");
            if (codigoInput) {
                codigoInput.required = bibliotecarioSelecionado;
            }
        });
    }

    // Mostra a escolha de modulo no login somente para bibliotecario.
    if (loginPerfil) {
        loginPerfil.addEventListener("change", function() {
            const bibliotecarioSelecionado = loginPerfil.value === "BIBLIOTECARIO";
            if (grupoModuloBibliotecario) {
                grupoModuloBibliotecario.classList.toggle("hidden", !bibliotecarioSelecionado);
            }
            const moduloInput = document.getElementById("login-modulo");
            if (moduloInput) {
                moduloInput.required = bibliotecarioSelecionado;
            }
        });
    }

    if (formCadastro) {
        formCadastro.addEventListener("submit", function(event) {
            event.preventDefault();
            cadastrarUsuario();
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", function(event) {
            event.preventDefault();
            fazerLogin();
        });
    }
}

function mostrarAba(aba) {
    const loginAtivo = aba === "login";
    const tabLogin = document.getElementById("tab-login");
    const tabCadastro = document.getElementById("tab-cadastro");
    
    if (tabLogin) tabLogin.classList.toggle("active", loginAtivo);
    if (tabCadastro) tabCadastro.classList.toggle("active", !loginAtivo);
    
    if (formLogin) formLogin.classList.toggle("hidden", !loginAtivo);
    if (formCadastro) formCadastro.classList.toggle("hidden", loginAtivo);
}

// Cadastra usuario via backend
async function cadastrarUsuario() {
    const nome = document.getElementById("cadastro-nome").value.trim();
    const email = document.getElementById("cadastro-email").value.trim().toLowerCase();
    const cpf = document.getElementById("cadastro-cpf") ? document.getElementById("cadastro-cpf").value.trim() : "";
    const whatsapp = document.getElementById("cadastro-whatsapp").value.trim();
    const instituicao = document.getElementById("cadastro-instituicao").value.trim();
    const senha = document.getElementById("cadastro-senha").value;
    const perfil = document.getElementById("cadastro-perfil").value;
    const codigoBibliotecario = document.getElementById("codigo-bibliotecario").value;
    const foto = await obterFotoBase64(cadastroFoto ? cadastroFoto.files[0] : null);

    if (perfil === "BIBLIOTECARIO" && !codigoMasterValido(codigoBibliotecario)) {
        alert("Codigo de bibliotecario invalido. Solicite um codigo ao usuario master.");
        return;
    }

    const payload = { 
        nomeCompleto: nome, 
        email, 
        cpf,
        whatsapp, 
        instituicao, 
        senha, 
        perfil, 
        foto 
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Erro ao criar usuario');
        }

        if (formCadastro) formCadastro.reset();
        if (grupoCodigoBibliotecario) grupoCodigoBibliotecario.classList.add("hidden");
        alert("Cadastro criado com sucesso. Agora faca login.");
        mostrarAba("login");
    } catch (e) {
        const msg = e && e.message ? e.message : 'Erro ao criar usuario';
        alert(msg);
    }
}

// Faz login via backend
async function fazerLogin() {
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const senha = document.getElementById("login-senha").value;
    const perfilSelecionado = document.getElementById("login-perfil").value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Erro ao autenticar');
        }

        const usuario = await res.json();

        if (usuario.perfil !== perfilSelecionado) {
            alert("Este usuario nao possui permissao para entrar com o perfil selecionado.");
            return;
        }

        localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify({
            id: usuario.id,
            nomeCompleto: usuario.nomeCompleto || usuario.nome,
            email: usuario.email,
            whatsapp: usuario.whatsapp,
            instituicao: usuario.instituicao,
            perfil: usuario.perfil,
            foto: usuario.foto
        }));

        const moduloBibliotecario = document.getElementById("login-modulo") ? document.getElementById("login-modulo").value : "cliente.html";
        redirecionarPorPerfil(usuario.perfil, moduloBibliotecario);
    } catch (err) {
        const text = err && err.message ? err.message : 'Erro ao autenticar';
        alert(text);
    }
}

// Direciona cada perfil para a area permitida no teste de frontend.
function redirecionarPorPerfil(perfil, moduloBibliotecario) {
    if (perfil === "BIBLIOTECARIO") {
        window.location.href = `./${moduloBibliotecario || "cliente.html"}`;
        return;
    }
    window.location.href = "./livros.html";
}

function carregarUsuarios() {
    const dados = localStorage.getItem(USUARIOS_STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios));
}

// Simula codigos que seriam gerados pelo usuario master no backend.
function inicializarCodigosMaster() {
    if (!localStorage.getItem("biblioteca_codigos_master_teste")) {
        localStorage.setItem("biblioteca_codigos_master_teste", JSON.stringify(["BIBLIOTECA2026"]));
    }
}

function codigoMasterValido(codigo) {
    const codigos = JSON.parse(localStorage.getItem("biblioteca_codigos_master_teste") || "[]");
    return codigos.includes(codigo);
}

function obterFotoBase64(arquivo) {
    return new Promise(resolve => {
        if (!arquivo) {
            resolve("");
            return;
        }
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => resolve("");
        leitor.readAsDataURL(arquivo);
    });
}

function obterIniciais(nome) {
    if (!nome) return "U";
    return String(nome)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join("");
}