const API_BASE = 'https://open.er-api.com/v6/latest';
 
/** Moedas exibidas primeiro na lista (mais usadas) */
const PRIORITY_CURRENCIES = [
  'BRL', 'USD', 'EUR', 'GBP', 'JPY',
  'ARS', 'CAD', 'CHF', 'AUD', 'CNY',
];
 
/** Nomes amigáveis para as moedas mais comuns */
const CURRENCY_NAMES = {
  BRL: 'Real Brasileiro',
  USD: 'Dólar Americano',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  JPY: 'Iene Japonês',
  ARS: 'Peso Argentino',
  CAD: 'Dólar Canadense',
  CHF: 'Franco Suíço',
  AUD: 'Dólar Australiano',
  CNY: 'Yuan Chinês',
  MXN: 'Peso Mexicano',
  CLP: 'Peso Chileno',
  COP: 'Peso Colombiano',
  PEN: 'Sol Peruano',
  UYU: 'Peso Uruguaio',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
};
 
// ─── Referências ao DOM ───────────────────────────────────────────────────────
 
const amountInput    = document.getElementById('amount');
const fromSelect     = document.getElementById('from-currency');
const toSelect       = document.getElementById('to-currency');
const fromBadge      = document.getElementById('from-badge');
const swapBtn        = document.getElementById('swap-btn');
const convertBtn     = document.getElementById('convert-btn');
const resultArea     = document.getElementById('result-area');
const resultFrom     = document.getElementById('result-from');
const resultEquals   = document.querySelector('.result-equals');
const resultTo       = document.getElementById('result-to');
const resultRate     = document.getElementById('result-rate');
const errorArea      = document.getElementById('error-area');
const errorMsg       = document.getElementById('error-msg');
const quickChips     = document.querySelectorAll('.quick-chip');
 
// ─── Estado da aplicação ──────────────────────────────────────────────────────
 
let availableCurrencies = []; // lista de códigos buscada da API
let isLoading = false;
 
// ─── Inicialização ────────────────────────────────────────────────────────────
 
async function init() {
  try {
    await loadCurrencies();
    setDefaults();
    bindEvents();
  } catch (err) {
    showError('Não foi possível carregar as moedas. Verifique sua conexão.');
  }
}
 
/** Busca a lista de moedas disponíveis na API */
async function loadCurrencies() {
  const response = await fetch(`${API_BASE}/USD`);
  if (!response.ok) throw new Error('Falha ao buscar moedas');
 
  const data = await response.json();
  if (data.result !== 'success') throw new Error(data['error-type']);
 
  // Ordena: moedas prioritárias primeiro, restante em ordem alfabética
  const allCodes = Object.keys(data.rates);
  const priority = PRIORITY_CURRENCIES.filter(c => allCodes.includes(c));
  const rest     = allCodes.filter(c => !PRIORITY_CURRENCIES.includes(c)).sort();
  availableCurrencies = [...priority, ...rest];
 
  populateSelects(availableCurrencies);
}
 
/** Preenche os dois <select> com as moedas */
function populateSelects(currencies) {
  [fromSelect, toSelect].forEach(select => {
    select.innerHTML = '';
    currencies.forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      const name = CURRENCY_NAMES[code] ? ` — ${CURRENCY_NAMES[code]}` : '';
      option.textContent = `${code}${name}`;
      select.appendChild(option);
    });
  });
}
 
/** Define valores padrão: BRL → USD */
function setDefaults() {
  fromSelect.value = 'BRL';
  toSelect.value   = 'USD';
  updateBadge();
}
 
// ─── Eventos ──────────────────────────────────────────────────────────────────
 
function bindEvents() {
  convertBtn.addEventListener('click', handleConvert);
  swapBtn.addEventListener('click', handleSwap);
  fromSelect.addEventListener('change', updateBadge);
 
  // Converter ao pressionar Enter no campo de valor
  amountInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleConvert();
  });
 
  // Chips de pares rápidos
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const from = chip.dataset.from;
      const to   = chip.dataset.to;
 
      // Se a moeda não estiver na lista (raro), avisa
      if (!availableCurrencies.includes(from) || !availableCurrencies.includes(to)) {
        showError(`Par ${from}/${to} não disponível no plano gratuito da API.`);
        return;
      }
 
      fromSelect.value = from;
      toSelect.value   = to;
      amountInput.value = '1';
      updateBadge();
      handleConvert();
    });
  });
}
 
/** Atualiza o badge de moeda ao lado do input */
function updateBadge() {
  fromBadge.textContent = fromSelect.value;
}
 
/** Inverte as moedas selecionadas */
function handleSwap() {
  const temp       = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value   = temp;
  updateBadge();
 
  // Animação de rotação no ícone
  swapBtn.classList.add('spinning');
  setTimeout(() => swapBtn.classList.remove('spinning'), 300);
 
  // Reconverte se já havia resultado
  if (resultArea.classList.contains('visible')) {
    handleConvert();
  }
}
 
// ─── Conversão ────────────────────────────────────────────────────────────────
 
async function handleConvert() {
  if (isLoading) return;
 
  const amount = parseFloat(amountInput.value);
  const from   = fromSelect.value;
  const to     = toSelect.value;
 
  // Validação
  if (isNaN(amount) || amount <= 0) {
    showError('Digite um valor válido maior que zero.');
    return;
  }
  if (from === to) {
    showResult(amount, amount, from, to, 1);
    return;
  }
 
  hideError();
  hideResult();
  setLoading(true);
 
  try {
    const rate   = await fetchRate(from, to);
    const result = amount * rate;
    showResult(amount, result, from, to, rate);
  } catch (err) {
    showError(err.message || 'Erro ao buscar taxa de câmbio. Tente novamente.');
  } finally {
    setLoading(false);
  }
}
 
/**
 * Busca a taxa de câmbio entre duas moedas.
 * @param {string} from - Moeda de origem
 * @param {string} to   - Moeda de destino
 * @returns {Promise<number>} - Taxa de conversão
 */
async function fetchRate(from, to) {
  const url      = `${API_BASE}/${from}`;
  const response = await fetch(url);
 
  if (!response.ok) {
    throw new Error(`Erro na API (HTTP ${response.status}). Tente mais tarde.`);
  }
 
  const data = await response.json();
 
  if (data.result !== 'success') {
    // Erros conhecidos da API
    const apiErrors = {
      'unsupported-code':     `Moeda "${from}" não suportada.`,
      'malformed-request':    'Requisição inválida.',
      'invalid-key':          'Chave de API inválida.',
      'inactive-account':     'Conta da API inativa.',
      'quota-reached':        'Limite de requisições atingido. Tente mais tarde.',
    };
    throw new Error(apiErrors[data['error-type']] || 'Erro desconhecido na API.');
  }
 
  const rate = data.rates[to];
  if (rate === undefined) {
    throw new Error(`Moeda "${to}" não encontrada nos dados retornados.`);
  }
 
  return rate;
}
 
// ─── UI: resultados ───────────────────────────────────────────────────────────
 
/**
 * Exibe o resultado da conversão.
 * @param {number} amount  - Valor de origem
 * @param {number} result  - Valor convertido
 * @param {string} from    - Código da moeda de origem
 * @param {string} to      - Código da moeda de destino
 * @param {number} rate    - Taxa de câmbio
 */
function showResult(amount, result, from, to, rate) {
  resultFrom.textContent = `${formatNumber(amount)} ${from}`;
  resultTo.textContent   = `${formatNumber(result)} ${to}`;
 
  const rateFormatted    = formatNumber(rate, 6);
  const inverseFormatted = formatNumber(1 / rate, 6);
  resultRate.innerHTML   =
    `1 ${from} = ${rateFormatted} ${to}<br>1 ${to} = ${inverseFormatted} ${from}`;
 
  resultArea.classList.add('visible');
}
 
function hideResult() {
  resultArea.classList.remove('visible');
}
 
// ─── UI: erros ────────────────────────────────────────────────────────────────
 
function showError(message) {
  errorMsg.textContent = message;
  errorArea.hidden = false;
  hideResult();
}
 
function hideError() {
  errorArea.hidden = true;
}
 
// ─── UI: loading ──────────────────────────────────────────────────────────────
 
function setLoading(state) {
  isLoading = state;
  convertBtn.disabled = state;
  convertBtn.classList.toggle('loading', state);
}
 

 
/**
 * Formata um número com separadores de milhar e casas decimais adequadas.
 * @param {number} value
 * @param {number} maxDecimals
 * @returns {string}
 */
function formatNumber(value, maxDecimals = 4) {
  if (value === 0) return '0';
 
  // Para valores muito pequenos, usa mais casas decimais
  const decimals = value < 0.01 ? Math.min(maxDecimals, 8) : 2;
 
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}
 

 
init();
 