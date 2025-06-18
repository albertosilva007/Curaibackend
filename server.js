// backend/server.js
const express = require('express');
const cors = require('cors'); // Para permitir requisições do frontend
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Configurar o CORS para permitir requisições do seu frontend (se rodar em domínios diferentes)
// Para desenvolvimento, '*' é aceitável, mas em produção, especifique o domínio do seu frontend.
app.use(cors());
app.use(express.json()); // Para parsear o corpo das requisições JSON

// Configuração da API Gemini
// Substitua '' pela sua chave de API se não estiver no ambiente Canvas.
// No ambiente Canvas, a chave é injetada automaticamente, então deixe como está.
const API_KEY = "AIzaSyDYv-rAyQqtnpMMzgNFfGxNZ1zNXcsO1oM";

const genAI = new GoogleGenerativeAI(API_KEY);

// Inicializar o modelo Gemini
// Usamos gemini-2.0-flash para velocidade e bom desempenho
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Endpoint para o chat
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Mensagem vazia.' });
    }

    try {
        let botResponseText = '';
        let quickReplies = [];

        // --- Lógica de Respostas Pré-definidas e Éticas (Primeira Camada de Tratamento) ---
        // Priorize a segurança e a ética, especialmente para psicologia.

        // Fluxo de Emergência (palavras-chave sensíveis)
        const emergencyKeywords = ['suicida', 'não aguento mais', 'desesperado', 'crise', 'ajuda urgente', 'quero morrer', 'automutilação'];
        const isEmergency = emergencyKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

        if (isEmergency) {
            botResponseText = "Sinto muito que você esteja passando por um momento tão difícil. Eu sou um assistente virtual e não estou preparado para lidar com situações de emergência ou crise psicológica. É muito importante que você procure ajuda profissional agora mesmo.\n\nPor favor, entre em contato imediatamente com o **CVV (Centro de Valorização da Vida) pelo telefone 188** (ligação gratuita e confidencial), ou dirija-se ao pronto-socorro mais próximo. Sua vida importa, procure ajuda.";
            quickReplies = ['Ligar para CVV (188)', 'Voltar ao Menu Principal']; // Exemplo de quick replies para emergência
        }
        // Fluxo de Saudação / Introdução (resposta ao "Olá", "Oi")
        else if (userMessage.toLowerCase().includes('olá') || userMessage.toLowerCase().includes('oi') || userMessage.toLowerCase().includes('tudo bem')) {
            botResponseText = "Olá! Eu sou o assistente virtual da Conexão Mente e Ser - Atendimento Psicológico aqui em Jaboatão dos Guararapes. Meu objetivo é te ajudar com informações e agendamentos de forma rápida. É importante saber que eu sou um programa de computador e não um psicólogo. Não faço diagnósticos e não ofereço terapia.\n\nComo posso te ajudar hoje?";
            quickReplies = ['Agendar Consulta', 'Perguntas Frequentes', 'Falar com um Humano'];
        }
        // Fluxo de Perguntas Frequentes (FAQs)
        else if (userMessage.toLowerCase().includes('pergunta frequente') || userMessage.toLowerCase().includes('faq') || userMessage.toLowerCase().includes('duvida')) {
            botResponseText = "Ótimo! Tenho informações sobre alguns tópicos. Qual deles você gostaria de saber?";
            quickReplies = ['Endereço e Horário', 'Nossas Especialidades', 'Convênios e Valores', 'Como é a 1ª Sessão?', 'O que é Psicologia?', 'Voltar ao Menu Principal'];
        }
        else if (userMessage.toLowerCase().includes('endereço') || userMessage.toLowerCase().includes('horario')) {
            botResponseText = "A Conexão Mente e Ser fica na [Endereço completo em Jaboatão dos Guararapes, PE]. Nosso horário de funcionamento é de Segunda a Sexta, das 8h às 18h e Sábado, das 9h às 13h. Temos atendimento online também!";
            quickReplies = ['Agendar Consulta', 'Outra Pergunta'];
        }
        else if (userMessage.toLowerCase().includes('especialidade') || userMessage.toLowerCase().includes('atendimento')) {
            botResponseText = "Na Conexão Mente e Ser, contamos com psicólogos experientes em diversas abordagens, como Terapia Cognitivo-Comportamental (TCC), Terapia Familiar, Terapia de Casal, Psicologia Infantil e Atendimento a Adolescentes e Adultos. Temos profissionais para te atender!";
            quickReplies = ['Agendar Consulta', 'Outra Pergunta'];
        }
        else if (userMessage.toLowerCase().includes('convenio') || userMessage.toLowerCase().includes('valor') || userMessage.toLowerCase().includes('preco')) {
            botResponseText = "Aceitamos os convênios [Lista de Convênios, ex: Bradesco Saúde, SulAmérica, etc.]. Para outros planos ou para informações sobre os valores das sessões particulares, por favor, me informe seu nome e telefone para que um de nossos atendentes possa te retornar.";
            quickReplies = ['Quero um Retorno', 'Outra Pergunta'];
        }
        else if (userMessage.toLowerCase().includes('primeira sessao') || userMessage.toLowerCase().includes('primeira consulta')) {
            botResponseText = "A primeira sessão é um momento para você e o psicólogo se conhecerem. É onde vocês conversam sobre suas necessidades, expectativas e sobre como a terapia pode te ajudar. Não se preocupe, é um espaço acolhedor e confidencial.";
            quickReplies = ['Quero Agendar', 'Outra Pergunta'];
        }
        else if (userMessage.toLowerCase().includes('o que e psicologia') || userMessage.toLowerCase().includes('o que e terapia')) {
            botResponseText = "A psicologia é a ciência que estuda o comportamento e os processos mentais. A terapia, por sua vez, é um espaço de cuidado onde, junto a um profissional, você pode explorar seus sentimentos, pensamentos e desenvolver ferramentas para lidar com desafios da vida.";
            quickReplies = ['Quero Agendar', 'Outra Pergunta'];
        }
        // Fluxo de Agendamento
        else if (userMessage.toLowerCase().includes('agendar') || userMessage.toLowerCase().includes('marcar') || userMessage.toLowerCase().includes('consulta')) {
            botResponseText = "Certo! Para agendarmos, preciso de algumas informações. Você é um paciente novo ou já faz acompanhamento conosco?";
            quickReplies = ['Sou Paciente Novo', 'Já sou Paciente'];
        }
        else if (userMessage.toLowerCase().includes('sou paciente novo')) {
            botResponseText = "Que bom ter você aqui! Para sua primeira consulta, você tem preferência por algum psicólogo ou especialidade? Ou gostaria de agendar com o profissional com a próxima disponibilidade?";
            quickReplies = ['Tenho Preferência', 'Próxima Disponibilidade'];
        }
        else if (userMessage.toLowerCase().includes('ja sou paciente')) {
            botResponseText = "Bem-vindo(a) de volta! Você deseja agendar um retorno, reagendar ou cancelar uma consulta existente?";
            quickReplies = ['Agendar Retorno', 'Reagendar/Cancelar'];
        }
        else if (userMessage.toLowerCase().includes('falar com um humano') || userMessage.toLowerCase().includes('atendente') || userMessage.toLowerCase().includes('falar com alguem')) {
            botResponseText = "Entendi que você gostaria de falar com um de nossos atendentes. Posso direcionar sua conversa para a equipe da Conexão Mente e Ser. Qual o seu nome completo e o motivo do seu contato, por favor?";
            // Nota: Aqui, em uma aplicação real, você coletaria os dados e talvez enviaria para um CRM ou fila de atendimento humano.
        }
        // --- Fim da Lógica de Respostas Pré-definidas ---

        // Se nenhuma lógica pré-definida for acionada, use a API Gemini
        if (!botResponseText) {
            const chat = model.startChat({
                history: [
                    // Contexto inicial para o Gemini (pode ser expandido)
                    {
                        role: "user",
                        parts: [{ text: "Você é um assistente virtual para uma clínica de psicologia chamada 'Conexão Mente e Ser' em Jaboatão dos Guararapes, PE. Sua função é responder a perguntas frequentes e auxiliar no agendamento de consultas. É CRÍTICO que você NUNCA faça diagnósticos, NUNCA ofereça terapia ou aconselhamento, e NUNCA substitua um psicólogo. Sempre direcione para um profissional em caso de dúvidas complexas ou situações de crise. Seja empático, claro e profissional." }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Compreendido. Estou pronto para ajudar com informações e agendamentos, mantendo sempre a ética e direcionando para o apoio profissional quando necessário." }],
                    },
                    // Adicione o histórico da conversa aqui para manter o contexto
                    // Por simplicidade neste exemplo, estamos enviando apenas a última mensagem do usuário.
                    // Em um chatbot real, você passaria todo o histórico para o Gemini.
                ],
                generationConfig: {
                    maxOutputTokens: 200, // Limite para respostas concisas
                },
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            botResponseText = response.text();

            // Mensagem de fallback caso Gemini não entenda ou para encorajar opções
            if (!botResponseText || botResponseText.includes("não consigo ajudar com isso") || botResponseText.includes("desculpe")) {
                botResponseText = "Desculpe, não entendi o que você quis dizer ou não tenho informações sobre isso. Posso te ajudar com agendamento, informações sobre o processo terapêutico ou dúvidas administrativas. Se preferir, posso te conectar com um atendente humano.";
                quickReplies = ['Agendar Consulta', 'Perguntas Frequentes', 'Falar com um Humano'];
            }
        }

        // Retorna a resposta do bot para o frontend
        res.json({ text: botResponseText, quickReplies: quickReplies });

    } catch (error) {
        console.error('Erro ao chamar a API Gemini ou processar:', error);
        res.status(500).json({
            error: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
            text: 'Desculpe, tive um problema técnico. Por favor, tente novamente mais tarde.'
        });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Backend do chatbot rodando em http://localhost:${port}`);
    console.log(`Para usar, certifique-se de que o frontend está acessando http://localhost:${port}/chat`);
});

