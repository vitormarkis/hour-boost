import { useContextSelector } from "use-context-selector"
import { UserControl, UserControlContext } from "./UserContext"

export function useUserControl<S>(selector: (control: UserControl) => S) {
  return useContextSelector(UserControlContext, selector)
}
