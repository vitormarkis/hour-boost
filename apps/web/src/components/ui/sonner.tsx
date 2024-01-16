import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group custom"
      toastOptions={{
        style: {
          borderRadius: "0",
        },
        classNames: {
          toast:
            "group toast rounded-none group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-slate-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          info: "group-[.toaster]:border-neutral-900 group-[.toaster]:bg-black",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-black group-[.toast]:text-white",
          error: "group-[.toaster]:bg-red-500 group-[.toaster]:text-white group-[.toaster]:border-red-400",
          success:
            "group-[.toaster]:bg-green-500 group-[.toaster]:text-white group-[.toaster]:border-green-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
