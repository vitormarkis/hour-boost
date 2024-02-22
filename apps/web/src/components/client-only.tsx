import { PropsWithChildren, useEffect, useState } from "react"

type ClientOnlyProps = PropsWithChildren

export function ClientOnly({ children }: ClientOnlyProps) {
  const [hasDocument, setHasDocument] = useState(false)

  useEffect(() => {
    setHasDocument(true)
  }, [])

  return hasDocument ? children : null
}
