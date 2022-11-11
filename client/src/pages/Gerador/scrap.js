const cheerio = require('cheerio')

export function scrapNormal(source) {
  console.log("Iniciando scrap normal");

  const $ = cheerio.load(source);

  let lead = {};

  // Obter o nome da pessoa
  try {
    lead.nome = $('[data-anonymize="person-name"]').html().trim();
  } catch (error) {
    lead.nome = "";
  }

  console.log(lead);

  return lead;

}

export function scrapSales(source) {
  console.log("Iniciando scrapping sales!");

  const $ = cheerio.load(source);

  let lead = {};

  // Obter o nome da pessoa
  try {
    lead.nome = $('[data-anonymize="person-name"]').html().trim();
  } catch (error) {
    lead.nome = "";
  }

  try {
    lead.cargo = $('[data-anonymize="headline"]').html().trim();
  } catch (error) {
    lead.cargo = "";
  }

  try {
    lead.email = $('[data-anonymize="email"]').html().trim();
  } catch (error) {
    lead.email = "";
  }

  try {
    const dataAtividade = $('time[class*="lowEmphasis"]').attr().datetime;
    const dataPura = dataAtividade.split("T")[0];
    const dia = dataPura.split("-")[2];
    const mes = dataPura.split("-")[1];
    const ano = dataPura.split("-")[0];
    lead.atividade = dia + "/" + mes + "/" + ano;
  } catch (error) {
    lead.atividade = "";
  }

  console.log("LEAD GERADO:");
  console.log(lead);

  return lead;

}