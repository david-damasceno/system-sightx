
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import TenantInfo from "@/components/TenantInfo";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações de perfil e configurações</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <div className="bg-card rounded-lg shadow p-6 border">
            <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <p className="mt-1">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">ID de Usuário</label>
                <p className="mt-1 text-sm text-muted-foreground">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <TenantInfo />
        </div>
      </div>
    </div>
  );
};

export default Profile;
