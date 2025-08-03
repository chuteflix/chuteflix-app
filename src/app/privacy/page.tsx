
"use client";

import { PublicHeader } from "@/components/public-header";
import Link from "next/link";
import { useAuth } from "@/context/auth-context"; // Import useAuth
import { Loader2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { settings, loading } = useAuth(); // Destructure settings and loading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <PublicHeader settings={settings} /> {/* Pass settings prop */}
      <main className="container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Política de Privacidade</h1>
          <p className="text-muted-foreground text-lg mb-8">Última atualização: 31 de julho de 2024</p>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <p>Sua privacidade é fundamental para o ChuteFlix. Esta Política de Privacidade descreve como coletamos, usamos, processamos e protegemos suas informações pessoais ao usar nossa plataforma.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">1. Informações que Coletamos</h2>
            <p>Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informações Fornecidas por Você:</strong> Nome completo, endereço de e-mail, CPF, número de telefone e sua chave PIX para pagamentos. Coletamos essas informações durante o cadastro e na configuração do seu perfil.</li>
              <li><strong>Informações de Transação:</strong> Registramos detalhes sobre seus depósitos, saques, e participação em bolões (palpites, valores, datas).</li>
              <li><strong>Informações de Uso:</strong> Coletamos dados sobre como você interage com nossa plataforma, como páginas visitadas, bolões visualizados e cliques.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">2. Como Usamos Suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Fornecer e Gerenciar o Serviço:</strong> Para operar a plataforma, processar suas apostas, depósitos e saques.</li>
              <li><strong>Comunicação:</strong> Para enviar notificações importantes sobre sua conta, transações, resultados de bolões e atualizações da plataforma.</li>
              <li><strong>Segurança:</strong> Para verificar sua identidade, prevenir fraudes e proteger a integridade da nossa plataforma. O CPF é utilizado como um dos fatores para garantir a unicidade da conta e a segurança nas transações financeiras.</li>
              <li><strong>Melhoria do Serviço:</strong> Para analisar o comportamento de uso e entender como podemos melhorar a experiência do usuário.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">3. Compartilhamento de Informações</h2>
            <p>Nós não vendemos ou alugamos suas informações pessoais para terceiros. Suas informações podem ser compartilhadas apenas nas seguintes circunstâncias:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Com Provedores de Serviço:</strong> Podemos compartilhar informações com empresas que nos auxiliam a operar, como provedores de gateway de pagamento para processar transações PIX. Eles têm acesso limitado às suas informações e são obrigados a protegê-las.</li>
                <li><strong>Por Obrigação Legal:</strong> Podemos divulgar suas informações se exigido por lei ou em resposta a solicitações legais válidas.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">4. Segurança de Dados</h2>
            <p>Implementamos medidas de segurança robustas para proteger suas informações contra acesso não autorizado, alteração ou destruição. Isso inclui o uso de criptografia para dados em trânsito e em repouso. No entanto, nenhum sistema é 100% seguro, e não podemos garantir segurança absoluta.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">5. Seus Direitos</h2>
            <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar a maioria das suas informações diretamente na sua página de perfil ou entrando em contato conosco.</p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">6. Retenção de Dados</h2>
            <p>Reteremos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir nossas obrigações legais.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">7. Contato</h2>
            <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através da nossa página de <Link href="/contact" className="text-primary hover:underline">Contato</Link>.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
