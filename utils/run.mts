import * as docker_child_process from "docker_child_process";
import * as resolveUrl from "./resolve-url.mjs";


interface Step {
  exec: string
}

interface Job {
  image?: string
  build?: {
    imageName?: string;
    dockerfile: URL | string;
    cwd?: URL | string;
  }
  steps: Step[]
}

interface Plan {
  cwd: URL | string
  jobs: Record<string, Job>
}

class JobParsed {
  readonly dockerInterface: ReturnType<typeof docker_child_process.createInterface>
  steps: Step[];
  dockerInterfaceOptions: { imagen: string | undefined; build: { imageName: string; cwd: URL | undefined; dockerfile: URL; } | undefined; };

  constructor(job: Job) {
    let build;
    if (job.build) {
      const dockerfile = resolveUrl.resolveURL(job.build.dockerfile);
      build = {
        imageName: dockerfile.toString().replace(/\W/g, '-').toLowerCase(),
        cwd: job.build.cwd ? resolveUrl.resolveURL(job.build.cwd) : undefined,
        dockerfile,
      }
    }

    this.dockerInterfaceOptions = {
      imagen: job.image,
      build,
    }
    this.dockerInterface = docker_child_process.createInterface(this.dockerInterfaceOptions)
    this.steps = job.steps
  }
}

class PlanParsed {
  readonly cwd: URL
  readonly jobs: Record<string, JobParsed>

  constructor(plan: Plan) {
    this.cwd = resolveUrl.resolveURL(plan.cwd)
    this.jobs = resolveUrl.cwdCtx.run(
      this.cwd,
      () =>
        Object.fromEntries(Object.entries(plan.jobs).map(([k, job]) => [k, new JobParsed(job)]))
    )

  }
}

export class PlanManager {
  readonly planParsed: PlanParsed;

  constructor(plan: Plan) {
    this.planParsed = new PlanParsed(plan)
  }

  async run() {
    for (const [jobName, job] of Object.entries(this.planParsed.jobs)) {
      console.log('# Run JOB', jobName)
      try {
        await job.dockerInterface.init()

        for (const step of job.steps) {
          await job.dockerInterface.exec(step.exec)
        }
      } finally {
        job.dockerInterface.kill()
      }
    }
  }
}

export const createPlanManager = (plan: Plan) => new PlanManager(plan)



