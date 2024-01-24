function makeRelogAttempts() {
  let isActive = false
  let attempts = 0
  const incrementAttempts = () => attempts++
  const resetAttempts = () => (attempts = 0)
  const turnOff = () => (isActive = false)
  const turnOn = () => (isActive = true)
  return {
    isActive,
    attempts,
    incrementAttempts,
    resetAttempts,
    turnOff,
    turnOn,
  }
}

export const relogAttempts = makeRelogAttempts()
