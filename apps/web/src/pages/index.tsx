import { User } from "core"
import React from "react"

export default function Home() {
    const [user, setUser] = React.useState<User | null>(null)

    React.useEffect(() => {
        setUser(
            User.create({
                username: "vitormarkis",
            })
        )
    }, [])

    return (
        <main className="h-screen grid place-items-center">
            <h1>Olá Mundo</h1>
            <pre>{JSON.stringify({ user }, null, 2)}</pre>
        </main>
    )
}
