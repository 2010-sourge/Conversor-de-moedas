# 💱 Conversor de Moedas

> Uma aplicação web para conversão de moedas em tempo real, utilizando a **ExchangeRate-API**.

---

## 📋 Sobre o Projeto

O **Conversor de Moedas** permite ao usuário converter valores entre diferentes moedas com taxas de câmbio atualizadas em tempo real. Possui também atalhos para os pares de conversão mais populares.

---

## 🚀 Funcionalidades

- Conversão de valores entre moedas
- Seleção de moeda de origem (**De**) e destino (**Para**)
- Botão de inversão rápida entre as moedas selecionadas
- Botão **"Converter"** para calcular o valor
- Atalhos para **pares populares**:
  - USD → BRL
  - EUR → BRL
  - BRL → USD
  - GBP → BRL
  - BTC → USD
  - EUR → USD
- Taxas de câmbio em tempo real via **ExchangeRate-API**

---

## 🗂️ Estrutura do Projeto

```
CONVERSOR DE MOEDAS/
├── index.html     # Estrutura da página
├── script.js      # Lógica de conversão e consumo da API
└── style.css      # Estilização da interface
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — Estrutura da página
- **CSS3** — Estilização e layout
- **JavaScript** — Lógica de conversão e requisições assíncronas
- **[ExchangeRate-API](https://www.exchangerate-api.com/)** — Fornecimento das taxas de câmbio em tempo real

---

## ▶️ Como Executar

1. Clone ou baixe o repositório
2. Abra o arquivo `index.html` diretamente no navegador

Ou use uma extensão como **Live Server** no VS Code para rodar em `http://127.0.0.1:5500`.

---

## 📐 Como Funciona

1. O usuário insere o **valor** a ser convertido
2. Seleciona a moeda de origem (**De**) e a moeda de destino (**Para**)
3. Clica em **"Converter"**
4. A aplicação consulta a ExchangeRate-API e exibe o valor convertido com a taxa atualizada

---

## 📸 Preview

Interface escura com campo de valor, seletores de moeda (BRL → USD por padrão), botão de inversão, botão **"Converter"** e atalhos de pares populares.

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar e modificar.
