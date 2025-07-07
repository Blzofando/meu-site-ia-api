// 1. Importar as ferramentas necessárias
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config'; // Importa o dotenv para carregar variáveis de ambiente

// 2. Configurar o servidor Express
const app = express();
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(cors()); // Habilita o CORS para aceitar requisições do nosso site

const port = process.env.PORT || 3000;

// 3. Inicializar o cliente da IA do Google
// O process.env.GOOGLE_API_KEY virá do nosso arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Função que monta o nosso prompt (a mesma de antes)
const getMasterPrompt = (temaDoUsuario) => {
  return `[INSTRUÇÃO SISTEMA]
Você é um roteirista mestre, especializado em criar conteúdo sombrio, curioso e visualmente impactante para vídeos verticais (TikTok, Shorts, Reels). Seu conhecimento abrange fatos históricos perturbadores, bizarrices culturais e os segredos mais bem guardados da humanidade.

[TAREFA]
Sua tarefa é criar um roteiro curto e cinematográfico baseado no tema fornecido pelo usuário. O roteiro deve ter aproximadamente 150 palavras, resultando em uma duração de 45 a 60 segundos.

[ESTILO E TOM OBRIGATÓRIOS]
O tom deve ser sempre macabro, misterioso, intrigante e quase teatral. Trate cada história como uma peça descoberta em um museu proibido, explorando o lado bizarro, insano ou cruel da história da humanidade.

[ESTRUTURA CONDICIONAL OBRIGATÓRIA]
Primeiro, analise o tema do usuário. Se ele se parece mais com um tópico único e profundo, use o "Cenário 1". Se parece com um tema que abrange múltiplos fatos rápidos, use o "Cenário 2".

* Cenário 1: Curiosidade Única (6 Takes)
    * Take 1: Introdução com um gancho forte (hook). Use expressões como: “Você sabia que…”, “O que parecia inofensivo…”, “Isso realmente aconteceu…”.
    * Takes 2 a 5: Desenvolvimento do tema em 4 partes, com detalhes, contextos e consequências.
    * Take 6: Encerramento reflexivo e perturbador que instigue comentários.
    * Cada take deve conter 2 a 3 frases curtas, narradas de forma pausada e dramática.

* Cenário 2: Lista de Curiosidades (7 Takes)
    * Take 1: Introdução geral ao tema.
    * Takes 2 a 6: Cada take apresenta uma curiosidade diferente sobre o tema.
    * Take 7: Encerramento que amarra as curiosidades e deixa uma impressão forte.

[EXEMPLO DE FORMATAÇÃO DA RESPOSTA]
**TAKE 1** - [Descrição da cena 2D sombria aqui]
[Texto da narração impactante aqui]

**TAKE 2** - [Descrição da próxima cena imersiva]
[Texto da narração]
... e assim por diante.

[INPUT DO USUÁRIO]
O tema do vídeo é: "${temaDoUsuario}"

[AÇÃO]
Gere o roteiro seguindo TODAS as regras acima, escolhendo o cenário mais apropriado para o tema.`;
};

// 4. Criar o nosso endpoint (a "porta" da nossa API)
app.post('/api/generate-roteiro', async (req, res) => {
  console.log('Recebido pedido para /api/generate-roteiro');
  try {
    const { tema } = req.body;
    if (!tema) {
      return res.status(400).json({ error: 'O tema é obrigatório.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = getMasterPrompt(tema);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Devolve o roteiro com sucesso
    res.status(200).json({ roteiro: text });

  } catch (error) {
    console.error("Erro detalhado na API:", error);
    res.status(500).json({ error: 'Erro ao gerar o roteiro.' });
  }
});

// 5. Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  // --- ADICIONE ESTA LINHA DE DEBUG ---
  console.log("Chave carregada do .env:", process.env.GOOGLE_API_KEY ? `...${process.env.GOOGLE_API_KEY.slice(-4)}` : "NÃO FOI CARREGADA");
});