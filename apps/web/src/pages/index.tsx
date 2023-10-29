import React from "react"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { Header } from "@/components/layouts/Header"
import { GetServerSideProps } from "next"
import { AuthSessionParams } from "@/types/UserSession"
import { getAuthSession } from "@/util/getAuthSession"
import { GamesAvailableSection } from "@/components/layouts/GamesAvaiable"
import { TitleSection } from "@/components/atoms/TitleSection"
import st from "./pages.module.css"
import { cn } from "@/lib/utils"
import { CardBulletsSection } from "@/components/layouts/CardBulletsSection"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const props = await getAuthSession(ctx.req)
  return { props }
}

export default function Home({ authSession }: AuthSessionParams) {
  return (
    <>
      <Header user={authSession.user} />
      <HeroSection />
      <HowItWorksSection />
      <GamesAvailableSection />
      <section className="pb-24 relative overflow-hidden flex grow flex-wrap gap-6 bg-slate-950">
        <TitleSection className="text-center grow">Contas Ilimitadas</TitleSection>
      </section>
      <div className={cn("h-[7rem] bg-slate-950", st["shapedividers_com-8155"])} />
      <CardBulletsSection />
      <div
        className={cn("h-[7rem]", st["shapedividers_com-8155"])}
        style={{
          transform: "scale(1,-1) matrix(1, 0, 0, 0.3, 0, 0) translateY(8.7rem)",
        }}
      />
      <section className="flex py-32 pb-72 w-screen grow flex-wrap justify-center gap-6">
        <TitleSection className="text-center grow">Planos</TitleSection>
      </section>
      <section className="flex flex-col py-32 pb-72 w-screen grow flex-wrap justify-center gap-6">
        <TitleSection className="text-center grow">FAQ</TitleSection>
        <div className="max-w-7xl w-full mx-auto px-8">
          <div className="max-w-5xl w-full mx-auto">
            <Accordion type="multiple">
              {FAQ.map(faq => (
                <AccordionItem value={faq.question.replace(/\s+/g, " ").trim()}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}

export const FAQ = [
  {
    question: "Quais as formas de pagamento aceitas?",
    answer: "Atualmente as principais formas de pagamento são Mercado Pago,Pag Seguro e PIX.",
  },
  {
    question: 'Serei banido por VAC por não jogar ativamente o jogo, também conhecido como "inativo"?',
    answer: `
  1A posição oficial da Valve é: "Não, você não será banido apenas por inatividade. Você pode
  ser banido se usar programas externos para contornar a detecção de inatividade. Consulte as
  Perguntas frequentes do VAC. Https://support.steampowered.com/kb_article.php ? ref =
  7849-Radz-6869"
  `,
  },
  {
    question: "Tenho que parar meu farm quando for jogar de verdade?",
    answer: `
  Não, basta clicar em jogar, e se aparecer que você já está jogando, clique em OK e ele
  substituirá o Hourboost. Depois que você parar de jogar, ele será reiniciado
  automaticamente.
  `,
  },
  {
    question: "Minhas horas não são exibidas na Steam depois que eu comecei a farmar.",
    answer:
      "a Steam pode demorar para atualizar algumas vezes. Se você optou por aparecer on-line e pode ver sua conta jogando, seu farm de horas estará em execução. Caso contrário, aguarde um pouco mais para que as horas apareçam no seu perfil.",
  },
  {
    question: "Posso ficar farmando horas e manter completamente oculto para meus amigos?",
    answer:
      "Sim! Se você clicar para aparecer offline quando estiver farmando, ele não aparecerá para nenhum de seus amigos e você poderá usar a steam normalmente. Você pode ocultar muitos jogos ao mesmo tempo e ninguém saberá!",
  },
  {
    question: "Posso ficar farmar jogos que não estão instalados em meu computador?",
    answer:
      "Sim, mas eles devem estar pelo menos na sua biblioteca steam. Se você estiver farmando um jogo F2P, mas ele não esta na sua biblioteca, basta clicar em instalar uma vez e interromper o download e ele estará lá",
  },
  {
    question: "Posso ficar farmando com o cliente Steam aberto no meu computador?",
    answer:
      "Sim, você pode usar o Steam como sempre fez. Depois de iniciar um jogo, seu modo farm será pausado. Ele será reiniciado automaticamente quando você terminar o jogo.",
  },
  {
    question: "Os dados da minha conta Steam estão seguros no HourBoost?",
    answer:
      "Sim, Levamos a segurança muito a sério. Os dados são totalmente criptografados, usamos conexão HTTPS, temos muitos sistemas para proteger e bloquear suas informações, incluindo senhas complexas e com hash usando blowfish e outros.",
  },
  {
    question: "Qual é o número máximo de jogos em que posso ficar farmando?",
    answer:
      "Você pode ficar farmando em até 32 jogos por conta steam, todos ao mesmo tempo. Este é o limite arbitrário da Steam.",
  },
  {
    question: "Existe algum risco de VAC?",
    answer:
      "NÃO. Sua conta está totalmente segura - nunca ofereceremos nenhum recurso que arrisque sua conta. Os farms não são executados nos servidores VAC, e nenhum arquivo é alterado no computador quando está farmando, pois tudo é executado aqui no Hourboost!",
  },
]
