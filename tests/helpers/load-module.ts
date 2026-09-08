import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

/** Run the real module with explicit boundaries; never import a live service. */
export function loadModule<T>(file: string, mocks: Record<string, unknown>): T {
  const filename = path.resolve(file);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const module = { exports: {} };
  const requireMock = (name: string) => {
    if (Object.prototype.hasOwnProperty.call(mocks, name)) return mocks[name];
    throw new Error(`Unmocked dependency in ${file}: ${name}`);
  };
  new Function("require", "module", "exports", "console", outputText)(
    requireMock,
    module,
    module.exports,
    { log() {}, error() {}, warn() {} }
  );
  return module.exports as T;
}
