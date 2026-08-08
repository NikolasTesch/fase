import { ShieldAlert } from "lucide-react";
import { LogoutButton } from "../../_components/LogoutButton";

export const metadata = { title: "Sem Acesso — Admin" };

export default function SemAcessoPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
        <ShieldAlert size={26} />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
        Seu perfil não tem módulos acessíveis
      </h1>
      <p className="text-muted-foreground text-sm mt-2 max-w-md">
        O papel VENDEDOR não possui áreas liberadas no momento. Fale com o
        administrador para ajustar suas permissões.
      </p>
      <div className="mt-6 w-48">
        <LogoutButton />
      </div>
    </div>
  );
}
