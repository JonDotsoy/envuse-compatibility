import { describe, expect, it } from "vitest"
import { MDReporter } from "./md-reporter.mjs"
import { Report, ReportDetail } from "./report.mjs"
import { Reporter } from "./reporter.mjs"

const report = new Report({
  "14": {
    'case A': {
      exitCode: 0,
      latency: 0,
      out: [],
      outputs: {},
    },
    'case B': {
      exitCode: 1,
      latency: 0, out: [], outputs: {}
    }
  },
  "19": {
    'case A': {
      exitCode: 0,
      latency: 0,
      out: [],
      outputs: {},
    },
    'case B': {
      exitCode: 0, latency: 0, out: [], outputs: {}
    }
  },
  "20": {
    'case B': {
      exitCode: 1, latency: 0, out: [], outputs: {}
    }
  }
})

describe("MD Reporter", () => {
  it("stringify report", () => {
    const reporter: Reporter = new MDReporter(report)

    expect(reporter.toString()).toMatchInlineSnapshot(`
      "|        | 14                 | 19    | 20                 |
      | :---:  | :---:              | :---: | :---:              |
      | case A | Ok                 | Ok    |                    |
      | case B | Failed exit code 1 | Ok    | Failed exit code 1 |"
    `)
  })

  it('should print table with indent', () => {
    const reporter: Reporter = new MDReporter(report)

    expect(reporter.toString({ indent: 10 })).toMatchInlineSnapshot(`
      "          |        | 14                 | 19    | 20                 |
                | :---:  | :---:              | :---: | :---:              |
                | case A | Ok                 | Ok    |                    |
                | case B | Failed exit code 1 | Ok    | Failed exit code 1 |"
    `)
  })
})

