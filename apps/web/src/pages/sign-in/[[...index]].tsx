import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="grid place-items-center min-h-screen">
      <SignIn
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  )
}
