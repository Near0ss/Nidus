import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const DEMO_PASS = 'nidus123';
const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const avatar = (seed) => `https://i.pravatar.cc/200?u=${encodeURIComponent(seed)}`;

const CATEGORIES = [
  { slug: 'design', name: 'Design' },
  { slug: 'desenvolvimento', name: 'Desenvolvimento' },
  { slug: 'mobile', name: 'Mobile' },
  { slug: 'video', name: 'Vídeo' },
  { slug: '3d', name: '3D' },
  { slug: 'conteudo', name: 'Conteúdo' },
  { slug: 'dados', name: 'Dados' },
  { slug: 'arquitetura', name: 'Arquitetura' },
];

const SKILLS = [
  ['design', 'UI/UX Designer'],
  ['design', 'Graphic Designer'],
  ['design', 'Motion Designer'],
  ['desenvolvimento', 'Web Developer'],
  ['desenvolvimento', 'AI Developer'],
  ['mobile', 'Mobile Developer'],
  ['video', 'Video Editor'],
  ['3d', '3D Artist'],
  ['conteudo', 'Copywriter'],
  ['conteudo', 'Social Media'],
  ['dados', 'Data Analyst'],
  ['desenvolvimento', 'Game Developer'],
  ['arquitetura', 'Architect'],
  ['arquitetura', 'Interior Designer'],
  ['video', 'Photographer'],
];

const FREELANCERS = [
  { username: 'marina.dev', email: 'marina@nidus.dev', name: 'Marina Alves', business: 'Marina Alves', headline: 'Web Developer', city: 'Porto Alegre', state: 'RS', skill: 'Web Developer', cat: 'desenvolvimento', about: 'Crio interfaces rápidas em React e cuido da entrega ponta a ponta.', price: 120000, exp: '6 anos' },
  { username: 'leo.mobile', email: 'leo@nidus.dev', name: 'Leonardo Pires', business: 'Pires Mobile', headline: 'Mobile Developer', city: 'Curitiba', state: 'PR', skill: 'Mobile Developer', cat: 'mobile', about: 'Apps React Native com foco em performance e UX.', price: 180000, exp: '5 anos' },
  { username: 'sofia.ux', email: 'sofia@nidus.dev', name: 'Sofia Martins', business: 'Sofia UX', headline: 'UI/UX Designer', city: 'São Paulo', state: 'SP', skill: 'UI/UX Designer', cat: 'design', about: 'Pesquisa, fluxos e UI para produtos digitais.', price: 90000, exp: '7 anos' },
  { username: 'rafa.grafico', email: 'rafa@nidus.dev', name: 'Rafael Nunes', business: 'Nunes Studio', headline: 'Graphic Designer', city: 'Belo Horizonte', state: 'MG', skill: 'Graphic Designer', cat: 'design', about: 'Identidade visual e sistemas de marca para negócios locais.', price: 80000, exp: '8 anos' },
  { username: 'clara.video', email: 'clara@nidus.dev', name: 'Clara Mendes', business: 'Clara Cut', headline: 'Video Editor', city: 'Rio de Janeiro', state: 'RJ', skill: 'Video Editor', cat: 'video', about: 'Edição para Reels, YouTube e campanhas curtas.', price: 70000, exp: '4 anos' },
  { username: 'theo.3d', email: 'theo@nidus.dev', name: 'Theo Barbosa', business: 'Barbosa 3D', headline: '3D Artist', city: 'Florianópolis', state: 'SC', skill: '3D Artist', cat: '3d', about: 'Modelagem, lookdev e peças para produto e arquitetura.', price: 150000, exp: '6 anos' },
  { username: 'ana.photo', email: 'ana@nidus.dev', name: 'Ana Ribeiro', business: 'Ana Ribeiro Foto', headline: 'Photographer', city: 'Salvador', state: 'BA', skill: 'Photographer', cat: 'video', about: 'Ensaio de produto, gastronomia e retrato corporativo.', price: 60000, exp: '9 anos' },
  { username: 'diego.social', email: 'diego@nidus.dev', name: 'Diego Castro', business: 'Castro Social', headline: 'Social Media', city: 'Brasília', state: 'DF', skill: 'Social Media', cat: 'conteudo', about: 'Calendário, criativos e acompanhamento de campanhas.', price: 55000, exp: '5 anos' },
  { username: 'helena.copy', email: 'helena@nidus.dev', name: 'Helena Costa', business: 'Costa Copy', headline: 'Copywriter', city: 'Recife', state: 'PE', skill: 'Copywriter', cat: 'conteudo', about: 'Textos para landing, e-mail e posicionamento de marca.', price: 45000, exp: '10 anos' },
  { username: 'bruno.data', email: 'bruno.data@nidus.dev', name: 'Bruno Teixeira', business: 'Teixeira Data', headline: 'Data Analyst', city: 'Campinas', state: 'SP', skill: 'Data Analyst', cat: 'dados', about: 'Dashboards e análises para times de produto e marketing.', price: 130000, exp: '6 anos' },
  { username: 'iris.ai', email: 'iris@nidus.dev', name: 'Iris Nakamura', business: 'Nakamura AI', headline: 'AI Developer', city: 'São Paulo', state: 'SP', skill: 'AI Developer', cat: 'desenvolvimento', about: 'Automações com Python e integrações de modelos.', price: 200000, exp: '4 anos' },
  { username: 'gabriel.game', email: 'gabriel@nidus.dev', name: 'Gabriel Lopes', business: 'Lopes Games', headline: 'Game Developer', city: 'Joinville', state: 'SC', skill: 'Game Developer', cat: 'desenvolvimento', about: 'Protótipos e jogos 2D com foco em feel e polimento.', price: 160000, exp: '7 anos' },
  { username: 'lia.arq', email: 'lia@nidus.dev', name: 'Lia Ferreira', business: 'Ferreira Arquitetura', headline: 'Architect', city: 'Porto Alegre', state: 'RS', skill: 'Architect', cat: 'arquitetura', about: 'Plantas, reformas residenciais e acompanhamento de obra.', price: 250000, exp: '11 anos' },
  { username: 'otavio.interiores', email: 'otavio@nidus.dev', name: 'Otávio Lima', business: 'Lima Interiores', headline: 'Interior Designer', city: 'Curitiba', state: 'PR', skill: 'Interior Designer', cat: 'arquitetura', about: 'Ambientes comerciais e residenciais com paleta quente.', price: 140000, exp: '8 anos' },
  { username: 'nina.motion', email: 'nina@nidus.dev', name: 'Nina Azevedo', business: 'Azevedo Motion', headline: 'Motion Designer', city: 'São Paulo', state: 'SP', skill: 'Motion Designer', cat: 'design', about: 'Motion para produto, abertura e explainer curto.', price: 95000, exp: '5 anos' },
];

const CLIENTS = [
  { username: 'bruno.cliente', email: 'bruno@nidus.dev', name: 'Bruno Carvalho', city: 'Porto Alegre', state: 'RS' },
  { username: 'carla.melo', email: 'carla@nidus.dev', name: 'Carla Melo', city: 'São Paulo', state: 'SP' },
  { username: 'pedro.santos', email: 'pedro@nidus.dev', name: 'Pedro Santos', city: 'Curitiba', state: 'PR' },
  { username: 'juliana.rocha', email: 'juliana@nidus.dev', name: 'Juliana Rocha', city: 'Belo Horizonte', state: 'MG' },
  { username: 'felipe.moura', email: 'felipe@nidus.dev', name: 'Felipe Moura', city: 'Recife', state: 'PE' },
  { username: 'beatriz.nunes', email: 'beatriz@nidus.dev', name: 'Beatriz Nunes', city: 'Rio de Janeiro', state: 'RJ' },
  { username: 'andre.silva', email: 'andre@nidus.dev', name: 'André Silva', city: 'Campinas', state: 'SP' },
  { username: 'lara.freitas', email: 'lara@nidus.dev', name: 'Lara Freitas', city: 'Florianópolis', state: 'SC' },
];

const SERVICE_DEFS = [
  { user: 'marina.dev', title: 'Landing Page em React', price: 120000, days: 7, type: 'FIXED', cat: 'desenvolvimento', desc: 'Landing page em React com seções, formulário e deploy. Inclui ajustes de layout desktop e mobile.', includes: 'Layout em React\nResponsivo\nFormulário de contato\nDeploy inicial' },
  { user: 'marina.dev', title: 'Dashboard administrativo', price: 280000, days: 21, type: 'STARTING_AT', cat: 'desenvolvimento', desc: 'Painel interno com autenticação, tabelas e filtros. Escopo fechado após briefing.', includes: 'Auth\nCRUD principal\nFiltros\nDocumentação básica' },
  { user: 'leo.mobile', title: 'Aplicativo React Native', price: 450000, days: 30, type: 'STARTING_AT', cat: 'mobile', desc: 'App nativo para iOS e Android com navegação, login e listagens.', includes: 'App iOS/Android\nNavegação\nIntegração de API' },
  { user: 'sofia.ux', title: 'UI de aplicativo', price: 180000, days: 14, type: 'FIXED', cat: 'design', desc: 'Fluxo completo de telas no Figma, com componentes e protótipo clicável.', includes: 'Pesquisa rápida\nWireframes\nUI hi-fi\nProtótipo' },
  { user: 'rafa.grafico', title: 'Criação de identidade visual', price: 150000, days: 10, type: 'FIXED', cat: 'design', desc: 'Marca, paleta, tipografia e aplicações básicas para redes e papelaria.', includes: 'Logo\nPaleta\nTipografia\nManual resumido' },
  { user: 'rafa.grafico', title: 'Criação de logotipo', price: 70000, days: 5, type: 'FIXED', cat: 'design', desc: 'Três caminhos de logo e arquivo final em vetor.', includes: '3 propostas\nArquivos vetoriais\nVariações de cor' },
  { user: 'clara.video', title: 'Edição de vídeo para Reels', price: 35000, days: 3, type: 'FIXED', cat: 'video', desc: 'Corte, legendas e ritmo para conteúdo curto.', includes: 'Até 45s\nLegendas\nMúsica livre de royalty' },
  { user: 'theo.3d', title: 'Modelagem 3D de produto', price: 220000, days: 12, type: 'STARTING_AT', cat: '3d', desc: 'Modelo e render de produto para catálogo ou campanha.', includes: 'Modelo\n2 renders\nAjustes de material' },
  { user: 'ana.photo', title: 'Ensaio de produto', price: 90000, days: 4, type: 'FIXED', cat: 'video', desc: 'Sessão em estúdio simples com tratamento das fotos principais.', includes: '20 fotos tratadas\nDireção de luz\nEntrega em alta' },
  { user: 'diego.social', title: 'Gestão de conteúdo mensal', price: 120000, days: 30, type: 'FIXED', cat: 'conteudo', desc: 'Planejamento e peças para Instagram durante um mês.', includes: 'Calendário\n12 peças\nLegendas' },
  { user: 'helena.copy', title: 'Copy de landing page', price: 50000, days: 5, type: 'FIXED', cat: 'conteudo', desc: 'Estrutura e textos para uma página de captura ou venda.', includes: 'Headline\nSeções\nCTA\nRevisão' },
  { user: 'bruno.data', title: 'Dashboard Power BI', price: 190000, days: 10, type: 'FIXED', cat: 'dados', desc: 'Painel com indicadores, filtros e atualização de base.', includes: 'Modelo\n3 páginas\nDocumentação' },
  { user: 'iris.ai', title: 'Automação com Python', price: 160000, days: 8, type: 'STARTING_AT', cat: 'desenvolvimento', desc: 'Script ou serviço para automatizar uma rotina repetitiva.', includes: 'Script\nReadme\nTeste em amostra' },
  { user: 'iris.ai', title: 'Consultoria de banco de dados', price: 140000, days: 7, type: 'NEGOTIABLE', cat: 'dados', desc: 'Revisão de schema, índices e consultas lentas.', includes: 'Diagnóstico\nRecomendações\nCall de alinhamento' },
  { user: 'gabriel.game', title: 'Protótipo de jogo 2D', price: 300000, days: 21, type: 'STARTING_AT', cat: 'desenvolvimento', desc: 'Vertical slice jogável com uma mecânica principal.', includes: 'Build jogável\nControles\n1 fase' },
  { user: 'lia.arq', title: 'Projeto de reforma residencial', price: 420000, days: 25, type: 'STARTING_AT', cat: 'arquitetura', desc: 'Estudo de layout, plantas e memorial descritivo resumido.', includes: 'Plantas\nCortes\nMemorial' },
  { user: 'otavio.interiores', title: 'Projeto de interiores comercial', price: 260000, days: 18, type: 'STARTING_AT', cat: 'arquitetura', desc: 'Moodboard, layout e especificação de móveis para loja ou café.', includes: 'Moodboard\nLayout\nLista de peças' },
  { user: 'nina.motion', title: 'Motion para lançamento de produto', price: 110000, days: 7, type: 'FIXED', cat: 'design', desc: 'Peça curta de 15–20s para redes, com tipografia e produto.', includes: 'Storyboard\nAnimação\nExport HD' },
  { user: 'sofia.ux', title: 'Pesquisa e fluxos de onboarding', price: 130000, days: 10, type: 'FIXED', cat: 'design', desc: 'Mapa de jornada e telas de onboarding para app ou SaaS.', includes: 'Jornada\nFluxos\n3 telas chave' },
  { user: 'leo.mobile', title: 'Publicação nas lojas', price: 80000, days: 6, type: 'FIXED', cat: 'mobile', desc: 'Preparação de build, screenshots e envio para App Store e Play.', includes: 'Builds\nFichas das lojas\nAcompanhamento da revisão' },
  { user: 'marina.dev', title: 'Manutenção mensal de site', price: 90000, days: 30, type: 'FIXED', cat: 'desenvolvimento', desc: 'Pequenas evoluções, correções e atualizações durante 30 dias.', includes: 'Até 8h\nRelatório\nBackup' },
  { user: 'clara.video', title: 'Edição de vídeo institucional', price: 180000, days: 10, type: 'STARTING_AT', cat: 'video', desc: 'Corte, cor e legendas para um vídeo de 60–90s.', includes: 'Edição\nCor\nLegendas' },
  { user: 'theo.3d', title: 'Visualização arquitetônica', price: 240000, days: 14, type: 'STARTING_AT', cat: '3d', desc: 'Renders internos e externos a partir de planta ou modelo.', includes: '2 cenas\nAjustes de luz\nEntrega em alta' },
  { user: 'diego.social', title: 'Campanha de lançamento', price: 150000, days: 14, type: 'FIXED', cat: 'conteudo', desc: 'Roteiro de posts e criativos para duas semanas de lançamento.', includes: 'Roteiro\n8 peças\nLegendas' },
  { user: 'helena.copy', title: 'Sequência de e-mail', price: 70000, days: 6, type: 'FIXED', cat: 'conteudo', desc: 'Cinco e-mails de nutrição ou pós-compra.', includes: '5 e-mails\nAssuntos\nCTAs' },
  { user: 'bruno.data', title: 'Análise exploratória', price: 110000, days: 8, type: 'FIXED', cat: 'dados', desc: 'Limpeza, gráficos e relatório com achados principais.', includes: 'Notebook\nRelatório\nCall de leitura' },
  { user: 'nina.motion', title: 'Abertura animada', price: 65000, days: 5, type: 'FIXED', cat: 'design', desc: 'Vinheta curta com logo e som simples.', includes: 'Animação 5–8s\nVersão sem som\nArquivo final' },
  { user: 'otavio.interiores', title: 'Consultoria de paleta e móveis', price: 50000, days: 4, type: 'FIXED', cat: 'arquitetura', desc: 'Call + documento com paleta, referências e lista de compras.', includes: 'Call 1h\nPaleta\nLista' },
  { user: 'gabriel.game', title: 'Polimento de controles', price: 90000, days: 7, type: 'NEGOTIABLE', cat: 'desenvolvimento', desc: 'Ajuste de feel, câmera e feedback em um protótipo existente.', includes: 'Diagnóstico\nBuild revisada\nNotas' },
  { user: 'lia.arq', title: 'Estudo de fachada', price: 180000, days: 12, type: 'FIXED', cat: 'arquitetura', desc: 'Duas opções de fachada com materiais e volumetria.', includes: '2 estudos\nReferências\nMemorial resumido' },
];

const POSTS = [
  ['marina.dev', 'Finalizei hoje a landing page desse restaurante. Ficou limpa, rápida e fácil de atualizar.'],
  ['marina.dev', 'Algumas etapas do processo desse dashboard: tabela, filtros e o estado vazio.'],
  ['rafa.grafico', 'Finalizei hoje a identidade visual desse restaurante.'],
  ['rafa.grafico', 'Esse foi o antes/depois da marca. Menos ruído, mais leitura.'],
  ['sofia.ux', 'Testando uma nova composição para essa landing page.'],
  ['sofia.ux', 'Fluxo de onboarding revisado depois de duas rodadas com o cliente.'],
  ['leo.mobile', 'Depois de algumas semanas, finalmente publiquei o aplicativo.'],
  ['leo.mobile', 'Agenda aberta para setembro para apps em React Native.'],
  ['clara.video', 'Esse foi o antes/depois da edição. O ritmo mudou tudo.'],
  ['clara.video', 'Três Reels entregues hoje. Corte curto, legenda grande, som baixo.'],
  ['theo.3d', 'Algumas etapas do processo desse projeto de produto.'],
  ['theo.3d', 'Lookdev novo para esse material metálico. Ainda vou ajustar o ambiente.'],
  ['ana.photo', 'Ensaio de produto com luz simples. Menos setup, mais clareza.'],
  ['diego.social', 'Calendário da próxima quinzena fechado. Foco em prova social e bastidores.'],
  ['helena.copy', 'Reescrevi a headline três vezes. A terceira foi a que o cliente reconheceu.'],
  ['bruno.data', 'Dashboard novo no ar. Os filtros de período estavam escondendo o problema.'],
  ['iris.ai', 'Automação rodando: o relatório que levava uma tarde agora sai de manhã.'],
  ['gabriel.game', 'O pulo ainda estava pesado. Hoje o personagem responde melhor.'],
  ['lia.arq', 'Estudo de planta para um apartamento estreito. A cozinha ganhou luz.'],
  ['otavio.interiores', 'Paleta quente para um café pequeno. Madeira clara e cimento queimado.'],
  ['nina.motion', 'Abertura de 6 segundos pronta. Tipografia grande e produto no centro.'],
  ['marina.dev', 'Agenda aberta para setembro para landing pages e manutenção.'],
  ['sofia.ux', 'Testei o fluxo no celular real. Dois toques a menos no cadastro.'],
  ['rafa.grafico', 'Logo novo em três aplicações: cartão, fachada e story.'],
  ['clara.video', 'Cliente mandou o bruto ontem. Entrega hoje no fim da tarde.'],
  ['theo.3d', 'Render interno quase fechado. Falta só o tecido da poltrona.'],
  ['iris.ai', 'Consulta lenta virou índice. O painel parou de travar no filtro.'],
  ['bruno.data', 'Achei um pico estranho nas terças. Era campanha, não bug.'],
  ['helena.copy', 'Texto curto para e-mail de boas-vindas. Sem enrolação.'],
  ['diego.social', 'Bastidores funcionam melhor que recorte de estoque neste perfil.'],
  ['nina.motion', 'Testando uma nova composição para essa landing page em motion.'],
  ['leo.mobile', 'Build enviada para revisão. Agora é esperar a loja.'],
  ['lia.arq', 'Fachada B ganhou a preferência. Mais sombra e menos vidro.'],
  ['otavio.interiores', 'Lista de móveis pronta. Tudo cabe no orçamento combinado.'],
  ['gabriel.game', 'Uma fase só, mas já dá para sentir o jogo.'],
  ['ana.photo', 'Luz da janela + rebatedor. Sem flash hoje.'],
  ['marina.dev', 'Formulário com validação de verdade. Menos e-mail quebrado.'],
  ['sofia.ux', 'Os cards estavam competindo. Agrupei ações e o olhar descansou.'],
  ['rafa.grafico', 'Manual resumido entregue: logo, cor, erro comum e aplicação certa.'],
  ['clara.video', 'Legendas grandes, corte no gesto. Funciona no mudo.'],
];

const COMMENTS = [
  'Ficou muito bom!',
  'O ritmo está ótimo.',
  'Quero algo nessa linha.',
  'A paleta funcionou bem.',
  'Entrega limpa.',
  'Dá para ver o processo.',
  'Isso resolve o que eu precisava.',
  'Referência salva.',
  'O antes/depois ajuda muito.',
  'Parabéns pelo fechamento.',
];

const PHOTO_IDS = [
  '1498050108023-c5249f4df085',
  '1522542550221-31fd19575a2d',
  '1561070791-2526d30994b5',
  '1517245386807-bb43f82c33c4',
  '1542744173-8e7e53415bb0',
  '1522202176988-66273c2fd55f',
  '1515378791036-0648a3ef77b2',
  '1515879218367-8466d910aaa4',
  '1523475472560-d2df97ec485c',
  '1486312338219-ce68d2c6f44d',
];

async function upsertSkill(name, categoryId) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return prisma.skill.upsert({
    where: { slug },
    update: { name, categoryId },
    create: { name, slug, categoryId },
  });
}

async function main() {
  console.log('Limpando banco de desenvolvimento…');
  await prisma.$executeRawUnsafe(`
    PRAGMA foreign_keys = OFF;
  `);
  const tables = [
    'Review', 'Transaction', 'Notification', 'Message', 'ConversationParticipant', 'Conversation',
    'Follow', 'SavedFreelancer', 'SavedService', 'SavedPost', 'Comment', 'PostLike', 'PostMedia', 'Post',
    'Contract', 'PortfolioMedia', 'PortfolioProject', 'ServiceMedia', 'Service',
    'FreelancerSkill', 'Skill', 'Category', 'ServiceView', 'ProfileView', 'FreelancerProfile', 'User',
  ];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
    } catch {
      /* tabela ainda não existe na primeira execução */
    }
  }
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);

  const passwordHash = await bcrypt.hash(DEMO_PASS, 10);

  const categories = {};
  for (const cat of CATEGORIES) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }
  const skills = {};
  for (const [catSlug, name] of SKILLS) {
    skills[name] = await upsertSkill(name, categories[catSlug].id);
  }

  const freelancerMap = {};
  for (const item of FREELANCERS) {
    const user = await prisma.user.create({
      data: {
        role: 'FREELANCER',
        name: item.name,
        username: item.username,
        email: item.email,
        passwordHash,
        avatarUrl: avatar(item.username),
        bannerUrl: img(PHOTO_IDS[FREELANCERS.indexOf(item) % PHOTO_IDS.length], 1600),
        bio: item.about,
        country: 'Brasil',
        state: item.state,
        city: item.city,
        website: `https://${item.username.replace('.', '')}.example`,
        socialLinks: JSON.stringify({ instagram: '', twitter: '', linkedin: '', facebook: '' }),
        freelancerProfile: {
          create: {
            businessName: item.business,
            headline: item.headline,
            experience: item.exp,
            availability: 'AVAILABLE',
            about: item.about,
            initialPrice: item.price,
            country: 'Brasil',
            state: item.state,
            city: item.city,
          },
        },
      },
      include: { freelancerProfile: true },
    });
    await prisma.freelancerSkill.create({
      data: { freelancerId: user.freelancerProfile.id, skillId: skills[item.skill].id },
    });
    freelancerMap[item.username] = user;
  }

  const clientMap = {};
  for (const item of CLIENTS) {
    clientMap[item.username] = await prisma.user.create({
      data: {
        role: 'CLIENT',
        name: item.name,
        username: item.username,
        email: item.email,
        passwordHash,
        avatarUrl: avatar(item.username),
        country: 'Brasil',
        state: item.state,
        city: item.city,
        bio: 'Busco profissionais para projetos pontuais.',
      },
    });
  }

  clientMap['cliente.demo'] = await prisma.user.create({
    data: {
      role: 'CLIENT',
      name: 'Cliente Demo',
      username: 'cliente.demo',
      email: 'cliente@nidus.test',
      passwordHash,
      avatarUrl: avatar('cliente.demo'),
      country: 'Brasil',
      state: 'RS',
      city: 'Porto Alegre',
      bio: 'Conta de desenvolvimento para testar a experiência de cliente.',
    },
  });

  freelancerMap['freelancer.demo'] = await prisma.user.create({
    data: {
      role: 'FREELANCER',
      name: 'Freelancer Demo',
      username: 'freelancer.demo',
      email: 'freelancer@nidus.test',
      passwordHash,
      avatarUrl: avatar('freelancer.demo'),
      bio: 'Conta de desenvolvimento para testar o painel freelancer.',
      country: 'Brasil',
      state: 'SP',
      city: 'São Paulo',
      freelancerProfile: {
        create: {
          businessName: 'Estúdio Demo',
          headline: 'Designer & Developer',
          experience: '4 anos',
          availability: 'AVAILABLE',
          about: 'Perfil demo para validar dashboard, serviços e Social.',
          initialPrice: 90000,
          country: 'Brasil',
          state: 'SP',
          city: 'São Paulo',
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const nearHash = await bcrypt.hash('20645566Yy*', 10);
  const near = await prisma.user.create({
    data: {
      id: '2cd9bfc2-7203-4bb3-a79d-e3885b354fed',
      role: 'FREELANCER',
      name: 'Near0ss',
      username: 'Near',
      email: 'near@gmail.com',
      passwordHash: nearHash,
      bio: 'apenas um cara tranquilo',
      country: 'Brasil',
      state: 'Rio Grande do Sul',
      city: 'Porto Alegre',
      freelancerProfile: {
        create: {
          businessName: 'Near0ss',
          headline: 'UI/UX Designer',
          about: 'apenas um cara tranquilo',
          country: 'Brasil',
          state: 'Rio Grande do Sul',
          city: 'Porto Alegre',
          initialPrice: 1200,
        },
      },
    },
    include: { freelancerProfile: true },
  });
  for (const title of ['UI/UX Designer', 'Graphic Designer', 'Motion Designer']) {
    if (skills[title]) {
      await prisma.freelancerSkill.create({
        data: { freelancerId: near.freelancerProfile.id, skillId: skills[title].id },
      });
    }
  }

  const aaa = await prisma.user.create({
    data: {
      id: 'ef7c84b7-1761-40fa-87cb-fc2427560aea',
      role: 'FREELANCER',
      name: 'aaaaaaaaaaaa',
      username: 'aaaaaaaa',
      email: 'aaaaaaa@gmail.com',
      passwordHash: nearHash,
      bio: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      country: 'Peru',
      state: 'Lima',
      freelancerProfile: {
        create: {
          businessName: 'aaaaaaaaaaaa',
          headline: '3D Artist',
          about: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          country: 'Peru',
          state: 'Lima',
          initialPrice: 1200,
        },
      },
    },
    include: { freelancerProfile: true },
  });
  if (skills['3D Artist']) {
    await prisma.freelancerSkill.create({
      data: { freelancerId: aaa.freelancerProfile.id, skillId: skills['3D Artist'].id },
    });
  }

  await prisma.user.create({
    data: {
      id: 'bb29ddf2-75bb-4bfe-9646-19cb3c86f70b',
      role: 'FREELANCER',
      name: 'H2B Web',
      username: 'buchholz',
      email: 'danielbuchholz16@gmail.com',
      passwordHash: nearHash,
      provider: 'google',
      googleId: '116722857982116370290',
      bio: '',
      country: 'Brasil',
      state: 'Rio Grande do Sul',
      city: 'Porto Alegre',
      freelancerProfile: {
        create: {
          businessName: 'H2B Web',
          headline: 'UI/UX Designer',
          country: 'Brasil',
          state: 'Rio Grande do Sul',
          city: 'Porto Alegre',
          initialPrice: 100000,
        },
      },
    },
  });

  const serviceMap = {};
  let photoIndex = 0;
  for (const def of SERVICE_DEFS) {
    const freelancer = freelancerMap[def.user];
    const service = await prisma.service.create({
      data: {
        freelancerId: freelancer.id,
        title: def.title,
        slug: `${def.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${randomUUID().slice(0, 6)}`,
        description: def.desc,
        includes: def.includes,
        categoryId: categories[def.cat].id,
        priceType: def.type,
        price: def.type === 'NEGOTIABLE' ? null : def.price,
        deliveryDays: def.days,
        status: 'ACTIVE',
        views: 4 + (photoIndex % 40),
        media: {
          create: [
            { url: img(PHOTO_IDS[photoIndex % PHOTO_IDS.length]), position: 0, type: 'IMAGE' },
            { url: img(PHOTO_IDS[(photoIndex + 3) % PHOTO_IDS.length]), position: 1, type: 'IMAGE' },
          ],
        },
      },
    });
    serviceMap[`${def.user}:${def.title}`] = service;
    photoIndex += 1;
  }

  for (const item of FREELANCERS.slice(0, 10)) {
    const user = freelancerMap[item.username];
    await prisma.portfolioProject.create({
      data: {
        freelancerId: user.id,
        title: `Estudo — ${item.headline}`,
        description: 'Peça de portfólio, sem venda direta.',
        category: item.headline,
        media: { create: [{ url: img(PHOTO_IDS[FREELANCERS.indexOf(item) % PHOTO_IDS.length]), position: 0 }] },
      },
    });
  }

  const postRecords = [];
  for (const [username, content] of POSTS) {
    const author = freelancerMap[username];
    const withImage = postRecords.length % 3 !== 1;
    const post = await prisma.post.create({
      data: {
        authorId: author.id,
        content,
        media: withImage
          ? { create: [{ url: img(PHOTO_IDS[postRecords.length % PHOTO_IDS.length]), position: 0 }] }
          : undefined,
      },
    });
    postRecords.push(post);
  }

  const clientList = Object.values(clientMap);
  let commentCount = 0;
  for (const post of postRecords) {
    const likers = clientList.slice(0, 3 + (commentCount % 4));
    for (const client of likers) {
      await prisma.postLike.create({ data: { postId: post.id, userId: client.id } });
    }
    const commenter = clientList[commentCount % clientList.length];
    await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: commenter.id,
        content: COMMENTS[commentCount % COMMENTS.length],
      },
    });
    commentCount += 1;
    if (commentCount < 10) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: clientList[(commentCount + 2) % clientList.length].id,
          content: COMMENTS[(commentCount + 3) % COMMENTS.length],
        },
      });
    }
  }

  const marina = freelancerMap['marina.dev'];
  const rafa = freelancerMap['rafa.grafico'];
  const sofia = freelancerMap['sofia.ux'];
  const bruno = clientMap['bruno.cliente'];
  const carla = clientMap['carla.melo'];
  const pedro = clientMap['pedro.santos'];

  for (const [follower, following] of [
    [bruno, marina], [carla, marina], [pedro, marina],
    [bruno, rafa], [carla, sofia], [pedro, rafa],
    [clientMap['juliana.rocha'], marina],
    [clientMap['lara.freitas'], sofia],
    [freelancerMap['leo.mobile'], marina],
    [freelancerMap['nina.motion'], sofia],
  ]) {
    await prisma.follow.create({ data: { followerId: follower.id, followingId: following.id } });
  }

  await prisma.savedFreelancer.createMany({
    data: [
      { userId: bruno.id, freelancerId: marina.id },
      { userId: bruno.id, freelancerId: rafa.id },
      { userId: carla.id, freelancerId: sofia.id },
    ],
  });
  const landing = serviceMap['marina.dev:Landing Page em React'];
  const identidade = serviceMap['rafa.grafico:Criação de identidade visual'];
  await prisma.savedService.createMany({
    data: [
      { userId: bruno.id, serviceId: landing.id },
      { userId: carla.id, serviceId: identidade.id },
    ],
  });
  await prisma.savedPost.createMany({
    data: [
      { userId: bruno.id, postId: postRecords[0].id },
      { userId: carla.id, postId: postRecords[2].id },
    ],
  });

  const completed = await prisma.contract.create({
    data: {
      clientId: carla.id,
      freelancerId: rafa.id,
      serviceId: identidade.id,
      kind: 'HIRE',
      title: 'Criação de identidade visual',
      description: 'Marca completa para o café.',
      price: 150000,
      status: 'COMPLETED',
      acceptedAt: new Date('2026-06-02'),
      startedAt: new Date('2026-06-02'),
      deliveredAt: new Date('2026-06-10'),
      completedAt: new Date('2026-06-12'),
    },
  });
  await prisma.transaction.create({
    data: {
      userId: rafa.id,
      contractId: completed.id,
      type: 'EARNING',
      amount: 150000,
      status: 'COMPLETED',
      description: 'Ganho concluído · Criação de identidade visual',
    },
  });
  await prisma.review.create({
    data: {
      contractId: completed.id,
      clientId: carla.id,
      freelancerId: rafa.id,
      rating: 5,
      comment: 'Entrega clara e no prazo. A marca ficou redonda.',
    },
  });

  const inProgress = await prisma.contract.create({
    data: {
      clientId: pedro.id,
      freelancerId: sofia.id,
      serviceId: serviceMap['sofia.ux:UI de aplicativo'].id,
      kind: 'HIRE',
      title: 'UI de aplicativo',
      description: 'Telas do app de pedidos.',
      price: 180000,
      status: 'IN_PROGRESS',
      acceptedAt: new Date(),
      startedAt: new Date(),
    },
  });
  await prisma.transaction.create({
    data: {
      userId: sofia.id,
      contractId: inProgress.id,
      type: 'PENDING',
      amount: 180000,
      status: 'PENDING',
      description: 'Ganho previsto · UI de aplicativo',
    },
  });

  await prisma.contract.create({
    data: {
      clientId: bruno.id,
      freelancerId: marina.id,
      serviceId: landing.id,
      kind: 'QUOTE',
      title: 'Sistema administrativo com painel financeiro',
      description: 'Quero um sistema administrativo parecido, mas com painel financeiro.',
      budgetHint: 400000,
      status: 'REQUESTED',
    },
  });

  const conv = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: bruno.id }, { userId: marina.id }] },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conv.id, senderId: bruno.id, content: 'Olá, gostaria de conversar sobre esse projeto.', createdAt: new Date(Date.now() - 3600_000) },
      { conversationId: conv.id, senderId: marina.id, content: 'Oi, Bruno. Pode me contar o prazo e o que já existe hoje?', createdAt: new Date(Date.now() - 1800_000) },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: marina.id, actorId: bruno.id, type: 'JOB_REQUEST', entityId: landing.id },
      { userId: marina.id, actorId: bruno.id, type: 'MESSAGE', entityId: conv.id },
      { userId: marina.id, actorId: bruno.id, type: 'FOLLOW', entityId: marina.id },
      { userId: rafa.id, actorId: carla.id, type: 'REVIEW', entityId: completed.id },
      { userId: sofia.id, actorId: pedro.id, type: 'JOB_ACCEPTED', entityId: inProgress.id },
    ],
  });

  console.log('Seed concluído.');
  console.log('Demo freelancer: marina@nidus.dev / nidus123');
  console.log('Demo cliente: bruno@nidus.dev / nidus123');
  console.log('Contas migradas: Near, aaaaaaaa, buchholz');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
