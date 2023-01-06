import * as async_hooks from "async_hooks"
import * as nodeProcess from "node:process"
import * as nodeUrl from "node:url"

export const cwdCtx = new async_hooks.AsyncLocalStorage<URL>()
const defaultCWD = nodeUrl.pathToFileURL(`${nodeProcess.cwd()}/`)

export const resolveURL = (likeURL: string | URL): URL => {
  const cwd = cwdCtx.getStore() ?? defaultCWD
  if (typeof likeURL === "string") return new URL(likeURL, cwd)
  return likeURL
}
