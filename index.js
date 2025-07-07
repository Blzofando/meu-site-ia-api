// =================================================================
// 1. IMPORTAÇÕES - Trazendo nossas ferramentas
// =================================================================
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// =================================================================
// 2. CONFIGURAÇÃO DO SERVIDOR - Preparando a "cozinha"
// =================================================================
const app = express();
app.use(express.json()); // Permite que o servidor entenda o formato JSON
app.use(cors()); // Habilita o CORS para aceitar requisições do nosso site na Netlify
const port = process.env.PORT || 3000;

// =================================================================
// 3. INICIALIZAÇÃO DA IA - Conectando com o Google
// =================================================================
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// =================================================================
// 4. FUNÇÃO DE PROMPT - A "receita" para os roteiros
// =================================================================
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


// =================================================================
// 5. ENDPOINTS DA API - As "portas de atendimento"
// =================================================================

// Endpoint para gerar ROTEIRO
app.post('/api/generate-roteiro', async (req, res) => {
  console.log('Recebido pedido para gerar roteiro');
  try {
    const { tema } = req.body;
    if (!tema) return res.status(400).json({ error: 'O tema é obrigatório.' });

    // Modelo para gerar TEXTO
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


// Endpoint para gerar ÁUDIO
app.post('/api/generate-audio', async (req, res) => {
  console.log('Recebido pedido para gerar áudio com o modelo TTS oficial');
  try {
    const { texto } = req.body;
    if (!texto) {
      return res.status(400).json({ error: 'O texto do roteiro é obrigatório.' });
    }

    // Modelo especialista em TEXTO-PARA-FALA (Text-to-Speech)
    const model = genAI.getGenerativeModel({ model: "tts-1-hd" });

    const styleInstruction = "Narre com voz jovem, envolvente e expressiva. Use tom de surpresa e curiosidade, variando a intensidade para destacar o absurdo. Comece com energia e termine de forma descontraída.";
    const fullTextToSynthesize = `${styleInstruction}. O texto a ser narrado é: ${texto}`;
    
    console.log("Enviando pedido para o modelo tts-1-hd com a voz: enceladus...");
    
    const result = await model.generateContent({
      text: fullTextToSynthesize,
      voice: "enceladus",
    });

    const audioBase64 = result.response.candidates[0].content.parts[0].inlineData.data;
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    console.log("Áudio recebido com sucesso!");

    // Envia o áudio como um arquivo MP3 (o padrão deste modelo)
    res.set('Content-Type', 'audio/mp3');
    res.send(audioBuffer);

  } catch (error) {
    console.error("Erro detalhado na geração de áudio:", error);
    res.status(500).json({ error: 'Erro ao gerar o áudio.' });
  }
});


// =================================================================
// 6. INICIAR O SERVIDOR - "Abrindo a cozinha para negócios"
// =================================================================
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});