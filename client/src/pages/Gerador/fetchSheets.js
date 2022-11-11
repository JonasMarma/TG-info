export function fetchSheets(dados) {
    var d = "";
    for(var i in dados) {
      d = d + dados[i] + ";;"
    }
    //const codImplantacao = 'AKfycbwJdkujd17-AzvSHsW0YycZWpdMhP_ExYn-ahqn0e9-qN1lJ9O1e-Hyoi_Kb-XvD74q';
    //let url = 'https://script.google.com/macros/s/' + process.env.codImplantacaoSheets + '/exec?'
    let url = 'https://script.google.com/macros/s/' + 'AKfycbwJdkujd17-AzvSHsW0YycZWpdMhP_ExYn-ahqn0e9-qN1lJ9O1e-Hyoi_Kb-XvD74q' + '/exec?'
    
    url += 'data=' + d;
  
    console.log(url);

    fetch(url)
        .then((response) => {
            console.log("POST EXECUTADO :)")
        })
        .catch((error) => {
            console.error(error);
        });
}