import { useRef } from "react";
import { Container, Form, Button } from 'react-bootstrap';


export function Config({ user }) {

    const inputArquiteto = useRef(null);
    const inputTime = useRef(null);

    const salvar = () => {
        const configs = {
            arquiteto: inputArquiteto.current.value,
            time: inputTime.current.value
        }
        localStorage.setItem("config", JSON.stringify(configs));
    };

    return (
        <Container>
            {user.name &&
                <>
                    <h3>Configurações</h3>

                    <p>Você é:</p>
                    <Form.Select ref={inputArquiteto}>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>

                    <p>Time:</p>
                    <Form.Select ref={inputTime}>
                        <option value="PF">Hunting PF</option>
                        <option value="PJ">Hunting PJ</option>
                        <option value="OUTRO">Outro</option>
                    </Form.Select>

                    <Button onClick={salvar}>Salvar</Button>
                </>
            }
        </Container>
    )
}