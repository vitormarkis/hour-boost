export async function isProductionServerOn() {
  try {
    const res = await fetch(`https://api.hourboost.com.br/up`)
    if (res.status === 200) return true
    return false
  } catch (error) {
    return false
  }
}
