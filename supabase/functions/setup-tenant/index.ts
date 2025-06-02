
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuração dos headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função principal de ativação do tenant usando a nova função do banco
async function activateTenant(tenantId: string, supabaseClient) {
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
      console.log(`Tenant ${tenant.schema_name} já está ativo`);
      return {
        success: true,
        message: "Tenant já está ativo",
        tenant: tenant.schema_name
      };
    }
    
    // Usar a nova função do banco para configurar tudo
    console.log(`Configurando tenant usando função do banco...`);
    const { data: setupResult, error: setupError } = await supabaseClient
      .rpc('setup_tenant_complete', { user_id_param: tenant.user_id });
    
    if (setupError) {
      console.error(`Erro na função setup_tenant_complete: ${setupError.message}`);
      throw setupError;
    }
    
    if (!setupResult.success) {
      console.error(`Falha na configuração: ${setupResult.error}`);
      throw new Error(setupResult.error);
    }
    
    console.log(`Tenant configurado com sucesso:`, setupResult);
    
    return {
      success: true,
      tenant: tenant.schema_name,
      storage: { success: true, folder: setupResult.storage_folder },
      tables: { success: true }
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
