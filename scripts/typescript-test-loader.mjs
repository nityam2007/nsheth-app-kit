// Node-only test loader. Transpile application TS/TSX in-process; typecheck separately.
import { registerHooks } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
const app = new URL('../apps/playground/src/', import.meta.url),
  packages = new URL('../packages/', import.meta.url)
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('@/'))
      specifier = new URL(specifier.slice(2), app).href
    if (
      (specifier.startsWith('.') || specifier.startsWith('file:')) &&
      context.parentURL
    ) {
      const url = new URL(specifier, context.parentURL)
      if (!existsSync(fileURLToPath(url)))
        for (const candidate of [
          url.href + '.ts',
          url.href + '.tsx',
          url.href.replace(/\.js$/, '.ts'),
        ])
          if (existsSync(fileURLToPath(candidate)))
            return { url: candidate, shortCircuit: true }
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.startsWith(app.href) && url.endsWith('.json'))
      return {
        format: 'module',
        shortCircuit: true,
        source: 'export default ' + readFileSync(fileURLToPath(url), 'utf8'),
      }
    if (
      (url.startsWith(app.href) || url.startsWith(packages.href)) &&
      /\.tsx?$/.test(url)
    ) {
      const source = readFileSync(fileURLToPath(url), 'utf8').replaceAll(
        'import.meta.env',
        '({DEV:false})',
      )
      return {
        format: 'module',
        shortCircuit: true,
        source: ts.transpileModule(source, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      }
    }
    return next(url, context)
  },
})
