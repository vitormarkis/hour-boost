import { SignUp } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="grid place-items-center min-h-screen">
      <SignUp
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  )
}
