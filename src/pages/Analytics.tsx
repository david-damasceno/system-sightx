
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MessageSquare, TrendingUp, Clock, Sparkles } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface AnalyticsData {
  totalChats: number;
  totalMessages: number;
  totalImprovements: number;
  dailyActivity: Array<{ date: string; messages: number; chats: number }>;
  improvementTypes: Array<{ type: string; count: number }>;
}

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados de sessões de chat
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, created_at')
        .eq('user_id', user.id);

      if (sessionsError) throw sessionsError;

      // Buscar dados de mensagens
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id, timestamp, session_id')
        .in('session_id', sessions?.map(s => s.id) || []);

      if (messagesError) throw messagesError;

      // Buscar dados de melhorias
      const { data: improvements, error: improvementsError } = await supabase
        .from('message_improvements')
        .select('improvement_type, created_at')
        .eq('user_id', user.id);

      if (improvementsError) throw improvementsError;

      // Processar dados dos últimos 7 dias
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), i));
        return {
          date: format(date, 'dd/MM'),
          messages: messages?.filter(m => 
            startOfDay(new Date(m.timestamp)).getTime() === date.getTime()
          ).length || 0,
          chats: sessions?.filter(s => 
            startOfDay(new Date(s.created_at)).getTime() === date.getTime()
          ).length || 0
        };
      }).reverse();

      // Contar tipos de melhorias
      const improvementTypeCounts = improvements?.reduce((acc: any, imp) => {
        const type = imp.improvement_type || 'general';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}) || {};

      const improvementTypes = Object.entries(improvementTypeCounts).map(([type, count]) => ({
        type: type === 'general' ? 'Geral' : 
              type === 'formal' ? 'Formal' :
              type === 'persuasive' ? 'Persuasivo' :
              type === 'concise' ? 'Conciso' :
              type === 'friendly' ? 'Amigável' : type,
        count: count as number
      }));

      setAnalytics({
        totalChats: sessions?.length || 0,
        totalMessages: messages?.length || 0,
        totalImprovements: improvements?.length || 0,
        dailyActivity: last7Days,
        improvementTypes
      });

    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Faça login para ver suas estatísticas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sightx-purple"></div>
      </div>
    );
  }

  const COLORS = ['#8B5CF6', '#06D6A0', '#FFD60A', '#F72585', '#4ECDC4'];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Análise de Atividade</h1>
        <p className="text-muted-foreground">
          Acompanhe sua atividade e uso do SightX
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-sightx-purple" />
              Total de Conversas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-bold">{analytics?.totalChats}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Total de Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-bold">{analytics?.totalMessages}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Textos Melhorados
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-3xl font-bold">{analytics?.totalImprovements}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-sightx-purple" />
              Atividade dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" name="Mensagens" fill="#8B5CF6" />
                  <Bar dataKey="chats" name="Conversas" fill="#06D6A0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {analytics?.totalImprovements ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Tipos de Melhorias de Texto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.improvementTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics?.improvementTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Quantidade']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Tipos de Melhorias de Texto
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[300px]">
              <Sparkles className="h-12 w-12 mb-4 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground text-center">
                Nenhum dado disponível. Use o recurso de melhoria de texto para ver estatísticas aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
