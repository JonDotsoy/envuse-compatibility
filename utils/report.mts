import { MDReporter } from "./md-reporter.mjs"
import { TXTReporter } from "./txt-reporter.mjs"

export type ReportRunScript = {
  exec: string
  latency: number
  exitCode: null | number
  outputs: Record<string, any>
  out: ["log" | "err", Date, string][]
}

export type ReportDetail = Record<string, Record<string, ReportRunScript>>;
export class Report {
  constructor(readonly report: ReportDetail) { }

  toMD() {
    return new MDReporter(this).toString()
  }

  toTXT() {
    return new TXTReporter(this).toString()
  }

  static merge(reports: Report[]) {
    return reports.reduce((reportAccumulate, report) => Report.mergeTwo(reportAccumulate, report))
  }
  static mergeTwo(report1: Report, report2: Report) {
    return new Report(
      {
        ...report1.report,
        ...Object.fromEntries(
          Object.entries(report2.report).map(([key, values]) => [key, {
            ...report1.report[key],
            ...values
          }])
        ),
      }
    )
  }
}
