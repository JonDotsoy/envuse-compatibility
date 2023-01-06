import { parse } from "envuse"

const a = parse(".envuse")
const b = parse("2.envuse")

console.log(a)
console.log(b)
