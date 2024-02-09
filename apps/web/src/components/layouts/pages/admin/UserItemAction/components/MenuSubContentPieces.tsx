import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { Input as RootInput } from "@/components/ui/input"
import { twc } from "react-twc"

const Container = twc(DropdownMenuSubContent)`min-w-sm p-0 w-full overflow-visible`

const Header = twc.header`flex items-center text-slate-400 pt-2 px-2`

const ThinMiddle = twc.div`px-2 flex pt-1 pb-0.5`

const HeaderTitle = twc.p`text-sm`

const HeaderSubjectAmount = twc.span`text-white font-medium text-xs/none py-0.5 px-1.5 rounded-sm bg-accent/80 ml-2`

const Trigger = twc.button`px-3 flex self-stretch items-center justify-center hover:bg-accent relative transition-all duration-300`

const Loading = twc.button`px-3 self-stretch bg-accent relative transition-all duration-300 pointer-events-none cursor-now-allowed`

const Footer = twc.footer`flex items-center px-2 pt-1 pb-2`

const Input = twc(RootInput).attrs({
  scale: "sm",
  // style: { borderWidth: "1px 1px 0px 0px" },
})``

export const Pieces = {
  Container,
  Header,
  HeaderTitle,
  HeaderSubjectAmount,
  Trigger,
  Footer,
  Input,
  ThinMiddle,
  Loading,
}
