const USUARIOS_STORAGE_KEY = "biblioteca_usuarios_teste";
const SESSAO_STORAGE_KEY = "biblioteca_usuario_logado";
const CODIGOS_MASTER_STORAGE_KEY = "biblioteca_codigos_master_teste";
const CODIGO_MASTER_PADRAO = "BIBLIOTECA2026";

const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const loginPerfil = document.getElementById("login-perfil");
const grupoModuloBibliotecario = document.getElementById("grupo-modulo-bibliotecario");
const cadastroPerfil = document.getElementById("cadastro-perfil");
const grupoCodigoBibliotecario = document.getElementById("grupo-codigo-bibliotecario");
const cadastroFoto = document.getElementById("cadastro-foto");

inicializarCodigosMaster();

// Alterna entre os formularios de login e cadastro.
function mostrarAba(aba) {
    const loginAtivo = aba === "login";

    document.getElementById("tab-login").classList.toggle("active", loginAtivo);
    document.getElementById("tab-cadastro").classList.toggle("active", !loginAtivo);
    formLogin.classList.toggle("hidden", !loginAtivo);
    formCadastro.classList.toggle("hidden", loginAtivo);
}

// Mostra o campo de codigo somente quando o usuario tenta cadastrar bibliotecario.
if (cadastroPerfil) {
    cadastroPerfil.addEventListener("change", function () {
        const bibliotecarioSelecionado = cadastroPerfil.value === "BIBLIOTECARIO";
        grupoCodigoBibliotecario.classList.toggle("hidden", !bibliotecarioSelecionado);
        document.getElementById("codigo-bibliotecario").required = bibliotecarioSelecionado;
    });
}

// Mostra a escolha de modulo no login somente para bibliotecario.
if (loginPerfil) {
    loginPerfil.addEventListener("change", function () {
        const bibliotecarioSelecionado = loginPerfil.value === "BIBLIOTECARIO";
        grupoModuloBibliotecario.classList.toggle("hidden", !bibliotecarioSelecionado);
        document.getElementById("login-modulo").required = bibliotecarioSelecionado;
    });
}

if (formCadastro) {
    formCadastro.addEventListener("submit", function (event) {
        event.preventDefault();
        cadastrarUsuario();
    });
}

if (formLogin) {
    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();
        fazerLogin();
    });
}

// Cadastra usuario em localStorage apenas para teste de frontend.
async function cadastrarUsuario() {
    const nome = document.getElementById("cadastro-nome").value.trim();
    const email = document.getElementById("cadastro-email").value.trim().toLowerCase();
    const whatsapp = document.getElementById("cadastro-whatsapp").value.trim();
    const instituicao = document.getElementById("cadastro-instituicao").value.trim();
    const senha = document.getElementById("cadastro-senha").value;
    const perfil = document.getElementById("cadastro-perfil").value;
    const codigoBibliotecario = document.getElementById("codigo-bibliotecario").value;
    const foto = await obterFotoBase64(cadastroFoto.files[0]);

    if (perfil === "BIBLIOTECARIO" && !codigoMasterValido(codigoBibliotecario)) {
        alert("Codigo de bibliotecario invalido. Solicite um codigo ao usuario master.");
        return;
    }

    const payload = { nome, email, whatsapp, instituicao, senha, perfil, foto };

    try {
        const res = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || 'Erro ao criar usuario');
        }

        formCadastro.reset();
        grupoCodigoBibliotecario.classList.add("hidden");
        alert("Cadastro criado com sucesso. Agora faca login.");
        mostrarAba("login");
    } catch (e) {
        const msg = e && e.message ? e.message : 'Erro ao criar usuario';
        alert(msg);
        return;
    }
}

// Faz login usando o perfil salvo no cadastro, sem deixar o usuario escolher perfil ao entrar.
function fazerLogin() {
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const senha = document.getElementById("login-senha").value;
    const perfilSelecionado = document.getElementById("login-perfil").value;

    fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    }).then(async res => {
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Erro ao autenticar');
        }
        return res.json();
    }).then(usuario => {
        if (usuario.perfil !== perfilSelecionado) {
            alert("Este usuario nao possui permissao para entrar com o perfil selecionado.");
            return;
        }

        localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify({
            nome: usuario.nome,
            email: usuario.email,
            whatsapp: usuario.whatsapp,
            instituicao: usuario.instituicao,
            perfil: usuario.perfil,
            foto: usuario.foto
        }));

        redirecionarPorPerfil(usuario.perfil, document.getElementById("login-modulo").value);
    }).catch(async err => {
        const text = err && err.message ? err.message : 'Erro ao autenticar';
        alert(text);
        return;
    });
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
    if (!localStorage.getItem(CODIGOS_MASTER_STORAGE_KEY)) {
        localStorage.setItem(CODIGOS_MASTER_STORAGE_KEY, JSON.stringify([CODIGO_MASTER_PADRAO]));
    }
}

function codigoMasterValido(codigo) {
    const codigos = JSON.parse(localStorage.getItem(CODIGOS_MASTER_STORAGE_KEY) || "[]");
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
