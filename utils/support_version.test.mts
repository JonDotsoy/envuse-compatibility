import { describe, expect, it } from "vitest"
import { PlanSupportVersion } from "./support_version.mjs"

describe("PlanSupportVersion", () => {
  it("should create instance of PlanSupportVersion", async () => {
    const plan = new PlanSupportVersion({
      versions: ["14", "16", '17', '18', '19']
    })

    plan.addCaseUse({ name: "a", url: new URL("__cases__/case_import/index.mjs", import.meta.url) })
  })

  describe("Describe plan", async () => {
    const plan = new PlanSupportVersion({
      versions: ["14", "16", '17', '18', '19'],
    })

    plan.addCaseUse({ name: "import module", url: new URL("__cases__/case_import.mjs", import.meta.url) })

    it("should run the plan", async () => {
      const report = await plan.run()

      expect(report).toBeTypeOf("object")
      expect(report).not.toBeNull()
      expect(report).keys("14", "16", '17', '18', '19')
      for (const [key, value] of Object.entries(report)) {
        expect(value).toBeTypeOf("object")
        expect(value).not.toBeNull()
        for (const [key, val] of Object.entries(value)) {
          expect(val).toBeTypeOf("object")
          expect(val).not.toBeNull()
          expect(val.exitCode).toBeTypeOf("number")
          expect(val.latency).toBeTypeOf("number")
          expect(val.outputs).toBeTypeOf("object")
        }
      }

      console.log(report)

    })
  }, 5 * 60 * 1000)
})