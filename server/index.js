require("dotenv").config()

const { getDatabase, ref, onValue, get, set, child, update, remove } = require("firebase/database")
const { initializeApp } = require("firebase/app")

const express = require("express");
const app = express();

const cors = require("cors");

// Iniciar os server aceitando um limite maior de payload - necessário para receber o arquivo html
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use(cors());

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: 'https://semear-db-default-rtdb.firebaseio.com',
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

initializeApp(firebaseConfig);
const db = getDatabase();

// Endereço raiz -> Só envia se está ok
app.get('/', (req, res) => {
    res.status(200).send('Server do gerador de leads').end();
});


// Método de gravação dos arquivos html no firebase
function enviarSrcFirebase(tipo, body) {
    const idUsuario = body.id;
    // Endereço onde será enviado o html
    // [firebase]/[nome usuário]/[tipo de html]/[data]/[id registro]
    // ex:  https://semear-db-default-rtdb.firebaseio.com/2804:431:cfe2:5/normal/2022-09-25/4575ebfe-ec12-44e5-8279-38d5057cabfd
    //const today = Math.floor(Date.now() / (1000*60*60*24)); // dias desde 1970
    //const dbRef = ref(db,  idUsuario + "/" + today + "/" + tipo + "/" + uuidv4());
    const dbRef = ref(db,  idUsuario + "/" + tipo);

    const dado = {html: body.html, clipboard: body.clipboard};

    // Salvar a página no firebase
    set(dbRef, dado)
        .then(() => {
            console.log("Dado enviado!");
        })
        .catch((error) => {
            console.error(error);
        })
}

// Método de leitura dos arquivos html no firebase
function obterSrcFirebase(idUsuario) {
    const starCountRef = ref(db, idUsuario);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
    });
}

// Recebido pelo frontend para acessar os dados no firebase
app.get('/get', (req, res) => {
    const nome = req.query.u;
    console.log("GET RECEBIDO. ARQUITETO:");
    console.log(nome);

    const data = obterSrcFirebase(nome);

    res.status(200).send(data).end();
})

// Recebido um post de perfil do Sales Navigator -> Enviar ao firebase
app.post('/sales', (req, res) => {
    console.log("POST SALES RECEBIDO");
    const {body} = req;
    enviarSrcFirebase("sales", body);
    res.status(200).send("Perfil do Sales recebido!").end();
});

// Recebido um post de perfil do LinkedIn -> Enviar ao firebase
app.post('/normal', (req, res) => {
    console.log("POST NORMAL RECEBIDO");
    const {body} = req;
    enviarSrcFirebase("normal", body);
    res.status(200).send("Perfil do Normal recebido!").end();
});

// Recebido periódicamente pela extensão quando está no linkedin para manter funionando o nó
app.get('/wakeup', (req, res) => {
    res.status(200).send('Acordado!').end();

    // Enviar ação no firebase para acordar também!
    // O path /wakeup nem existe, é só para tentar fazer uma leitura mesmo
    const dbRef = child(ref(db), "wakeup/");

    get(dbRef);
});

// Inicialização do servidor
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta: ${PORT}`);
});