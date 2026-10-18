// ============================================================================
// usuarios.js - Cadastro de e-mails do plipag
// ----------------------------------------------------------------------------
// COMO CADASTRAR: adicione uma linha na lista USUARIOS, neste formato:
//
//     'email@exemplo.com': ['Nome da Pessoa', 'ID_DA_PLANILHA', 'DD/MM/AAAA'],
//
// - Nome:     aparece no rodapé do app, em "Licenciado para:".
// - ID da planilha: é o trecho entre /d/ e /edit no endereço dela:
//     https://docs.google.com/spreadsheets/d/  1AbC...XyZ  /edit
//                                              ^^^^^^^^^^^
//   (Se preferir, pode colar o link inteiro da planilha que o ID é extraído sozinho.)
// - Validade: último dia em que a licença funciona, no formato DD/MM/AAAA
//     (ex.: '31/12/2026'). Depois dessa data o app não entra e mostra a mensagem
//     de licença vencida. Deixe '' (vazio) para uma licença sem data de vencimento.
//     Uma data escrita de forma inválida também é tratada como vencida.
//
// Este arquivo deve ficar na MESMA pasta do index.html.
// ============================================================================

// URL do Apps Script, informada uma única vez. Todos os e-mails abaixo usam este
// mesmo Apps Script; o que muda de um e-mail para outro é a planilha.
const PLIPAG_URL_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbzpXpxs7a_z_Y_4X9jGuKOajSpCHq17bxDZQo5Ev1fZifE_fBFtG72do33BILbAE6V2/exec';

// Lista de usuários: 'e-mail': ['Nome', 'ID da planilha', 'Validade'], (uma linha por pessoa, com vírgula no final)
const USUARIOS = {
    'seu-email@exemplo.com':       ['Sebastião Torquato',   'ID_DA_PLANILHA_1', '31/12/2026'],
    'outra-pessoa@exemplo.com':    ['Nome da Outra Pessoa', 'ID_DA_PLANILHA_2', '30/06/2027'],
    'mais-uma-pessoa@exemplo.com': ['Mais Uma Pessoa',      'ID_DA_PLANILHA_3', ''],
};

// ============================================================================
// A partir daqui não precisa mexer.
// ============================================================================

// Aceita o ID puro ou o link completo da planilha e devolve só o ID.
function plipagExtrairId(valor) {
    const texto = String(valor || '').trim();
    const m = texto.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : texto;
}

// Converte 'DD/MM/AAAA' (ou 'AAAA-MM-DD') em Date. Retorna null se a data for inválida.
function plipagParseData(texto) {
    const t = String(texto || '').trim();
    let dia, mes, ano;
    let r = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (r) {
        dia = +r[1]; mes = +r[2]; ano = +r[3];
    } else {
        r = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (!r) return null;
        ano = +r[1]; mes = +r[2]; dia = +r[3];
    }
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
    return data;
}

// true se a licença está vencida. A validade vale até o fim do dia informado.
// Sem validade (vazio) = não vence. Data inválida = tratada como vencida.
function plipagLicencaVencida(validade) {
    const t = String(validade || '').trim();
    if (!t) return false;
    const data = plipagParseData(t);
    if (!data) return true;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje > data;
}

// Procura o usuário pelo e-mail (ignora maiúsculas/minúsculas e espaços).
// Retorna { email, nome, url, planilha, validade, vencida } ou null se o e-mail não estiver cadastrado.
function plipagBuscarUsuario(email) {
    const chave = String(email || '').trim().toLowerCase();
    if (!chave) return null;

    for (const cadastrado in USUARIOS) {
        if (cadastrado.trim().toLowerCase() === chave) {
            const dados = USUARIOS[cadastrado] || [];
            const validade = String(dados[2] || '').trim();
            return {
                email: chave,
                nome: String(dados[0] || '').trim() || chave,
                url: PLIPAG_URL_APPS_SCRIPT,
                planilha: plipagExtrairId(dados[1]),
                validade: validade,
                vencida: plipagLicencaVencida(validade)
            };
        }
    }
    return null;
}
