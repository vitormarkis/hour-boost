export default function Custom500(...args: any[]) {
  return (
    <>
      <h1>500 - Server-side error occurred</h1>
      <pre>{JSON.stringify({ args }, null, 2)}</pre>
    </>
  )
}
