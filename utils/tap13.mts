import readline from "node:readline";
import YAML from "yaml";

/** @type {import("./tap13").ParseTap13} */
export const parseTap13 = async (payload) => {
  const rl = readline.createInterface({
    input: payload,
  });

  let version;
  let plan;
  let tests = [];
  let sets = [{ tests: [] }];
  const exprPlan = /^(?<n>\d+)\.\.(?<a>\d+)$/;
  const exprOkTest = /^ok/;
  const exprNotOkTest = /^not ok/;
  let mode = "tapTest";
  let yamlBuff = [];

  rl.on("line", (line) => {
    if (mode === "YAMLBlock") {
      if (/^\s+\.\.\./.test(line)) {
        const last = tests.at(-1);
        if (last) {
          last.detail = YAML.parse(yamlBuff.join("\n"));
        }
        mode = ["tapTest"];
        yamlBuff = [];
        return;
      }
      yamlBuff.push(line);
      return;
    }

    if (/^\s+---/.test(line)) {
      mode = "YAMLBlock";
      yamlBuff = [];
      return;
    }

    if (line.startsWith("TAP version ")) {
      version = line.substring(12);
      return;
    }
    if (exprPlan.test(line)) {
      const res = exprPlan.exec(line);
      plan = [res.groups.n, res.groups.a];
      return;
    }
    if (/^ok/.test(line)) {
      tests.push({ name: line });
      return;
    }
    if (/^not ok/.test(line)) {
      tests.push({ name: line });
      return;
    }
  });

  await new Promise((resolve) => rl.once("close", resolve));

  return { version, plan, tests };
};
