// API  
const API_BASE = 'https://countriesnow.space/api/v0.1/countries';
const ENDPOINTS = {
  countries: API_BASE,
  capitals: `${API_BASE}/capital`,
  currencies: `${API_BASE}/currency`,
  flags: `${API_BASE}/flag/images`,
  positions: `${API_BASE}/positions`,
  populations: `${API_BASE}/population`,
};

//  dados de um pais esta ausente na API
const MISSING_TEXT = 'Não informado';

//   referencias aos elementos da interface
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const statusElement = document.getElementById('status');
const countryList = document.getElementById('country-list');
const detailDialog = document.getElementById('detail-dialog');
const detailTitle = document.getElementById('detail-title');
const detailContent = document.getElementById('detail-content');

// lista completa dos paises pela API
let countries = [];

//  funcoes
// transcreve o texto para somente minusculas para comparacao de dados
function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// formatação de numeros
function formatNumber(value) {
  return Number(value).toLocaleString('pt-BR');
}

// atualiza a mensagem de status da interface de acordo com o tipo informado.
function setStatus(message, type) {
  statusElement.textContent = message;
  statusElement.dataset.type = type || '';
}

// realiza uma requisicao e devolve apenas os dados uteis
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha na comunicação com a API (HTTP ${response.status}).`);
  }
  const payload = await response.json();
  if (payload.error) {
    throw new Error(payload.msg || 'A API retornou um erro.'); //lanca erro em falhas de comunicacao 
  }
  return payload.data;
}

// indice dos registros da API (chave: ISO2)
function indexByIso2(records) {
  const map = new Map();
  for (const record of records) {
    if (record && record.iso2) {
      map.set(record.iso2.toUpperCase(), record);
    }
  }
  return map;
}

// indice da populacao (chave: ISO3)
function indexPopulationByIso3(records) {
  const map = new Map();
  for (const record of records) {
    const iso3 = (record && record.iso3 ? record.iso3 : '').toUpperCase();
    if (iso3) {
      map.set(iso3, record.populationCounts || []);
    }
  }
  return map;
}

// recebe o valor de populacao mais recente na API
function getLatestPopulation(counts) {
  if (!Array.isArray(counts) || counts.length === 0) {
    return null;
  }
  let latest = null;
  for (const entry of counts) {
    if (typeof entry.value !== 'number') {
      continue;
    }
    if (!latest || entry.year > latest.year) {
      latest = entry;
    }
  }
  return latest ? latest.value : null;
}

// junta os dados de diferentes endpoints em uma UNICA lista de paises
function mergeCountries(data) {
  const capitalMap = indexByIso2(data.capitals);
  const currencyMap = indexByIso2(data.currencies);
  const flagMap = indexByIso2(data.flags);
  const positionMap = indexByIso2(data.positions);
  const populationMap = indexPopulationByIso3(data.populations);

  return data.countries
    .filter((item) => item && item.country && item.iso2)
    .map((item) => {
      const iso2 = item.iso2.toUpperCase();
      const iso3 = (item.iso3 || '').toUpperCase();
      const position = positionMap.get(iso2);

      return {
        name: item.country,
        iso2: iso2,
        iso3: iso3,
        capital: capitalMap.get(iso2) ? capitalMap.get(iso2).capital : null,
        currency: currencyMap.get(iso2) ? currencyMap.get(iso2).currency : null,
        flag: flagMap.get(iso2) ? flagMap.get(iso2).flag : null,
        population: getLatestPopulation(populationMap.get(iso3)),
        latitude: position ? position.lat : null,
        longitude: position ? position.long : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

//   interface 

// cria o elemento de imagem de bandeira (ou um marcador caso nao exista)
function createFlagElement(country, className) {
  if (country.flag) {
    const image = document.createElement('img');
    image.className = className;
    image.src = country.flag;
    image.alt = `Bandeira de ${country.name}`;
    image.loading = 'lazy';
    return image;
  }

  const placeholder = document.createElement('span');
  placeholder.className = 'flag-placeholder';
  placeholder.textContent = 'Sem imagem';
  placeholder.setAttribute('aria-label', `Bandeira de ${country.name} não disponível`);
  return placeholder;
}

// cria o 'card' de um pais dentro da lista
function createCountryCard(country) {
  const item = document.createElement('li');
  item.className = 'country-card';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'country-button';
  button.setAttribute('aria-label', `Ver detalhes de ${country.name}`);
  button.addEventListener('click', () => showCountryDetails(country));

  const name = document.createElement('h3');
  name.className = 'country-name';
  name.textContent = country.name;

  const capital = document.createElement('p');
  capital.className = 'country-meta';
  capital.textContent = `Capital: ${country.capital || MISSING_TEXT}`;

  const currency = document.createElement('p');
  currency.className = 'country-meta';
  currency.textContent = `Moeda: ${country.currency || MISSING_TEXT}`;

  button.append(
    createFlagElement(country, 'country-flag'),
    name,
    capital,
    currency
  );
  item.appendChild(button);
  return item;
}

// renderiza a lista de paises 
function renderCountries(list, message) {
  countryList.textContent = '';

  if (list.length === 0) {
    setStatus(message || 'Nenhum país encontrado.', 'empty');
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const country of list) {
    fragment.appendChild(createCountryCard(country));
  }
  countryList.appendChild(fragment);

  if (message) {
    setStatus(message, 'success');
  }
}

// monta e mostra a janela da descricao de um pais
function showCountryDetails(country) {
  detailTitle.textContent = country.name;
  detailContent.textContent = '';

  if (country.flag) {
    const image = document.createElement('img');
    image.className = 'detail-flag';
    image.src = country.flag;
    image.alt = `Bandeira de ${country.name}`;
    detailContent.appendChild(image);
  }

  const rows = [
    ['Capital', country.capital],
    ['Moeda', country.currency],
    ['População', country.population != null ? formatNumber(country.population) : null],
    ['Latitude', country.latitude != null ? country.latitude : null],
    ['Longitude', country.longitude != null ? country.longitude : null],
  ];

  const list = document.createElement('dl');
  list.className = 'detail-list';
  for (const [label, value] of rows) {
    const term = document.createElement('dt');
    term.textContent = label;

    const description = document.createElement('dd');
    // dados ausentes nao irao exibir 'undefined' ou 'null'
    description.textContent =
      value === null || value === undefined || value === '' ? MISSING_TEXT : value;

    list.append(term, description);
  }
  detailContent.appendChild(list);

  detailDialog.showModal();
}

//   carregammeto de dados 

// busca os dados dos endpoints e mescla em uma so aba
async function loadCountries() {
  setStatus('Carregando países...', 'loading');
  countryList.textContent = '';

  try {
    const [countriesData, capitals, currencies, flags, positions, populations] =
      await Promise.all([
        fetchData(ENDPOINTS.countries),
        fetchData(ENDPOINTS.capitals),
        fetchData(ENDPOINTS.currencies),
        fetchData(ENDPOINTS.flags),
        fetchData(ENDPOINTS.positions),
        fetchData(ENDPOINTS.populations),
      ]);

    countries = mergeCountries({
      countries: countriesData,
      capitals,
      currencies,
      flags,
      positions,
      populations,
    });

    renderCountries(countries, `${countries.length} países carregados.`);
  } catch (error) {
    setStatus(`Não foi possível carregar os países. ${error.message}`, 'error');
  }
}

//   pesquisa

// filtra a lista pelo nome (ignora acentos e letras maiusculas )
function filterCountries(term) {
  const normalizedTerm = normalizeText(term).trim();
  if (!normalizedTerm) {
    return countries;
  }
  return countries.filter((country) =>
    normalizeText(country.name).includes(normalizedTerm)
  );
}

// envio de formulario de pesquisa
function handleSearch(event) {
  event.preventDefault();

  if (countries.length === 0) {
    setStatus('A lista de países ainda não foi carregada.', 'error');
    return;
  }

  const term = searchInput.value.trim();
  if (!term) {
    renderCountries(countries, `${countries.length} países carregados.`);
    return;
  }

  const result = filterCountries(term);
  renderCountries(result, `${result.length} país(es) encontrado(s) para "${term}".`);
}

//inicializacao  
searchForm.addEventListener('submit', handleSearch);

loadCountries();
