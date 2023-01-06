import { Report } from "./report.mjs"
import { Reporter } from "./reporter.mjs"

export class MDReporter extends Reporter {
  constructor(readonly report: Report) { super() }

  toString(options?: { indent?: number }) {
    const cols = new Set<string>()
    const rows = new Set<string>()
    for (const [colName, colValue] of Object.entries(this.report.report)) {
      cols.add(colName)
      for (const [rowName, rowValue] of Object.entries(colValue)) {
        rows.add(rowName)
      }
    }

    const table: string[][] = []
    const tableColsSize: Record<number, number> = {}
    const tablePushRow = (cels: string[]) => {
      cels.forEach((cel, index) => {
        tableColsSize[index] = Math.max(cel.length, tableColsSize[index] ?? 0)
      })
      table.push(cels)
    }

    tablePushRow(['', ...cols])
    tablePushRow(['---', ...Array.from(cols).fill('---')])

    for (const row of rows) {
      const o: string[] = Array.from(cols).map(col => {
        const detailReport = this.report.report[col]?.[row] ?? null
        if (detailReport === null) return ``
        return detailReport.exitCode === 0 ? "Yes" : `Error`
      })

      tablePushRow([row, ...o])
    }

    const indent = ' '.repeat(options?.indent ?? 0)
    return table.map(row => `${indent}| ${row.map((cel, index) => cel.padEnd(tableColsSize[index], ' ')).join(' | ')} |`).join('\n')
  }
}