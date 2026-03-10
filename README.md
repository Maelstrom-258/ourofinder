Ourofinder

![Ourofinder Logo](https://img.shields.io/badge/Ourofinder-Solver_%26_Simulator-8b5cf6?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)

Um ecossistema completo e inteligente criado para auxiliar jogadores a resolverem de forma impecável os minigames **OuroQUEST** e **OuroCHEST** do popular bot do Discord **Mudae**.

O **Ourofinder** oferece duas frentes de atuação: um aplicativo web rico em recursos (Solucionador e Simulador) e um Bot para o Discord que atua como seu assistente matemático particular nas partidas!

---

## 🎯 Sobre o Projeto

O minigame OuroQUEST e OuroCHEST exigem lógica e dedução baseadas no clássico *Campo Minado* e *Mastermind*. Para maximizar suas chances de vitória (e farmar recompensas), o **Ourofinder** utiliza um algoritmo de força bruta e cálculo de probabilidades ("Solver") que processa em tempo real:
1. Todos os estados de tabuleiro possíveis a partir das dicas fornecidas.
2. A probabilidade exata de cada espaço oculto conter o prêmio (Esferas Roxas no Quest, Esferas Vermelhas no Chest).
3. A melhor jogada matematicamente garantida para eliminar a incerteza.

---

## ✨ Principais Funcionalidades

### 🌐 1. Aplicação Web (Solucionador Mágico)
Uma interface polida e responsiva (construída com React, Vite e Tailwind CSS) que permite:
- **Modo Quest & Chest**: Alterne facilmente entre os dois modos de resolução de minigames.
- **Inserção Intuitiva**: Você "pinta" o tabuleiro com as dicas informadas pelo Mudae.
- **Cálculo em Tempo Real**: O assistente imediatamente lista as porcentagens de acerto para cada espaço em branco.
- **Marcadores Visuais**: O app destacará quadrados que possuem **100% de chance** e colocará uma borda pulsante no **melhor palpite possível** (quando a sorte for o único caminho).
- **Suporte Bilingue**: Disponível tanto em Português quanto Inglês.

### 🎮 2. Modo Simulador de Treinamento
Na própria Aplicação Web, ative o **Modo Simulador**. O Ourofinder irá gerar instâncias aleatórias do OuroQUEST ou OuroCHEST para você praticar e testar suas habilidades sem gastar seus preciosos rolamentos no Discord. Caso você trave em um nível de dedução, ative e desative a visão das probabilidades para aprender a agir.

### 🤖 3. Bot do Discord Integrado
O Ourofinder também é um bot! Ao hospedá-lo no seu servidor:
- Você (ou o Mudae) envia uma atualização do jogo OuroQUEST/OuroCHEST.
- O Bot **lê a mensagem original**, faz o *parsing* do tabuleiro através dos emojis, processa o estado atual no seu motor e **responde na thread** com quais são as coordenadas com a maior percentagem de acerto.
- Ele também gera uma visualização simplificada do tabuleiro para não sobrar espaço a dúvidas.

---

## 🚀 Tecnologias Integradas

- **Frontend**: `React 19`, `Vite`, `Tailwind CSS`, `Lucide React` (Iconografia).
- **Backend / Bot**: `Node.js`, `Discord.js 14`.
- **Motor Core**: Algoritmos nativos de Javascript sem dependências externas para a varredura máxima do Board (`ouroquest.js` e `ourochest.js`).

---

## 🛠️ Como Instalar e Rodar Localmente

Certifique-se de possuir o **Node.js** instalado na sua máquina.

1. **Clone/Acesse a pasta do projeto.**
2. **Instale as dependências** da Aplicação Web e do Bot de uma vez:
   ```bash
   npm install
   ```
3. **Configure as Variáveis de Ambiente**:
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione o token do seu bot do Discord:
     ```env
     DISCORD_TOKEN=seu_token_aqui_do_developer_portal
     ```

### Executar a Ferramenta Web (Frontend App)
```bash
npm run dev
```
O App será hospedado por padrão em `http://localhost:5173`.

### Executar o Bot do Discord
```bash
npm run bot
```
*(Opcional: utilize uma ferramenta como PM2 ou nodemon para manter o bot rodando no ambiente de produção).*

---

## 🤝 Como o Algoritmo Funciona (Dica para Desenvolvedores)

Os solvers que residem em `src/core` funcionam da seguinte forma:
1. Validam o tabuleiro inserido inicialmente (retornam erro se o estado fornecido for matematicamente impossível ou contraditório).
2. Geram permutações possíveis (buscando pela quantidade exata de alvos estipuladas pelas regras do jogo).
3. Após criar o monte de cenários possíveis, o total válido se torna nossa população para inferência Bayesiana e probabilística.
4. O retorno do motor inclui um array bidimensional com a `probabilidade [0..1]` para que o interpretador da UI e do Bot exiba na tela para o usuário.

---

## 📄 Licença

Este projeto é desenvolvido para fins utilitários e de auxílio à comunidade de jogos em texto.
Licença ISC - consulte a página do npm para detalhes abertos.
