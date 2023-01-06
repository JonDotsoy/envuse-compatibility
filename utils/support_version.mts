import { createInterface, CreateRunOptions } from "docker_child_process"
import { subtle } from "node:crypto"
import { createWriteStream, existsSync } from "node:fs"
import { copyFile, mkdir, writeFile } from "node:fs/promises"
import path, * as nodePath from "node:path"
import { Report, ReportDetail, ReportRunScript } from "./report.mjs"

const cacheFolder = new URL(".cache/", import.meta.url)

interface PlanSupportVersionOptions {
  caseUses?: { url: URL, name: string }[]
  caseDirectory?: URL
  nodePackage?: {
    type?: "module" | "commonjs"
  }
}

interface PlanOptions {
  name: string
  environment: {
    name: string
  }
  case: URL
  cwd?: URL
}

export class PlanSupportVersion {
  readonly caseUses: PlanOptions[] = []
  private dockerInterfaces = new Map<string, ReturnType<typeof createInterface>>()
  private onceInit = new Map<ReturnType<typeof createInterface>, () => Promise<void>>()

  constructor() { }

  addCaseUse(options: PlanOptions) {
    this.caseUses.push(options)
  }

  private dockerEnvironments(options: CreateRunOptions) {
    const key = JSON.stringify(options)
    const preDockerInterface = this.dockerInterfaces.get(key)
    if (preDockerInterface) return preDockerInterface
    const dockerInterface = createInterface(options)
    this.dockerInterfaces.set(key, dockerInterface)
    return dockerInterface
  }

  private onceDockerInterfaceInit(dockerInterface: ReturnType<typeof createInterface>): () => Promise<void> {
    const preFn = this.onceInit.get(dockerInterface)
    if (preFn) return preFn
    const fn = async () => { await dockerInterface.init() }
    this.onceInit.set(dockerInterface, fn)
    return fn
  }

  async cacheNPMDist(npmPackage: string, version: string = "latest"): Promise<URL> {
    const distFolder = new URL("npm/dist/", cacheFolder)
    await mkdir(distFolder, { recursive: true })
    const tarballLocation = new URL(`${npmPackage}-${version}.tgz`, distFolder)
    const f = () => {
      try {
        return existsSync(tarballLocation)
      } catch (ex) {
        if (typeof ex === "object" && ex !== null && (ex as Record<string, any>).code === "ENOENT") return false
        throw ex
      }
    }
    if (f()) return tarballLocation
    const urlNpm = new URL(`https://registry.npmjs.org/${npmPackage}/${version}`)
    const res = await fetch(urlNpm)
    const body = await res.json()
    const resTarball = await fetch(body.dist.tarball)
    const a = new Uint8Array(await resTarball.arrayBuffer())
    await writeFile(tarballLocation, a)
    return tarballLocation
  }

  async run() {
    const workspaceLocation = new URL("/workspace/", "file://")
    await this.cacheNPMDist("envuse")
    const report: ReportDetail = {}
    for (const caseUse of this.caseUses) {
      const h = new Uint8Array(await subtle.digest("SHA-1", new TextEncoder().encode(caseUse.name))).reduce(
        (accumulate, uint) => `${accumulate}${uint.toString(16).padStart(2, '0')}`,
        ''
      );
      const k = `${caseUse.environment.name}-${path.basename(caseUse.case.pathname)}-${h}`
      const endWorkspace = new URL(`./${k}/`, cacheFolder)
      const containerWorkspace = new URL(`./${k}/`, workspaceLocation)
      await mkdir(endWorkspace, { recursive: true })
      const dockerInterface = this.dockerEnvironments({
        imagen: caseUse.environment.name,
        cwd: cacheFolder,
        nameWorkspace: workspaceLocation.pathname,
      })
      await this.onceDockerInterfaceInit(dockerInterface)()
      await copyFile(caseUse.case, new URL(path.basename(caseUse.case.pathname), endWorkspace))
      await copyFile(new URL("../sample/.envuse", import.meta.url), new URL(".envuse", endWorkspace))

      await dockerInterface.exec(`cd ${containerWorkspace.pathname} && npm install ../npm/dist/envuse-latest.tgz`)
      const runStart = Date.now()
      const { childProcess: { exitCode }, out, outputs } = await dockerInterface.exec(`cd ${containerWorkspace.pathname} && node ${path.basename(caseUse.case.pathname)}`, { evaluateExitCode: () => false })
      const runEnd = Date.now()
      const latency = runEnd - runStart
      const detail: ReportRunScript = {
        exec: `node ${path.basename(caseUse.case.pathname)}`,
        latency,
        exitCode,
        out,
        outputs,
      }

      const reportSection: Record<string, ReportRunScript> = report[caseUse.environment.name] ?? {}
      reportSection[caseUse.name] = detail
      report[caseUse.environment.name] = reportSection

      dockerInterface.kill()
    }
    // for (const dockerInterface of this.dockerInterfaces.values()) {
    //   dockerInterface.kill()
    // }
    // const caseUseDirectory = this.options.caseDirectory ?? new URL("__cases__/", import.meta.url)
    // const dockerInterface = createInterface({
    //   build: {
    //     dockerfile: new URL("__cases__/Dockerfile", import.meta.url),
    //     args: {
    //       NODE_VERSIONS: this.options.versions.join(',')
    //     }
    //   },
    //   cwd: caseUseDirectory
    // })

    // try {
    //   await dockerInterface.init()

    //   for (const version of this.versions) {
    //     const scriptsReport: Record<string, ReportRunScript> = {}
    //     await dockerInterface.exec(`nvm alias default ${version}`)
    //     await dockerInterface.exec(`rm -rf node_modules`)
    //     await dockerInterface.exec("npm install /tmp/envuse-4.0.0.tgz")
    //     const nodePackage = this.options.nodePackage
    //     if (nodePackage) {
    //       if (nodePackage.type) {
    //         await dockerInterface.exec(`nvm exec 19 npm pkg set type=${JSON.stringify(nodePackage.type)}`)
    //       }
    //     }

    //     for (const caseUse of this.caseUses) {
    //       const relativePathScript = nodePath.relative(caseUseDirectory.pathname, caseUse.url.pathname)
    //       // console.log({ 'caseUseDirectory.pathname': caseUseDirectory.pathname, 'caseUse.url.pathname': caseUse.url.pathname, relativePathScript })
    //       const runStart = Date.now()
    //       const exec = `node ${relativePathScript}`
    //       const { outputs, childProcess: { exitCode }, out } = await dockerInterface.exec(exec, { evaluateExitCode: () => false })
    //       const runEnd = Date.now()
    //       const latency = runEnd - runStart;
    //       scriptsReport[caseUse.name] = { exec, latency, exitCode, out, outputs }
    //     }
    //     report[version] = scriptsReport
    //   }
    // } finally {
    //   dockerInterface.kill()
    // }

    return new Report(report);
  }
}
