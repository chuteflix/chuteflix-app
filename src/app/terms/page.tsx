
import { PublicHeader } from "@/components/public-header";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <main className="container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Termos de Uso</h1>
          <p className="text-muted-foreground text-lg mb-8">Última atualização: 31 de julho de 2024</p>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <p>Bem-vindo ao ChuteFlix! Ao se cadastrar e utilizar nossa plataforma, você concorda com os seguintes termos e condições. Por favor, leia-os com atenção.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">1. O Serviço</h2>
            <p>O ChuteFlix é uma plataforma online de entretenimento que permite aos usuários participar de "bolões" de futebol, fazendo palpites sobre os placares das partidas. Nós oferecemos uma experiência de "streaming de bolões", onde você pode navegar, escolher e participar de forma dinâmica e segura.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">2. Elegibilidade</h2>
            <p>Para criar uma conta e participar dos bolões, você deve ter pelo menos 18 anos de idade e capacidade legal para celebrar contratos vinculativos.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">3. Conta de Usuário</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cadastro:</strong> Você concorda em fornecer informações verdadeiras, precisas e completas durante o processo de registro.</li>
              <li><strong>Segurança:</strong> Você é responsável por manter a confidencialidade da sua senha e por todas as atividades que ocorrem em sua conta.</li>
              <li><strong>Uso:</strong> Sua conta é pessoal e intransferível.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">4. Regras dos Bolões</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Participação:</strong> Para participar de um bolão, o usuário deve pagar o valor de entrada ("taxa") estipulado no card do bolão. O pagamento é feito utilizando o saldo disponível na sua carteira ChuteFlix.</li>
              <li><strong>Encerramento:</strong> As apostas para um determinado bolão são encerradas automaticamente 20 minutos antes do horário de início da partida correspondente. Após o encerramento, não é mais possível enviar ou alterar palpites.</li>
              <li><strong>Premiação:</strong> O prêmio total de um bolão consiste no valor inicial (se houver) somado a uma porcentagem (atualmente 90%) do total arrecadado com as taxas de todos os participantes. O valor será dividido igualmente entre todos os usuários que acertarem o placar exato do jogo.</li>
              <li><strong>Pagamento do Prêmio:</strong> Após a apuração do resultado oficial da partida, os prêmios são creditados automaticamente no saldo ChuteFlix dos vencedores.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">5. Depósitos e Saques</h2>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Depósitos:</strong> Os usuários podem adicionar saldo à sua carteira ChuteFlix através de PIX.</li>
                <li><strong>Saques:</strong> Os usuários podem solicitar o saque do seu saldo disponível. Os saques são processados via PIX para a chave cadastrada e verificada pelo usuário na seção "Chave PIX". O ChuteFlix se reserva o direito de revisar as solicitações de saque para garantir a segurança.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">6. Conduta do Usuário</h2>
            <p>Você concorda em não usar a plataforma para qualquer finalidade ilegal ou proibida por estes termos. Atividades como fraude, manipulação de resultados ou uso de contas múltiplas para obter vantagem indevida resultarão na suspensão imediata da conta e na perda de qualquer saldo ou prêmio pendente.</p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">7. Limitação de Responsabilidade</h2>
            <p>O ChuteFlix fornece uma plataforma de entretenimento e não se responsabiliza por perdas financeiras decorrentes da participação nos bolões. Jogue com responsabilidade.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">8. Alterações nos Termos</h2>
            <p>Podemos modificar estes termos a qualquer momento. Notificaremos sobre alterações significativas, mas é sua responsabilidade revisar os termos periodicamente. O uso continuado da plataforma após as alterações constitui sua aceitação dos novos termos.</p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">9. Contato</h2>
            <p>Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco através da nossa página de <Link href="/contact" className="text-primary hover:underline">Contato</Link>.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
