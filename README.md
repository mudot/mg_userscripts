# MonstersGame Userscripts ⚔️

Conjunto de scripts modulares desenvolvidos para aprimorar a experiência, a interface e o gerenciamento de recursos no jogo de navegador **MonstersGame**, com ênfase especial na usabilidade em dispositivos móveis.

> [!WARNING]
> **Aviso Legal:** Este é um projeto independente criado pela comunidade. Não possui qualquer vínculo oficial, suporte ou afiliação com os desenvolvedores ou administradores do MonstersGame. O uso é de responsabilidade de cada jogador.

---

## 📦 Scripts Disponíveis

| Script | Descrição |
| :--- | :--- |
| `MonstersGame-Mobile.user.js` | Interface responsiva, correções de sobreposição e otimização para dispositivos móveis.
| `MonstersGame-Attack-Timer.user.js` | Contador regressivo flutuante para cooldown de ataques com alertas. |

---

## 🛠️ Detalhes das Ferramentas

### 📱 1. MonstersGame Mobile
Reformula o layout do jogo para garantir acessibilidade fluida em smartphones, tablets e resoluções reduzidas.
* **Layout Responsivo:** Elimina barras de rolagem horizontais e quebras visuais.
* **Correções Visuais:** Componentes readequados, fontes proporcionais e ajustes em textos sobrepostos.
* **Otimização de Telas Críticas:** 
  * Talentos ajustados rigidamente aos seus respectivos slots e conjuntos organizados.
  * *Statbar* reconstruída com melhor posicionamento para o botão **Memo**.

---

### ⏱️ 3. Timer de Cooldown de Ataque
Cronômetro em tempo real para gerenciar o intervalo entre batalhas sem necessidade de recálculo manual.
* **Controle:** Detecção automática do ataque ou acionamento manual.
* **Alertas:** Notificações de navegador e alertas sonoros configuráveis ao término do tempo.
* **Interface Flutuante (HUD):**
  * Arrastável (*drag-and-drop*) com suporte a mouse e toque (Pointer Events).
  * Memória de posicionamento via `localStorage`.
  * Redimensionamento automático baseado na resolução da tela.

---

## 🚀 Instalação

1. Instale uma extensão gerenciadora de userscripts em seu navegador:
   * [Tampermonkey](https://www.tampermonkey.net/) (Recomendado) ou [Violentmonkey](https://violentmonkey.github.io/).
2. Clique no script desejado na pasta do repositório (ou copie seu código-fonte).
3. Crie um novo script no gerenciador e cole o código.
4. Salve e recarregue a página do MonstersGame.

---

## 🔒 Privacidade e Arquitetura

* **100% Client-Side:** Os scripts rodam exclusivamente no navegador do usuário via JavaScript nativo.
* **Armazenamento Local:** Dados como histórico de ranking, timers e posições de HUD são gravados apenas no `localStorage` do dispositivo. Nenhuma informação é enviada a servidores externos.
* **Tecnologias Utilizadas:** Vanilla JS, CSS3 Flexbox/Grid, DOM MutationObserver, Web Audio API e Web Notifications API.

---

## 🤝 Contribuições

Contribuições, correções e sugestões são bem-vindas!
* Para reportar bugs, abra uma **[Issue](../../issues)** informando seu dispositivo, navegador, resolução e, se possível, prints da tela/console.
* Pull Requests estruturados serão analisados e aceitos.

---

## 📜 Licença

Este projeto é distribuído sob a licença [MIT](LICENSE) 
