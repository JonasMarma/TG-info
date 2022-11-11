// Inserir o nome do usuário da extensão entre as aspas a baixo:


const nomeUsuario = "Jonas Marma";


// Não mexer em nada daqui pra frente!!!
////////////////////////////////////////////////////////////////////

const periodo = 1000;

// Contador para mandar o wakeup
let count = 0;

const DEBUG = true;

// localhost
const ENREDECO_SERVIDOR = "http://localhost:8080/";

// Produção - google cloud


// Variáveis onde são armazenados o source agora e na última iteração
let sourceAntigo = "";
let sourceAtual = "";

// Variáveis onde são armazenados o clipboard agora e na última iteração
let clipboardAtual = "";
let clipboardAntigo = "";

// Variável onde é armazenado o link que está sendo visitado no tick atual
let linkAtual = "";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logDebug(log) {
    if (DEBUG) {
        console.log(log);
    }
}

// TODO: Não é usado
const getJSON = async url => {
    const response = await fetch(url);
    if (!response.ok) // check if response worked (no 404 errors etc...)
        throw new Error(response.statusText);

    const data = response.json(); // get JSON from the response
    return data; // returns a promise, which resolves to this data value
}

/*
Envia os dados para o servidor
*/
function enviarFetch(dados, tipo) {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if (request.readyState === 4 && request.status === 200) {
            logDebug(request, request.responseText);
        } else if (request.readyState === 4) {
            console.error("LEADS_SEMEAR: ERRO AO ACESSAR API" + request.response);
        }
    });

    // Rota na API
    let url = ENREDECO_SERVIDOR + tipo;

    logDebug("ENVIANDO PARA A URL:");
    logDebug(url);

    if (tipo === "wakeup") {
        fetch(url,
            {
                method: "GET",
            }
        )
        .catch(error => {
            // É normal não conseguir. Não fazer nada
            logDebug(error);
        });
    }
    else {
        fetch(url,
            {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: nomeUsuario, html: dados, clipboard: clipboardAtual, timestamp: Math.floor(Date.now()) })
            }
        )
        .catch(error => {
            // É normal não conseguir. Não fazer nada
            logDebug(error);
        });
        
    }

}

function checkLinkedIn(link) {
    // Verificar se está no linkedin
    if (link.includes("linkedin")) {
        count += 1;
        logDebug(count);
        if (count%30 == 0) {
            count = 0;
            return true;
        }
    }
    return false;
}

function checkPagPerfilNormal(link) {
    // Verificar se o link contém "linkedin.com/in/" (começam assim as páginas de perfil)
    if (link.includes("linkedin.com/in/")) {
        // Verificar se não é uma subpágina:
        // https://www.linkedin.com/in/lucas-mendes-0810631b6/                   -> OK!
        // https://www.linkedin.com/in/lucas-mendes-0810631b6/recent-activity/   -> Subpágina, desconsiderar!

        // O algoritmo divide em um vetor ["https:", "www.linkedin.com", "in", "nome", "possível", "subpagina"]
        // e verifica se tem tamanho 4 (quando é 4, é página de perfil)
        let partes = link.split("/");
        partes = partes.filter(item => (item != ''));

        if (partes.length == 4) {
            return true;
        }
    }

    return false;
}


function checkPagPerfilSales(link) {
    // Verificar se o link se trata de uma página de perfil do sales
    if (link.includes("linkedin.com/sales/people/")) {
        return true;
    }

    if (link.includes("linkedin.com/sales/lead/")) {
        return true;
    }

    return false;
}

async function run() {

    while (true) {
        await sleep(periodo);

        // Obter o link da página atual para analisar
        linkAtual = window.location.toString();

        // Se for página do LinkedIn, mandar um update para manter o servidor "acordado"
        if (checkLinkedIn(linkAtual)) {
            enviarFetch(null, "wakeup");
        }

        // Copiar o texto que está no clipboard do usuário
        navigator.clipboard.readText()
            .then((clipText) => {
                clipboardAtual = clipText;
            })
            .catch((error)=>{
                // Não fazer nada quando não consegue capturar. É normal
                logDebug(error);
            });


        // OBTER O HTML DA PÁGINA
        sourceAtual = document.body.innerHTML;

        // Se não mudou nada no source da página sendo visitada nem no que o usuário copiou, não fazer nada
        if ((sourceAntigo == sourceAtual) && (clipboardAntigo == clipboardAtual)) {
            continue;
        }

        // Se mudou, atualizar o antigo para a próxima comparação
        sourceAntigo = sourceAtual;
        clipboardAntigo = clipboardAtual;

        try {
            // Checar se é um pefil do linkedIn. Se sim, enviar.
            if (checkPagPerfilNormal(linkAtual)) {
                enviarFetch(sourceAtual, "normal");
            }
            // Checar se é um pefil do linkedIn no Sales Navigator. Se sim, enviar.
            if (checkPagPerfilSales(linkAtual)) {
                enviarFetch(sourceAtual, "sales");
            }

        } catch (error) {
            console.error("LEADS_SEMEAR: " + error);
        }

    }
}

run();
