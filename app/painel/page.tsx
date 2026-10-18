
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import PainelClient from "./PainelClient";

async function ConteudoPainel() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

 return <PainelClient nomeUsuario={user.name} />;
}

export default function PainelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ConteudoPainel />
    </Suspense>
  );
}
