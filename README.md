# Sistema de Gerenciamento para Assistência Técnica

Sistema web para gerenciamento de uma assistência técnica de eletrodomésticos.

## Funcionalidades

- **Dashboard**: Visão geral do negócio com indicadores e serviços recentes
- **Gerenciamento de Clientes**: Cadastro, edição e exclusão de clientes
- **Gerenciamento de Serviços**: Registro e acompanhamento de serviços de reparo
- **Gerenciamento de Peças**: Controle de estoque de peças para reparos
- **Relatórios**: Geração de relatórios de serviços, peças e receita

## Como usar

1. Faça o download ou clone este repositório
2. Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Edge, etc.)
3. O sistema está pronto para uso!

## Tecnologias utilizadas

- HTML5
- CSS3 (com layout responsivo)
- JavaScript puro
- Armazenamento em localStorage (sem necessidade de servidor)

## Estrutura do projeto

```
├── index.html           # Página principal
├── css/                 # Estilos CSS
│   ├── style.css        # Estilos principais
│   └── responsive.css   # Estilos responsivos
├── js/                  # Scripts JavaScript
│   ├── app.js           # Script principal
│   ├── database.js      # Gerenciamento de dados (localStorage)
│   ├── utils.js         # Funções utilitárias
│   ├── clientes.js      # Módulo de clientes
│   ├── servicos.js      # Módulo de serviços
│   ├── pecas.js         # Módulo de peças
│   └── relatorios.js    # Módulo de relatórios
└── img/                 # Pasta para imagens (se necessário)
```

## Armazenamento de dados

Todos os dados são armazenados localmente no navegador utilizando a API localStorage. Isso significa que:

- Os dados persistem entre sessões de navegação
- Não é necessário um servidor para rodar o sistema
- Os dados são armazenados apenas no dispositivo atual
- A limpeza do cache do navegador apagará os dados

## Uso em dispositivos móveis

O sistema possui layout responsivo e pode ser utilizado em tablets e smartphones, adaptando-se automaticamente ao tamanho da tela.

## Observações importantes

Este sistema foi desenvolvido para uso em ambientes de produção de pequena escala ou para fins educacionais. Em um ambiente de produção real com maior volume de dados, seria recomendado:

- Implementar um backend com banco de dados
- Adicionar autenticação de usuários
- Implementar backup de dados
- Adicionar mais validações de segurança

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

### Configuração da Geração de PDF (Opcional)

Para habilitar a geração de PDFs para os recibos de serviço:

1. Baixe a biblioteca html2pdf.js:
   - Acesse https://cdnjs.com/libraries/html2pdf.js e baixe a versão mais recente
   - OU use npm: `npm install html2pdf.js --save`
   
2. Coloque o arquivo html2pdf.js na pasta raiz do projeto

3. Edite o arquivo `index.html` e descomente a linha:
   ```html
   <!-- <script src="html2pdf.js"></script> -->
   ``` 