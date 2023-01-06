import { PlanSupportVersion } from "./utils/support_version.mjs"
import { MDReporter } from "./utils/md-reporter.mjs"
import { Report } from "./utils/report.mjs"
import { writeFile } from "fs/promises"
import { rollup } from "rollup"

enum Formats {
  "ECMAScript modules" = "ECMAScript modules",
  "CommonJS modules" = "CommonJS modules",
  "CommonJS (JS) modules" = "CommonJS (JS) modules"
}

const moduleTypeToDirname = (moduleType: Formats) => {
  switch (moduleType) {
    case Formats["ECMAScript modules"]: return "esm"
    case Formats["CommonJS (JS) modules"]: return "js"
    case Formats["CommonJS modules"]: return "cjs"
  }
}

const moduleTypeToFormat = (moduleType: Formats) => {
  switch (moduleType) {
    case Formats["ECMAScript modules"]: return "esm"
    case Formats["CommonJS (JS) modules"]: return "cjs"
    case Formats["CommonJS modules"]: return "cjs"
  }
}

const moduleTypeToExt = (moduleType: Formats) => {
  switch (moduleType) {
    case Formats["ECMAScript modules"]: return ".mjs"
    case Formats["CommonJS (JS) modules"]: return ".js"
    case Formats["CommonJS modules"]: return ".cjs"
  }
}


const cases = [
  { name: "case_import", "title": "Import Package" },
  { name: "case_parse_file", "title": "Parse Envuse File" },
]
const describeCase = (caseName: string, moduleType: Formats) => ({
  file: `envs/${moduleTypeToDirname(moduleType)}/${caseName}${moduleTypeToExt(moduleType)}`,
  format: moduleTypeToFormat(moduleType)
} as const)

for (const caseName of cases) {
  const esmDescription = describeCase(caseName.name, Formats["ECMAScript modules"])
  const jsDescription = describeCase(caseName.name, Formats["CommonJS (JS) modules"])
  const cjsDescription = describeCase(caseName.name, Formats["CommonJS modules"])
  const rollupBuild = await rollup({
    input: esmDescription.file,
    external: ["envuse", "assert"]
  })

  await rollupBuild.write({ file: jsDescription.file, format: jsDescription.format })
  await rollupBuild.write({ file: cjsDescription.file, format: cjsDescription.format })
}

const plan = new PlanSupportVersion()

for (const version of [
  '13', '14', '15', '16', '17', '18',
  '19'
]) {
  const env = {
    name: `node:${version}`,
  }

  for (const caseName of cases) {
    for (const moduleType of Object.values(Formats)) {
      const desc = describeCase(caseName.name, moduleType)
      plan.addCaseUse({
        name: `${moduleType}/${caseName.title}`,
        case: new URL(desc.file, import.meta.url),
        environment: env,
      })
    }
  }
}

const report = await plan.run()

await writeFile(`.report.md`, report.toMD())
await writeFile(`.report.yaml`, report.toTXT())
