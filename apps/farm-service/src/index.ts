import { Application } from "./application"
import { UserStartFarm } from "./use-case/UserStartFarm"

console.log(`Logando com yversale`)

const USERNAME = "yversale"
const PASSWORD = "Dc4/uRZNSA(j6y&"

const app = new Application()

;(() => {
  const userStartFarm = new UserStartFarm(app)
  userStartFarm.execute({
    gamesPlayed: [601510],
    password: PASSWORD,
    username: USERNAME,
  })
})()
