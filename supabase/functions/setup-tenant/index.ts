
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuração dos headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para configurar o Storage para um novo tenant
async function setupStorage(supabaseClient, schemaName) {
  console.log(`Configurando Storage para o schema: ${schemaName}`);
  
  try {
    // Verificar se o bucket já existe
    const { data: existingBuckets, error: checkError } = await supabaseClient
      .storage
      .listBuckets();
      
    if (checkError) {
      console.error(`Erro ao verificar buckets existentes: ${checkError.message}`);
      throw checkError;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === schemaName);
    
    if (!bucketExists) {
      // Criar uma pasta para o tenant apenas se não existir
      const { error: storageError } = await supabaseClient
        .storage
        .createBucket(schemaName, {
          public: false
        });
      
      if (storageError) {
        console.error(`Erro ao criar bucket de storage: ${storageError.message}`);
        throw storageError;
      }
      
      console.log(`Bucket de storage criado com sucesso: ${schemaName}`);
    } else {
      console.log(`Bucket de storage já existe: ${schemaName}`);
    }
    
    // Atualizar o registro do tenant com a referência da pasta
    const { error: updateError } = await supabaseClient
      .from('tenants')
      .update({ storage_folder: schemaName })
      .eq('schema_name', schemaName);
    
    if (updateError) {
      console.error(`Erro ao atualizar registro do tenant: ${updateError.message}`);
      throw updateError;
    }
    
    console.log(`Storage configurado com sucesso para ${schemaName}`);
    return { success: true, folder: schemaName };
  } catch (error) {
    console.error(`Erro ao configurar Storage: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para verificar se um destination já existe no Airbyte
async function checkExistingDestination(airbyteUrl, authHeaders, workspaceId, destinationName) {
  console.log(`Verificando se destination "${destinationName}" já existe no Airbyte...`);
  
  try {
    // Endpoint correto para Airbyte API v1
    const endpoint = `${airbyteUrl}/api/v1/destinations/list`;
    
    console.log(`Chamando endpoint Airbyte: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ workspaceId }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Airbyte retornou status ${response.status}: ${errorText}`);
      return { exists: false, error: `API retornou status ${response.status}` };
    }
    
    const data = await response.json();
    console.log(`Resposta da API Airbyte: ${JSON.stringify(data)}`);
    
    // Verificar diferentes formatos de resposta
    const destinations = data.destinations || [];
    
    if (!Array.isArray(destinations)) {
      console.log(`Formato de resposta inesperado do Airbyte`);
      return { exists: false, error: "Formato de resposta inesperado" };
    }
    
    // Procurar pelo destination pelo nome
    const existingDestination = destinations.find(d => 
      d.name === destinationName || 
      (d.destination && d.destination.name === destinationName)
    );
    
    if (existingDestination) {
      console.log(`Destination "${destinationName}" já existe!`);
      // Extrair o ID do destination conforme o formato da resposta
      const destinationId = existingDestination.destinationId || 
                          existingDestination.id || 
                          (existingDestination.destination && existingDestination.destination.destinationId);
      
      if (destinationId) {
        return { exists: true, destinationId };
      }
    }
    
    // Se chegamos aqui, a listagem funcionou mas não encontramos o destination
    console.log(`Destination "${destinationName}" não encontrado na lista.`);
    return { exists: false };
    
  } catch (error) {
    console.error(`Erro ao verificar destination existente: ${error.message}`);
    return { exists: false, error: error.message };
  }
}

// Função para configurar o Airbyte Destination para um novo tenant
async function setupAirbyteDestination(schemaName) {
  console.log(`Configurando Airbyte Destination para o schema: ${schemaName}`);
  
  try {
    const airbyteUrl = Deno.env.get("AIRBYTE_API_URL");
    if (!airbyteUrl) {
      throw new Error("URL da API do Airbyte não configurada");
    }
    
    // Verificar e normalizar a URL do Airbyte
    const apiUrl = airbyteUrl.trim().replace(/\/$/, ""); // Remove espaços e barra final
    console.log(`URL da API do Airbyte normalizada: ${apiUrl}`);
    
    const airbyteWorkspaceId = Deno.env.get("AIRBYTE_WORKSPACE_ID");
    const airbyteUsername = Deno.env.get("AIRBYTE_USERNAME");
    const airbytePassword = Deno.env.get("AIRBYTE_PASSWORD");
    
    if (!airbyteWorkspaceId || !airbyteUsername || !airbytePassword) {
      throw new Error("Credenciais do Airbyte não configuradas corretamente");
    }
    
    console.log(`Workspace ID: ${airbyteWorkspaceId}`);
    
    const destinationName = `destino-sightx-${schemaName}`;
    
    // Formatando credenciais para Basic Auth
    const authString = `${airbyteUsername}:${airbytePassword}`;
    const base64Auth = btoa(authString);
    
    // Configuração para autenticação Basic
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${base64Auth}`
    };
    
    console.log("Headers de autenticação configurados");
    
    // Primeiro, verificar se o destination já existe
    const existingCheck = await checkExistingDestination(
      apiUrl, 
      headers, 
      airbyteWorkspaceId, 
      destinationName
    );
    
    if (existingCheck.exists && existingCheck.destinationId) {
      console.log(`Destination já existe com ID: ${existingCheck.destinationId}. Reutilizando.`);
      return {
        success: true,
        destinationId: existingCheck.destinationId,
        destinationName: destinationName,
        message: "Destination existente reutilizado"
      };
    }
    
    // Configuração da conexão PostgreSQL para o Airbyte
    // Para o Airbyte OSS, o destinationDefinitionId para PostgreSQL
    const destinationDefinitionId = "25c5221d-dce2-4163-ade9-739ef790f503"; // ID padrão para PostgreSQL no Airbyte
    
    // Verificar se todos os parâmetros do banco de dados estão presentes
    const requiredParams = ["POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD"];
    for (const param of requiredParams) {
      if (!Deno.env.get(param)) {
        throw new Error(`Parâmetro ${param} não configurado`);
      }
    }
    
    // Payload para criar o destination
    const payload = {
      workspaceId: airbyteWorkspaceId,
      name: destinationName,
      destinationDefinitionId: destinationDefinitionId,
      connectionConfiguration: {
        host: Deno.env.get("POSTGRES_HOST"),
        port: parseInt(Deno.env.get("POSTGRES_PORT") || "5432"),
        database: Deno.env.get("POSTGRES_DB"),
        username: Deno.env.get("POSTGRES_USER"),
        password: Deno.env.get("POSTGRES_PASSWORD"),
        schema: schemaName,
        ssl_mode: {
          mode: "allow"
        }
      }
    };
    
    console.log(`Payload do destination preparado`);
    
    // Testar conectividade com Airbyte antes de fazer a chamada principal
    try {
      const healthCheckUrl = `${apiUrl}/health`;
      console.log(`Testando conectividade com Airbyte em: ${healthCheckUrl}`);
      
      const testResponse = await fetch(healthCheckUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      
      console.log(`Teste de saúde do Airbyte: ${testResponse.status} ${testResponse.statusText}`);
      
      if (!testResponse.ok) {
        const testBody = await testResponse.text();
        console.error(`Erro no teste de saúde do Airbyte: ${testBody}`);
      }
    } catch (healthError) {
      console.error(`Erro ao testar conectividade com Airbyte: ${healthError.message}`);
      // Continuamos mesmo com erro no health check
    }
    
    // Endpoint para criar destination
    const createEndpoint = `${apiUrl}/api/v1/destinations/create`;
    console.log(`Criando destination em: ${createEndpoint}`);
    
    try {
      const response = await fetch(createEndpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });
      
      console.log(`Resposta do Airbyte: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro ao criar destination (${response.status}): ${errorText}`);
        throw new Error(`Erro ao criar destination: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log(`Destination criado com sucesso: ${JSON.stringify(responseData, null, 2)}`);
      
      // Extrair o ID do destination de acordo com a estrutura de resposta
      const destinationId = responseData.destinationId || 
                           responseData.id || 
                           (responseData.destination && responseData.destination.destinationId);
      
      if (!destinationId) {
        throw new Error("ID do destination não encontrado na resposta");
      }
      
      return {
        success: true,
        destinationId: destinationId,
        destinationName: destinationName
      };
    } catch (fetchError) {
      console.error(`Erro ao chamar API Airbyte: ${fetchError.message}`);
      throw fetchError;
    }
  } catch (error) {
    console.error(`Erro ao configurar Airbyte: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para ativar o schema e storage do tenant (primeiros passos essenciais)
async function activateEssentials(tenantId, supabaseClient) {
  console.log(`Ativando essenciais do tenant ID: ${tenantId}`);
  
  try {
    // Obter informações do tenant
    const { data: tenant, error: fetchError } = await supabaseClient
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (fetchError) {
      console.error(`Erro ao buscar tenant: ${fetchError.message}`);
      throw fetchError;
    }
    
    if (!tenant) {
      throw new Error(`Tenant não encontrado: ${tenantId}`);
    }
    
    console.log(`Tenant encontrado: ${tenant.schema_name}`);
    
    // Ativar apenas o storage se ainda não estiver configurado
    if (!tenant.storage_folder) {
      const storageResult = await setupStorage(supabaseClient, tenant.schema_name);
      if (!storageResult.success) {
        throw new Error(`Falha ao configurar Storage: ${storageResult.error}`);
      }
    } else {
      console.log(`Storage já configurado: ${tenant.storage_folder}`);
    }
    
    // Marcar o tenant como ativo mesmo sem o Airbyte configurado
    const { error: updateError } = await supabaseClient
      .from('tenants')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', tenantId);
    
    if (updateError) {
      console.error(`Erro ao atualizar tenant: ${updateError.message}`);
      throw updateError;
    }
    
    return {
      success: true,
      tenant: tenant.schema_name,
      message: "Essenciais do tenant ativados com sucesso"
    };
  } catch (error) {
    console.error(`Erro ao ativar essenciais do tenant: ${error.message}`);
    
    // Atualizar o status do tenant para erro
    try {
      await supabaseClient
        .from('tenants')
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', tenantId);
    } catch (updateError) {
      console.error(`Erro adicional ao atualizar status do tenant: ${updateError.message}`);
    }
    
    return { success: false, error: error.message };
  }
}

// Função para configurar o Airbyte de forma assíncrona (sem bloquear o usuário)
async function setupAirbyteAsync(tenantId, supabaseClient) {
  console.log(`Configurando Airbyte de forma assíncrona para tenant ID: ${tenantId}`);
  
  try {
    // Obter informações do tenant
    const { data: tenant, error: fetchError } = await supabaseClient
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (fetchError) {
      console.error(`Erro ao buscar tenant: ${fetchError.message}`);
      throw fetchError;
    }
    
    if (!tenant) {
      throw new Error(`Tenant não encontrado: ${tenantId}`);
    }
    
    // Verificar se o Airbyte já está configurado
    if (tenant.airbyte_destination_id) {
      console.log(`Airbyte destination já configurado: ${tenant.airbyte_destination_id}`);
      return {
        success: true,
        message: "Airbyte já configurado",
        destinationId: tenant.airbyte_destination_id
      };
    }
    
    // Configurar o Airbyte
    const airbyteResult = await setupAirbyteDestination(tenant.schema_name);
    if (!airbyteResult.success) {
      console.error(`Falha ao configurar Airbyte: ${airbyteResult.error}`);
      
      // Registrar o erro sem alterar o status do tenant (que já está ativo)
      await supabaseClient
        .from('tenants')
        .update({
          updated_at: new Date().toISOString(),
          error_message: `Configuração do Airbyte falhou: ${airbyteResult.error}`
        })
        .eq('id', tenantId);
      
      return { 
        success: false, 
        error: airbyteResult.error,
        message: "Falha na configuração do Airbyte, mas o tenant permanece ativo"
      };
    }
    
    // Atualizar apenas o ID do destination no tenant (sem alterar o status)
    const { error: updateError } = await supabaseClient
      .from('tenants')
      .update({
        airbyte_destination_id: airbyteResult.destinationId,
        updated_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', tenantId);
    
    if (updateError) {
      console.error(`Erro ao atualizar tenant com ID do destination: ${updateError.message}`);
      throw updateError;
    }
    
    return {
      success: true,
      message: "Airbyte configurado com sucesso",
      destinationId: airbyteResult.destinationId
    };
  } catch (error) {
    console.error(`Erro na configuração assíncrona do Airbyte: ${error.message}`);
    
    // Registrar o erro sem alterar o status do tenant
    try {
      await supabaseClient
        .from('tenants')
        .update({
          updated_at: new Date().toISOString(),
          error_message: `Configuração do Airbyte falhou: ${error.message}`
        })
        .eq('id', tenantId);
    } catch (updateError) {
      console.error(`Erro adicional ao registrar erro do Airbyte: ${updateError.message}`);
    }
    
    return { 
      success: false, 
      error: error.message,
      message: "Falha na configuração do Airbyte, mas o tenant permanece ativo"
    };
  }
}

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Criar cliente do Supabase com as credenciais de serviço
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL não configurada");
    }
    
    if (!supabaseKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
    }
    
    console.log(`Criando cliente Supabase com URL: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar se é uma requisição POST
    if (req.method !== "POST") {
      throw new Error("Método não permitido. Use POST.");
    }
    
    // Obter dados da requisição
    const body = await req.json();
    const { tenantId } = body;
    
    console.log(`Requisição recebida para tenantId: ${tenantId}`);
    
    if (!tenantId) {
      throw new Error("ID do tenant não fornecido.");
    }
    
    // Abordagem em duas fases:
    // 1. Ativar as partes essenciais do tenant (schema, storage) e retornar rapidamente
    const essentialsResult = await activateEssentials(tenantId, supabase);
    
    // Se os essenciais estiverem ativos, iniciar a configuração do Airbyte em background
    if (essentialsResult.success) {
      // Usar Deno.spawn para iniciar a configuração do Airbyte em background
      EdgeRuntime.waitUntil(setupAirbyteAsync(tenantId, supabase));
    }
    
    // Retornar o resultado dos essenciais (para liberar o usuário rapidamente)
    return new Response(JSON.stringify(essentialsResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: essentialsResult.success ? 200 : 500,
    });
  } catch (error) {
    console.error(`Erro no servidor: ${error.message}`);
    
    // Retornar erro
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
