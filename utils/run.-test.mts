// import { inspect } from "node:util"
// import { describe, it, beforeAll, afterAll } from "vitest"
// import { createPlanManager } from "./run.mjs"


// describe("RUN", () => {
//   it("should make pattern of tests", async () => {

//     const planManager = createPlanManager({
//       cwd: import.meta.url,
//       jobs: {
//         '19': {
//           build: {
//             dockerfile: "Dockerfile",
//           },
//           steps: [
//             { exec: 'ls -lhs /' },
//             { exec: 'ls -lhs /' },
//             { exec: 'ls -lhs /' },
//           ]
//         }
//       }
//     })

//     // console.log(inspect(planManager, { depth: Infinity, colors: true }))
//     await planManager.run()
//   })
// })
