import { describe, expect, it } from "vitest"
import { Report } from "./report.mjs"


it("should merge two reports", () => {
  const report1 = new Report({
    "19": {
      "a": { exitCode: 0, latency: 0, out: [], outputs: {} },
    }
  })
  const report2 = new Report({
    "19": {
      "b": { exitCode: 0, latency: 0, out: [], outputs: {} },
    },
  })

  const report = Report.mergeTwo(report1, report2)

  expect(report.report).toMatchObject({
    "19": {
      "a": {},
      "b": {},
    }
  })
})

it("should merge four reports", () => {
  const report1 = new Report({
    "19": {
      "a": { exitCode: 0, latency: 0, out: [], outputs: {} },
    }
  })
  const report2 = new Report({
    "19": {
      "b": { exitCode: 0, latency: 0, out: [], outputs: {} },
    },
  })
  const report3 = new Report({
    "14": {
      "c": { exitCode: 0, latency: 0, out: [], outputs: {} },
    },
  })
  const report4 = new Report({
    "19": {
      "d": { exitCode: 0, latency: 0, out: [], outputs: {} },
    },
  })

  const report = Report.merge([report1, report2, report3, report4])

  expect(report.report).toMatchObject({
    "19": {
      "a": {},
      "b": {},
      "d": {},
    },
    "14": {
      "c": {}
    }
  })
})
