type ActionKey = string

export function handleKeyPressed(
  event: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  actions: Record<ActionKey, () => any>
) {
  const pressedKey = event.key as ActionKey

  const action = actions[pressedKey]
  if (action) action()
}
