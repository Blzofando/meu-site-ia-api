// =================================================================
// API FINAL COMPLETA - Roteiro e Prompts de Imagem
// =================================================================

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// --- Configuração do Servidor ---
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

// --- Inicialização da IA ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// =================================================================
// FUNÇÕES DE PROMPT (Nossas "Receitas")
// =================================================================

// Função de Prompt para gerar ROTEIROS
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
**TAKE 1**
[Texto da narração impactante aqui]

**TAKE 2**
[Texto da narração]
... e assim por diante.

[INPUT DO USUÁRIO]
O tema do vídeo é: "${temaDoUsuario}"

[AÇÃO]
Gere o roteiro seguindo TODAS as regras acima, escolhendo o cenário mais apropriado para o tema.`;
};

// Função de Prompt para gerar PROMPTS DE IMAGEM
const getImageMasterPrompt = (roteiro) => {
  return `[TAREFA]
Sua tarefa é atuar como um diretor de arte e gerar prompts de imagem detalhados para a plataforma Midjourney, baseados no roteiro de vídeo fornecido.

[REGRAS DE GERAÇÃO]
1.  Para cada "TAKE" do roteiro, você deve criar exatamente 3 prompts de imagem distintos, explorando diferentes cenas, personagens ou elementos descritos no take.
2.  Cada prompt deve descrever claramente o ambiente, personagens, cores, iluminação e atmosfera, com foco em detalhes que transmitam mistério, tensão e um clima histórico sombrio.
3.  NÃO adicione o sufixo de estilo no final de cada prompt. O sufixo será adicionado separadamente pelo usuário. Apenas gere a descrição da cena.

[ROTEIRO FORNECIDO]
${roteiro}

[FORMATO DE SAÍDA OBRIGATÓRIO]
Responda estritamente no seguinte formato, sem nenhuma introdução ou texto adicional:
Take 1 — [descrição geral e bem resumida do take em uma linha]
— Prompt 1: [descrição detalhada do primeiro prompt]
— Prompt 2: [descrição detalhada do segundo prompt]
— Prompt 3: [descrição detalhada do terceiro prompt]
Take 2 — [descrição geral e bem resumida do take em uma linha]
— Prompt 1: [descrição detalhada do primeiro prompt]
— Prompt 2: [descrição detalhada do segundo prompt]
— Prompt 3: [descrição detalhada do terceiro prompt]
...e assim por diante para todos os takes.`;
};


// =================================================================
// ENDPOINTS DA API (Nossos "Guichês de Atendimento")
// =================================================================

// Endpoint para gerar ROTEIRO
app.post('/api/generate-roteiro', async (req, res) => {
  console.log('Recebido pedido para /api/generate-roteiro');
  try {
    const { tema } = req.body;
    if (!tema) return res.status(400).json({ error: 'O tema é obrigatório.' });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = getMasterPrompt(tema);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ roteiro: text });
  } catch (error) {
    console.error("Erro ao gerar roteiro:", error);
    res.status(500).json({ error: 'Erro ao gerar o roteiro.' });
  }
});

// Endpoint para gerar PROMPTS DE IMAGEM
app.post('/api/generate-image-prompts', async (req, res) => {
  console.log('Recebido pedido para /api/generate-image-prompts');
  try {
    const { roteiro } = req.body;
    if (!roteiro) {
      return res.status(400).json({ error: 'O roteiro é obrigatório.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = getImageMasterPrompt(roteiro);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ prompts: text });

  } catch (error) {
    console.error("Erro ao gerar prompts de imagem:", error);
    res.status(500).json({ error: 'Erro ao gerar os prompts de imagem.' });
  }
});


// --- Iniciar o Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
