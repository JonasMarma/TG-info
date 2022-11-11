import './App.css';
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes , Route, Link} from "react-router-dom";
import { useState, useEffect } from "react";
import { Config } from './pages/Config/Config';
import { Tabela } from './pages/Tabela/Tabela'
import { Gerador } from './pages/Gerador/Gerador'
import jwt_decode from 'jwt-decode';

function App() {

  const [user, setUser] = useState({});

  function handleCallbackResponse(response) {
    // Decodificar o usuário autenticado pelo google
    const userObject = jwt_decode(response.credential);
    // Armazenar o usuário
    setUser(userObject);
    // Esconder o botão de login
    document.getElementById("login").hidden = true;
  }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: '1003779684186-rd06s9urc9g362ib7a69stg5k31v0t97.apps.googleusercontent.com',
      callback: handleCallbackResponse
    })

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large"}
    );
  }, []);

  return (
    <div className="App">

      <div id="login">
        <h1>Faça login com sua conta da organização para continuar:</h1>
        <div id="signInDiv"></div>
      </div>

      { user.name &&
      <>
        <div>
          <p className='d-inline m-3'>Arquiteto: <strong>{user.name}</strong></p>
          <img className='d-inline' width="22" height="22" src={user.picture}></img>
          <p className='d-inline m-3'>🧡</p>
        </div>        
        </>
      }

      <Routes>
        <Route path="/" element={<Gerador user={user}/>}/>
        <Route path="/tabela" element={<Tabela user={user}/>}/>
        <Route path="/config" element={<Config user={user}/>}/>
      </Routes>

    </div>
  );
}

export default App;
