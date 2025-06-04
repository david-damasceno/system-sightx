
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Configurações do CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// URL e chave da API do Azure OpenAI
const AZURE_OPENAI_ENDPOINT = "https://sistema-sightx.openai.azure.com";
const AZURE_OPENAI_API_KEY = Deno.env.get("AZURE_OPENAI_API_KEY");
const AZURE_OPENAI_MODEL = "gpt-4o-mini";
const API_VERSION = "2025-01-01-preview";

// URL do endpoint para chamadas de chat
const chatApiUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${API_VERSION}`;

serve(async (req) => {
  // Lidar com solicitações de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se a chave da API está configurada
    if (!AZURE_OPENAI_API_KEY) {
      console.error("Erro: AZURE_OPENAI_API_KEY não está configurada");
      return new Response(
        JSON.stringify({ 
          message: "A configuração do sistema ainda está em andamento. Por favor, tente novamente em alguns instantes." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extrair dados da solicitação
    const requestData = await req.json();
    const { messages, userMode, tenantId, stream = false, improveMessage = false } = requestData;

    // Log para debugar
    console.log(`Recebendo requisição para tenant: ${tenantId || 'default'}, modo: ${userMode}, melhoria: ${improveMessage}`);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Erro: Formato de mensagens inválido", { messages });
      return new Response(
        JSON.stringify({ 
          message: "Não foi possível processar sua mensagem devido a um formato inválido. Por favor, tente novamente." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determinar o sistema prompt baseado no tipo de solicitação
    let systemPrompt;
    
    if (improveMessage) {
      systemPrompt = `Você é um especialista em comunicação empresarial do SightX. Sua função é melhorar mensagens para torná-las mais claras, profissionais e eficazes para o contexto de negócios.

Diretrizes para melhoria:
- Torne a linguagem mais formal e profissional
- Adicione clareza e especificidade
- Estruture melhor as ideias
- Mantenha o sentido original da mensagem
- Use terminologia apropriada para análise de dados e business intelligence
- Retorne APENAS a mensagem melhorada, sem explicações adicionais`;
    } else {
      systemPrompt = "Você é um assistente de IA especializado em negócios do SightX. Você oferece respostas profissionais e objetivas, com ênfase em dados e análises comerciais. Use linguagem formal e forneça insights orientados a negócios, sempre focando em como transformar dados em decisões estratégicas.";
    }

    // Preparar as mensagens para a API do Azure OpenAI
    let formattedMessages;
    
    if (improveMessage) {
      // Para melhoria de mensagem, enviar apenas a última mensagem do usuário
      const lastUserMessage = messages[messages.length - 1];
      formattedMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Melhore esta mensagem: "${lastUserMessage.content}"` }
      ];
      console.log("Processando melhoria de mensagem:", lastUserMessage.content);
    } else {
      formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.isAI ? "assistant" : "user",
          content: msg.content,
        })),
      ];
    }

    // Debug log
    console.log("Enviando para Azure OpenAI:", {
      url: chatApiUrl,
      model: AZURE_OPENAI_MODEL,
      messageCount: formattedMessages.length,
      stream: stream,
      tenantId: tenantId || 'default',
      improveMessage: improveMessage
    });

    // Configurar a solicitação para a API do Azure OpenAI com otimizações
    const openaiRequestBody = {
      messages: formattedMessages,
      temperature: improveMessage ? 0.3 : (userMode === "business" ? 0.3 : 0.7),
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      max_tokens: improveMessage ? 500 : 2048,
      stream: false, // Sempre false para melhoria de mensagem
    };

    // Fazer a solicitação para a API do Azure OpenAI
    const openaiResponse = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify(openaiRequestBody),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("Erro na API do Azure OpenAI:", errorData);
      return new Response(
        JSON.stringify({ 
          message: "Desculpe, não foi possível conectar com os servidores de IA neste momento. Por favor, tente novamente mais tarde." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Processar resposta (sempre não-streaming para melhorias e chat normal para agora)
    const data = await openaiResponse.json();
    console.log("Resposta da Azure OpenAI recebida:", {
      status: openaiResponse.status,
      hasChoices: data.choices && data.choices.length > 0,
      tenantId: tenantId || 'default',
      improveMessage: improveMessage
    });

    if (!data.choices || data.choices.length === 0) {
      console.error("Resposta sem choices:", data);
      return new Response(
        JSON.stringify({ 
          message: "O serviço de IA não retornou uma resposta válida. Por favor, tente novamente." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiMessage = data.choices[0].message.content;
    
    if (improveMessage) {
      console.log("Mensagem melhorada:", aiMessage);
    } else {
      console.log("Mensagem da IA:", aiMessage.substring(0, 100) + "...");
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Erro na função azure-openai-chat:", error);
    return new Response(
      JSON.stringify({ 
        message: "Ocorreu um erro inesperado. Estamos trabalhando para resolver o problema. Por favor, tente novamente em alguns instantes." 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
