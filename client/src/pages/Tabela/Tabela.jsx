import { Table } from 'react-bootstrap';

export function Tabela({user}) {

    return (
        <>
            {user.name &&
                <Table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Link</th>
                            <th>Cargo</th>
                            <th>Empresa</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Jonas</td>
                            <td>http://aaaa</td>
                            <td>BI</td>
                            <td>Semear</td>
                        </tr>
                    </tbody>
                </Table>
            }
        </>
    )
}