# A.S.T.R.A Site

Site de download da **A.S.T.R.A**, uma inteligência artificial que ajuda pessoas cegas a usar o computador com autonomia.

A A.S.T.R.A reúne três funções principais:

- **Controle por voz:** abre programas, navega e escreve conversando, sem mouse.
- **Leitor de tela:** lê em voz alta janelas, menus, botões e textos.
- **Gerenciador de arquivos:** encontra, abre, move, copia e renomeia arquivos por comando.

Este repositório guarda apenas o **site** do projeto (página de apresentação e download), feito em HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build.

## Como rodar

1. Clone o repositório:
   ```
   git clone https://github.com/here236/A.S.T.R.A-Site.git
   ```
2. Abra a pasta no VS Code.
3. Instale a extensão **Live Server**, clique com o botão direito no `index.html` e escolha **Open with Live Server**. O projeto já está configurado para a porta 5501.

Também dá para abrir o `index.html` direto no navegador, mas alguns recursos, como o contador de downloads, só funcionam por um servidor local.

## Estrutura de pastas

```
A.S.T.R.A-Site/
├─ index.html
├─ README.md
├─ css/
│  ├─ astra.css          estilos do site e dos dois temas
│  └─ astra-legal.css    estilos das páginas de termos e privacidade
├─ js/
│  └─ astra.js           tema, fundo de partículas, animações e contador
├─ assets/
│  ├─ logo.svg           logo da A.S.T.R.A em vetor
│  └─ favicon.svg        ícone da aba do navegador
└─ pages/
   ├─ termos.html        Termos de Uso
   └─ privacidade.html   Política de Privacidade
```

## O que configurar

**No topo do `js/astra.js`:**

| Constante | Para que serve |
|---|---|
| `DOWNLOAD_URL` | Link do instalador. Enquanto estiver vazio, os botões de download rolam até a seção de acesso. |
| `DOCS_URL` | Link da documentação. Enquanto estiver vazio, o botão rola até a seção de recursos. |
| `GITHUB_REPO` | Repositório onde o instalador é publicado como Release. É daqui que sai o contador de downloads. |

**Nas páginas legais (`pages/`):** os campos destacados em amarelo (nome do responsável, e-mail de contato, data, local de hospedagem e como o programa trata voz, tela e arquivos) precisam ser preenchidos antes de publicar. Depois de preencher, remova o destaque `.fill` do `css/astra-legal.css`.

## Temas claro e escuro

O site segue o tema do sistema na primeira visita. O botão de sol e lua no menu alterna entre os dois, e a escolha fica salva no navegador. As cores de cada tema são variáveis CSS no início do `css/astra.css`.

## Acessibilidade

O site é feito para ser usado com leitor de tela e só com o teclado. Alguns cuidados que já estão no código:

- link "Ir para o conteúdo", regiões marcadas e títulos em ordem (h1, h2, h3);
- botões e links com área de toque grande e foco visível;
- elementos decorativos escondidos do leitor de tela;
- animações desligadas para quem ativa "reduzir movimento" no sistema;
- contraste alto nos dois temas.

Antes de mudar algo no site, vale conferir estes pontos: navegar só com Tab, testar nos dois temas e testar no celular. Encontrou um problema de acessibilidade? Abra uma issue neste repositório ou escreva para **[E-MAIL DE CONTATO]**.

## Como contribuir

1. Faça as alterações em uma branch ou diretamente na `main`, conforme combinado no grupo.
2. Teste nos dois temas, no computador e no celular.
3. Faça commits pequenos, um assunto por commit, com mensagens no padrão abaixo:

| Prefixo | Quando usar |
|---|---|
| `feat:` | Algo novo (um recurso, uma página) |
| `fix:` | Correção de problema |
| `refactor:` | Mudança de código sem mudar o resultado, como reorganizar arquivos |
| `style:` | Ajustes de aparência |
| `docs:` | Mudanças em textos de documentação, como este README |

Exemplo: `feat: adiciona animação circular na troca de tema`.

## Pendências

- [ ] Publicar o instalador como Release e preencher `DOWNLOAD_URL`
- [ ] Revisar os números da seção de métricas (precisão e tempo de resposta)
- [ ] Preencher os campos pendentes dos Termos de Uso e da Política de Privacidade
- [ ] Definir a licença do projeto
- [ ] Adicionar o endereço do site publicado a este README

## Licença

A definir.
