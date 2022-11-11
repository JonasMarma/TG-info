import Axios from 'axios'
import { useState, useEffect } from "react";
import { Container, Form, ButtonGroup, Button, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { fetchSheets } from './fetchSheets';
import { scrapNormal, scrapSales } from "./scrap";

const { getDatabase, ref, onValue } = require("firebase/database")
const { initializeApp } = require("firebase/app")


export function Gerador({ user }) {

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

    let dbRef = null;

    // Botões para alternar entre modos automáticos e manuais
    const [preencheAuto, setPreencheAuto] = useState(true);
    const [envioAuto, setEnvioAuto] = useState(true);

    // Cópia da área de transferência do usuário
    const [clip, setClip] = useState('');

    // Indicador na parte inferior do último lead enviado
    const [ultimoLead, setUltimoLead] = useState("Nenhum lead enviado ainda!");

    // Dados finais do lead
    const [link, setLink] = useState('');
    const [nome, setNome] = useState('');
    const [ultimaAtv, setUltimaAtv] = useState('');
    const [cargo, setCargo] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [email, setEmail] = useState('');
    const [observ, setObserv] = useState('');


    // Useeffect para fazer isso rodar só uma vez
    useEffect(() => {
        // Usuário a ser consultado (ip)
        dbRef = ref(db, "Jonas Marma");

        // Função para obter os dados do firebase em real time.
        onValue(dbRef, (snapshot) => {

            const data = snapshot.val();

            console.log(":-:-: DADO OBTIDO DO FIREBASE :-:-:");
            console.log(data);

            let leadNormal, leadSales, leadNovo = null;
            let clipboard = "";

            if (data.normal) {
                leadNormal = scrapNormal(data.normal.html);
                leadNovo = leadNormal;
                clipboard = data.normal.clipboard;
            }
            if (data.sales) {
                leadSales = scrapSales(data.sales.html);
                leadNovo = leadSales;
                clipboard = data.sales.clipboard;
            }

            // Se os dois leads estiverem preenchidos e está olhando o mesmo lead:
            if (data.normal && data.sales) {
                if (leadNormal.nome === leadSales.nome) {
                    // Comparar os timestamps dos leads obtidos. Dar preferência para o mais recente
                    if (data.normal.timestamp < data.sales.timestamp) {
                        leadNovo = leadNormal;
                        clipboard = data.normal.clipboard;
                    } else {
                        leadNovo = leadSales;
                        clipboard = data.sales.clipboard;
                    }
                    // Comparar as últimas atividades do lead. Dar preferência para a do linkedin normal
                    if (leadNormal.ultimaAtv < leadSales.ultimaAtv) {
                        leadNovo.ultimaAtv = leadNormal.ultimaAtv;
                    }
                }
            }

            // Atualizar as variáveis do lead
            setClip(clipboard);
            setNome(leadNovo.nome);
            setUltimaAtv(leadNovo.atividade);
            setCargo(leadNovo.cargo);
            setEmpresa(leadNovo.empresa);
            setEmail(leadNovo.email);
            setObserv(leadNovo.observ);
        });

        // Setar tudo em nulo ao carregar para não aparecer da última sessão
        setClip('');
        setLink('');
        setNome('');
        setUltimaAtv('');
        setCargo('');
        setEmpresa('');
        setEmail('');
        setObserv('');

    }, []);

    // Método acionado quando a string no clipboard muda. Se for um link válido, atualizar
    useEffect(() => {
        if (verificarLink(clip)) {
            setLink(clip);
        }
    }, [clip]);

    useEffect(() => {
        if (verificarLink(link)) {
            // Se for um link váliodo e estiver com envio automático  ativado, enviar!
            if (envioAuto) {
                enviarDadosSheets();
            }
        }
    }, [link])

    const tooglePreencheAuto = () => {
        setPreencheAuto(!preencheAuto)
    };

    const toogleEnvioAuto = () => {
        setEnvioAuto(!envioAuto)
    };

    // Verificar se uma string é um link válido do LinkedIn. S
    // Se sim, retornar formatado. Se não, retornar null
    const verificarLink = (str) => {

        if (str.includes("https://www.linkedin.com/in/")) {
            // Remover o que estiver depois do nome e retornar. Ex:
            // https://www.linkedin.com/in/jonas-marma/details/resources/
            // https://www.linkedin.com/in/jonas-marma
            const strSplit = str.split("/");
            return "https://www.linkedin.com/in/" + strSplit[5];
        }

        return null;
    }

    // Enviar dados para uma tabela no Google Sheets
    const enviarDadosSheets = () => {
        if (!verificarLink(link)) {
            alert("Link inválido!");
            return;
        }
        // Atualizar o nome do último lead para aparecer na barra inferior
        setUltimoLead(nome);
        // Organizar os dados a serem enviados em um json
        fetchSheets({
            n: nome,
            l: link,
            u: ultimaAtv,
            c: cargo,
            e: empresa,
            em: email,
            o: observ
        });
    }

    return (
        <Container fluid>
            {user.name &&
                <Form>
                    {/* Botões para ativar/desativar o envio e preenchumento automático. Contém overlays para ajudar o usuário */}
                    <ButtonGroup>
                        <OverlayTrigger placement="bottom" overlay={<Tooltip>Sobreescrever as caixas de texto com os dados de lead mais recentes</Tooltip>}>
                            <Button className variant="primary" onClick={tooglePreencheAuto}>
                                {(preencheAuto) ? "Preenchimento Automático" : "Preenchimento Manual"}
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="bottom" overlay={<Tooltip>Enviar os dados do lead para a tabela quando for detectado que o link do lead mudou</Tooltip>}>
                            <Button variant="secondary" onClick={toogleEnvioAuto}>
                                {(envioAuto) ? "Envio Automático" : "Envio Manual"}
                            </Button>
                        </OverlayTrigger>
                    </ButtonGroup>

                    {/* Link do perfil do lead */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Link:</Form.Text>
                        <Form.Control disabled={preencheAuto}
                            type="text"
                            placeholder="Copie o link do perfil para preencher"
                            value={link}
                            onChange={e => setLink(e.target.value)} />
                    </Form.Group>

                    {/* Nome do lead */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Nome:</Form.Text>
                        <Form.Control disabled={preencheAuto}
                            type="text"
                            placeholder="Nome do lead"
                            value={nome}
                            onChange={e => setNome(e.target.value)} />
                    </Form.Group>

                    {/* Data de última atividade, se encontrada */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Última atividade:</Form.Text>
                        <Form.Control disabled={preencheAuto}
                            type="text"
                            placeholder="última atividade"
                            value={ultimaAtv}
                            onChange={e => setUltimaAtv(e.target.value)} />
                    </Form.Group>

                    {/* Empresa em que o lead trabalha */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Empresa:</Form.Text>
                        <Form.Control disabled={preencheAuto}
                            type="text"
                            placeholder="Empresa do lead"
                            value={empresa}
                            onChange={e => setEmpresa(e.target.value)} />
                    </Form.Group>

                    {/* Cargo do lead */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Cargo:</Form.Text>
                        <Form.Control disabled={preencheAuto}
                            type="text"
                            placeholder="Cargo do lead"
                            value={cargo}
                            onChange={e => setCargo(e.target.value)} />
                    </Form.Group>

                    {/* Tipo de cargo do lead */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Tipo de cargo:</Form.Text>
                        <Form.Select>
                            <option>1. Analista</option>
                            <option>1. Cordenador</option>
                            <option>1. Supervisor</option>
                            <option>1. Nível 1</option>
                            <option>1.a Com +2 anos de experiência</option>
                            <option>2. Especialista</option>
                            <option>2. Executivo</option>
                            <option>2. Líder</option>
                            <option>2. Nível 2</option>
                            <option>2.b Com +5 anos de experiência</option>
                            <option>3. Diretoria</option>
                            <option>3. Head</option>
                            <option>3. Product Owner</option>
                            <option>3. Nível 3</option>
                            <option>3.c Com +10 anos de experiência</option>
                            <option>4. Angel Investor</option>
                            <option>4. Board Member</option>
                            <option>4. C-level</option>
                            <option>4. Founder</option>
                            <option>4. Partner</option>
                            <option>4. Nível 4</option>
                            <option>4.d Com +15 anos de experiência</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Tipo de cargo do lead */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Vínculo com a organização:</Form.Text>
                        <Form.Select>
                            <option>Fora da rede</option>
                            <option>Próximo à rede</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Email do lead */}
                    <Form.Group>
                        <Form.Text className="d-flex justify-content-start">Email:</Form.Text>
                        <Form.Control disabled={preencheAuto}
                            type="text"
                            placeholder="Email do lead"
                            value={email}
                            onChange={e => setEmail(e.target.value)} />
                    </Form.Group>

                    {/* Observações do lead */}
                    <Form.Group className="mb-2">
                        <Form.Text className="d-flex justify-content-start">Observações:</Form.Text>
                        <Form.Control   as="textarea"
                                        rows={3}
                                        placeholder="Insira informações sobre o lead"
                                        value={observ}
                                        onChange={e => setObserv(e.target.value)} />
                    </Form.Group>


                    {/* Botão de envio menual */}
                    {envioAuto ?
                        <>
                        </>
                        :
                        <Form.Group>
                            <Button disabled={envioAuto} variant="primary" onClick={enviarDadosSheets}>Enviar</Button>
                        </Form.Group>
                    }
                    {/* Indicador do último lead enviado */}
                    <Form.Group>
                        <h5>Último lead:</h5>
                        <Badge className='bg-info'>{ultimoLead}</Badge>
                    </Form.Group>

                </Form>
            }
        </Container>
    )
}
