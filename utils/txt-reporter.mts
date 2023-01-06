import { Report } from "./report.mjs"
import { Reporter } from "./reporter.mjs"
import YAML from "yaml"

export class TXTReporter extends Reporter {
  constructor(readonly report: Report) { super() }

  toString(options?: { indent?: number }) {

    return YAML.stringify(
      Object.fromEntries(Object.entries(this.report.report).map(([key, value]) => {
        return [
          key,
          Object.fromEntries(Object.entries(value).map(([key, value]) => {
            return [
              key,
              {
                exec: value.exec,
                latency: `${value.latency.toLocaleString()} ms`,
                exitCode: value.exitCode,
                outputs: value.outputs,
                logs: value.out.map(e => `${new Date(e[1]).toJSON()}:${e[0]}: ${e[2]}`).join('\n')
              }
            ]
          }))
        ]
      })),
      {
        lineWidth: 0
      }
    )

    return Object.entries(this.report.report).map(([key, value]) => {

      return `## ${key}\n\n${Object.entries(value).map(([key, value]) => {

        const outLogs = value.out.map(e => `${new Date(e[1]).toJSON()}:${e[0]}: ${e[2]}`).join('\n')

        return `### ${key}\n\nDuration:${value.latency}\nExit Code:${value.exitCode}\n\n${outLogs}`

      }).join('\n\n')}`

    }).join('\n\n')

  }
}