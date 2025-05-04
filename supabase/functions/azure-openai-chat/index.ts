
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
      return new Response(
        JSON.stringify({ error: "A chave da API do Azure OpenAI não está configurada" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar cliente Supabase para acessar dados autenticados
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extrair dados da solicitação
    const requestData = await req.json();
    const { messages, userMode, stream = false } = requestData;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Formato de mensagens inválido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determinar o sistema prompt baseado no modo do usuário
    const systemPrompt = userMode === "business"
      ? "Você é um assistente de IA focado em negócios do SightX. Você oferece respostas profissionais e objetivas, com ênfase em dados e análises comerciais. Use linguagem formal e forneça insights orientados a negócios."
      : "Você é um assistente de IA amigável do SightX. Você oferece respostas úteis e conversacionais, adaptadas para uso pessoal. Use linguagem casual mas respeitosa e mantenha um tom cordial.";

    // Preparar as mensagens para a API do Azure OpenAI
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.isAI ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    // Configurar a solicitação para a API do Azure OpenAI
    const openaiRequestBody = {
      messages: formattedMessages,
      temperature: userMode === "business" ? 0.3 : 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 2048,
      stream: stream,
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
        JSON.stringify({ error: "Erro ao comunicar com Azure OpenAI", details: errorData }),
        {
          status: openaiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Se estivermos usando streaming, passe o stream diretamente para o cliente
    if (stream) {
      // Transformar o stream da Azure API para o formato esperado pelo cliente
      const transformedStream = new TransformStream();
      const writer = transformedStream.writable.getWriter();
      
      // Processar o stream da API do Azure
      const reader = openaiResponse.body?.getReader();
      if (!reader) {
        throw new Error("Stream não disponível na resposta");
      }

      // Função para processar o stream
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              await writer.close();
              break;
            }
            
            // Decodificar os chunks e enviar para o cliente
            const chunk = new TextDecoder().decode(value);
            await writer.write(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          console.error("Erro ao processar stream:", error);
          await writer.abort(error);
        }
      })();

      return new Response(transformedStream.readable, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } else {
      // Modo não-streaming: retorna a resposta completa
      const data = await openaiResponse.json();
      const aiMessage = data.choices[0].message.content;

      return new Response(
        JSON.stringify({ message: aiMessage }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
  } catch (error) {
    console.error("Erro na função azure-openai-chat:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
