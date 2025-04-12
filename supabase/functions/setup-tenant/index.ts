
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
    // Criar uma pasta para o tenant
    const { error: storageError } = await supabaseClient
      .storage
      .createBucket(schemaName, {
        public: false
      });
    
    if (storageError) {
      console.error(`Erro ao criar bucket de storage: ${storageError.message}`);
      throw storageError;
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

// Função para configurar o Airbyte Destination para um novo tenant
async function setupAirbyteDestination(schemaName) {
  console.log(`Configurando Airbyte Destination para o schema: ${schemaName}`);
  
  try {
    const airbyteUrl = Deno.env.get("AIRBYTE_API_URL");
    if (!airbyteUrl) {
      throw new Error("URL da API do Airbyte não configurada");
    }
    
    // Verificar se a URL contém o protocolo
    const apiUrl = airbyteUrl.startsWith("http") ? 
      airbyteUrl : 
      `https://${airbyteUrl}`;
    
    console.log(`URL da API do Airbyte: ${apiUrl}`);
    
    const airbyteWorkspaceId = Deno.env.get("AIRBYTE_WORKSPACE_ID");
    const airbyteUsername = Deno.env.get("AIRBYTE_USERNAME");
    const airbytePassword = Deno.env.get("AIRBYTE_PASSWORD");
    
    if (!airbyteWorkspaceId || !airbyteUsername || !airbytePassword) {
      throw new Error("Credenciais do Airbyte não configuradas corretamente");
    }
    
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
    
    // Configuração da conexão PostgreSQL para o Airbyte
    const destinationDefinitionId = "25c5221d-dce2-4163-ade9-739ef790f503"; // ID da definição do PostgreSQL
    
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
    
    console.log(`Payload do destination: ${JSON.stringify(payload, null, 2)}`);
    
    // Montar a URL completa da API - corrigir o caminho do endpoint
    const apiEndpoint = `${apiUrl}/api/v1/destinations/create`;
    console.log(`Chamando API Airbyte em: ${apiEndpoint}`);
    
    // Criar o destination no Airbyte
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });
    
    // Log da resposta HTTP
    console.log(`Resposta HTTP: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na resposta do Airbyte (${response.status}): ${errorText}`);
      
      // Tentar obter mais detalhes se for um JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Detalhes do erro:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // Não é JSON, ignorar
      }
      
      throw new Error(`Falha ao criar destination: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Destination criado com sucesso: ${JSON.stringify(result, null, 2)}`);
    
    return {
      success: true,
      destinationId: result.destinationId,
      destinationName: destinationName
    };
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
    
    // Configurar o Storage
    const storageResult = await setupStorage(supabaseClient, tenant.schema_name);
    if (!storageResult.success) {
      throw new Error(`Falha ao configurar Storage: ${storageResult.error}`);
    }
    
    // Configurar o Airbyte Destination
    const airbyteResult = await setupAirbyteDestination(tenant.schema_name);
    if (!airbyteResult.success) {
      throw new Error(`Falha ao configurar Airbyte: ${airbyteResult.error}`);
    }
    
    // Atualizar o registro do tenant com os resultados
    const updates = {
      status: 'active',
      updated_at: new Date().toISOString()
    };
    
    if (airbyteResult.success) {
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
          updated_at: new Date().toISOString()
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://nhpqzxhbdiurhzjpghqz.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar se é uma requisição POST
    if (req.method !== "POST") {
      throw new Error("Método não permitido. Use POST.");
    }
    
    // Obter dados da requisição
    const body = await req.json();
    const { tenantId } = body;
    
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
