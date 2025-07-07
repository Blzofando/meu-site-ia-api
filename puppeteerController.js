import puppeteer from 'puppeteer';

const gerarAudioAutomatizado = async (texto) => {
  try {
    // Inicializa o navegador Puppeteer
    const browser = await puppeteer.launch({ headless: false });  // Modo visual para depuração
    const page = await browser.newPage();

    // Acessa o Google AI Studio
    await page.goto('https://aistudio.google.com/generate-speech');

    // **Seleciona a modalidade de áudio (single-speaker audio) primeiro**
    await page.select('select[name="mode"]', 'single-speaker-audio');  // Certifique-se de que esse seja o nome correto da opção no site

    // Preenche o campo de texto com o conteúdo que foi enviado
    await page.type('textarea[name="text"]', texto);

    // Define a voz para "Enceladus"
    await page.select('select[name="voice"]', 'Enceladus');  // Ajuste conforme o nome exato da voz

    // Preenche a instrução de estilo
    const styleInstruction = "Narre o texto abaixo com voz jovem, envolvente e expressiva. Use tom de surpresa e curiosidade nos takes, variando a intensidade para destacar o absurdo das situações. Comece com energia e entusiasmo no hook da introdução e termine de forma descontraída, incentivando a participação do público no encerramento.";

    // Adiciona as instruções de estilo antes do texto
    await page.type('textarea[name="style_instructions"]', styleInstruction);

    // Clica no botão para gerar áudio
    await page.click('button[type="submit"]');  // Ajuste o seletor do botão conforme necessário

    // Espera um indicador que o áudio foi gerado (pode ser um elemento ou uma mudança na página)
    await page.waitForSelector('.result');  // Espera um elemento específico aparecer

    // Retorna uma resposta indicando sucesso
    return 'Áudio gerado com sucesso!';
  } catch (error) {
    console.error('Erro ao gerar áudio:', error);
    throw new Error('Erro ao gerar áudio com Puppeteer');
  }
};

export { gerarAudioAutomatizado };
