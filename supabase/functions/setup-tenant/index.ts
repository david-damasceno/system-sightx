
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

// Função para criar as tabelas de chat no esquema do tenant
async function setupSchemaTables(supabaseClient, schemaName) {
  console.log(`Configurando tabelas no schema: ${schemaName}`);
  
  try {
    // Verificar se o esquema existe
    const { error: schemaCheckError } = await supabaseClient.rpc(
      'apply_tenant_tables',
      { t_record: { schema_name: schemaName } }
    );
    
    if (schemaCheckError) {
      console.error(`Erro ao criar tabelas para ${schemaName}: ${schemaCheckError.message}`);
      return { success: false, error: schemaCheckError.message };
    }
    
    console.log(`Tabelas configuradas com sucesso para o schema ${schemaName}`);
    return { success: true };
  } catch (error) {
    console.error(`Erro ao configurar tabelas para ${schemaName}: ${error.message}`);
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
    
    // Configurar tabelas no esquema do tenant
    const tablesResult = await setupSchemaTables(supabaseClient, tenant.schema_name);
    if (!tablesResult.success) {
      throw new Error(`Falha ao configurar tabelas no esquema: ${tablesResult.error}`);
    }
    
    // Atualizar o registro do tenant com os resultados
    const updates = {
      status: 'active',
      updated_at: new Date().toISOString(),
      error_message: null
    };
    
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
      tables: tablesResult
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
