export interface Options {
  indent?: number;
}

export abstract class Reporter {
  abstract toString(options?: Options): string
}