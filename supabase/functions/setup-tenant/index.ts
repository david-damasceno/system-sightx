
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
    // Lista de possíveis endpoints para obter destinations
    const possibleEndpoints = [
      `${airbyteUrl}/api/v1/destinations/list`,
      `${airbyteUrl}/api/destinations/list`,
      `${airbyteUrl}/destinations/list`
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Tentando listar destinations via ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ workspaceId }),
        });
        
        if (!response.ok) {
          console.log(`Endpoint ${endpoint} retornou status ${response.status}, tentando próximo...`);
          continue;
        }
        
        const data = await response.json();
        console.log(`Resposta de listagem de destinations recebida, verificando por "${destinationName}"`);
        
        // Verificar diferentes formatos de resposta
        const destinations = data.destinations || data;
        
        if (!Array.isArray(destinations)) {
          console.log(`Formato de resposta inesperado do endpoint ${endpoint}, tentando próximo...`);
          continue;
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
        console.error(`Erro ao verificar destinations via ${endpoint}: ${error.message}`);
        // Continuar tentando outros endpoints
      }
    }
    
    // Se nenhum endpoint funcionou, assumimos que não existe
    console.log(`Não foi possível verificar se destination já existe. Assumindo que não existe.`);
    return { exists: false };
    
  } catch (error) {
    console.error(`Erro ao verificar destination existente: ${error.message}`);
    return { exists: false };
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
    console.log(`Username: ${airbyteUsername}`);
    console.log(`Password: ${airbytePassword.substring(0, 3)}...`); // Log parcial da senha por segurança
    
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
    
    // Payload para criar o destination - formato específico para Airbyte OSS
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
    
    console.log(`Payload do destination: ${JSON.stringify(payload, null, 2)}`);
    
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
    
    // Lista de possíveis endpoints para diferentes versões/configurações do Airbyte OSS
    const possibleEndpoints = [
      `${apiUrl}/api/v1/destinations/create`,
      `${apiUrl}/api/destinations/create`,
      `${apiUrl}/destinations/create`,
      `${apiUrl}/api/v1/destinations`
    ];
    
    let success = false;
    let result = null;
    let lastError = null;
    
    // Tentar cada endpoint possível
    for (const endpoint of possibleEndpoints) {
      if (success) break;
      
      console.log(`Tentando criar destination no endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        });
        
        console.log(`Resposta de ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const responseData = await response.json();
          console.log(`Destination criado com sucesso via ${endpoint}: ${JSON.stringify(responseData, null, 2)}`);
          success = true;
          result = responseData;
          break;
        } else {
          const errorText = await response.text();
          console.error(`Erro no endpoint ${endpoint} (${response.status}): ${errorText}`);
          
          try {
            lastError = JSON.parse(errorText);
          } catch (e) {
            lastError = { message: errorText };
          }
        }
      } catch (fetchError) {
        console.error(`Erro ao chamar ${endpoint}: ${fetchError.message}`);
        lastError = { message: fetchError.message };
      }
    }
    
    // Verificar se algum endpoint teve sucesso
    if (success && result) {
      // Extrair o ID do destination de acordo com a estrutura de resposta
      const destinationId = result.destinationId || result.id || (result.destination && result.destination.destinationId);
      
      if (!destinationId) {
        throw new Error("ID do destination não encontrado na resposta, embora a operação tenha sido bem-sucedida");
      }
      
      return {
        success: true,
        destinationId: destinationId,
        destinationName: destinationName
      };
    } else {
      // Se nenhum endpoint teve sucesso, lançar o último erro
      const errorMsg = lastError ? 
        (typeof lastError === 'object' ? JSON.stringify(lastError) : lastError) : 
        "Todos os endpoints falharam, sem detalhes adicionais";
      
      throw new Error(`Falha ao criar destination. ${errorMsg}`);
    }
  } catch (error) {
    console.error(`Erro ao configurar Airbyte: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função principal de ativação do tenant
async function activateTenant(tenantId, supabaseClient) {
  console.log(`Ativando tenant ID: ${tenantId}`);
  
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
    
    // Verificar se o tenant já está ativo
    if (tenant.status === 'active') {
      console.log(`Tenant ${tenant.schema_name} já está ativo, ignorando ativação`);
      return {
        success: true,
        message: "Tenant já está ativo",
        tenant: tenant.schema_name
      };
    }
    
    // Verificar se o tenant já tem configurações parciais
    let storageResult = { success: true };
    if (!tenant.storage_folder) {
      // Configurar o Storage apenas se ainda não estiver configurado
      storageResult = await setupStorage(supabaseClient, tenant.schema_name);
      if (!storageResult.success) {
        throw new Error(`Falha ao configurar Storage: ${storageResult.error}`);
      }
    } else {
      console.log(`Storage já configurado: ${tenant.storage_folder}`);
    }
    
    let airbyteResult = { success: true };
    if (!tenant.airbyte_destination_id) {
      // Configurar o Airbyte apenas se ainda não estiver configurado
      airbyteResult = await setupAirbyteDestination(tenant.schema_name);
      if (!airbyteResult.success) {
        throw new Error(`Falha ao configurar Airbyte: ${airbyteResult.error}`);
      }
    } else {
      console.log(`Airbyte destination já configurado: ${tenant.airbyte_destination_id}`);
    }
    
    // Atualizar o registro do tenant com os resultados
    const updates = {
      status: 'active',
      updated_at: new Date().toISOString(),
      error_message: null
    };
    
    if (airbyteResult.success && airbyteResult.destinationId) {
      updates.airbyte_destination_id = airbyteResult.destinationId;
    }
    
    const { error: updateError } = await supabaseClient
      .from('tenants')
      .update(updates)
      .eq('id', tenantId);
    
    if (updateError) {
      console.error(`Erro ao atualizar tenant: ${updateError.message}`);
      throw updateError;
    }
    
    return {
      success: true,
      tenant: tenant.schema_name,
      storage: storageResult,
      airbyte: airbyteResult
    };
  } catch (error) {
    console.error(`Erro ao ativar tenant: ${error.message}`);
    
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
    
    // Ativar o tenant
    const result = await activateTenant(tenantId, supabase);
    
    // Retornar o resultado
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.success ? 200 : 500,
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
