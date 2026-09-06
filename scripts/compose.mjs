import {readdir,readFile,writeFile,mkdir,copyFile,lstat} from 'node:fs/promises'
import {resolve,dirname,relative,join,sep,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const manifest=JSON.parse(await readFile(join(root,'blocks.manifest.json'),'utf8'))
const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1]
if(args.includes('--list')){
 for(const [id,block] of Object.entries(manifest.blocks))console.log(`${id}: ${block.routes.join(', ')}; dependencies: ${block.dependencies.join(', ')||'kernel only'}`)
 process.exit(0)
}
if(!args.includes('--out')||!value('--out')||value('--out').startsWith('--'))throw new Error('Use npm run compose -- --modules content,product --out ../my-project [--name "My project"]')
const selected=new Set(),requested=args.includes('--modules')?value('--modules').split(','):Object.keys(manifest.blocks)
function add(id){if(selected.has(id))return;const block=manifest.blocks[id];if(!block)throw new Error(`Unknown block: ${id}`);selected.add(id);block.dependencies.forEach(add)}
requested.forEach(id=>add(id.trim()))
const destination=resolve(root,value('--out')),rel=relative(root,destination)
if(rel===''||(!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep)))throw new Error('Choose a fresh directory outside this repository')
const existing=await lstat(destination).catch(error=>{if(error.code!=='ENOENT')throw error;return null})
if(existing)throw new Error('Destination already exists. Export never overwrites files.')
const allowedRoots=['apps','packages','scripts','docs','.opencode/skills']
const rootFiles=['package.json','package-lock.json','compose.yaml','Dockerfile','.dockerignore','.gitignore','RULES.md','README.md','CHANGELOG.md','LICENSE','blocks.manifest.json']
const files=[]
async function collect(directory){
 for(const entry of await readdir(join(root,directory),{withFileTypes:true})){
  if(entry.isSymbolicLink())continue
  if(['node_modules','dist','.output','.tanstack','.wrangler','.git','test-results','playwright-report','.vscode'].includes(entry.name))continue
  if(entry.name.startsWith('.env')&&entry.name!=='.env.example')continue
  const path=join(directory,entry.name)
  if(entry.isDirectory())await collect(path)
  else if(entry.isFile()&&!entry.name.endsWith('.log'))files.push(path)
 }
}
for(const directory of allowedRoots)await collect(directory)
for(const file of rootFiles)if(await lstat(join(root,file)).catch(()=>null))files.push(file)
await mkdir(destination,{recursive:true})
for(const file of files){const target=join(destination,file);await mkdir(dirname(target),{recursive:true});await copyFile(join(root,file),target)}
const settingsPath=join(destination,'apps/playground/src/app.settings.json')
const settings=JSON.parse(await readFile(settingsPath,'utf8'))
settings.enabledModules=[...selected]
if(args.includes('--name'))settings.name=value('--name')
await writeFile(settingsPath,JSON.stringify(settings,null,2)+'\n')
const projectId='app-'+crypto.randomUUID().slice(0,8),port=5400+Math.floor(Math.random()*1000)
const composePath=join(destination,'compose.yaml')
await writeFile(composePath,(await readFile(composePath,'utf8')).replace('name: nsheth-app-kit','name: '+projectId).replace('127.0.0.1:5432:5432',`127.0.0.1:${port}:5432`))
const examplePath=join(destination,'apps/playground/.env.example')
await writeFile(examplePath,(await readFile(examplePath,'utf8')).replaceAll('localhost:5432',`localhost:${port}`).replaceAll('127.0.0.1:5432',`127.0.0.1:${port}`)+'\nDEV_DATABASE_MODE=compose\n')

await writeFile(join(destination,'COMPOSITION.md'),`# Your configured app\n\nEnabled blocks: ${[...selected].join(', ')}.\n\nAll existing source is retained for adaptation. Disabled blocks reject new route and server-function access; existing account history and signed payment callbacks remain available. This is configuration, not physical code removal.\n\n1. Run npm ci.\n2. Configure apps/playground/.env.local from .env.example with a database owned by this project. Never reuse a production database for experiments.\n3. Run npm run setup, then npm run dev.\n4. Configure branding, business policies and providers; see docs/COMPOSITION.md.\n5. Run npm run typecheck, npm test and npm run build.\n`)
console.log(`Exported ${files.length} source/configuration files to ${destination}. Enabled: ${[...selected].join(', ')}. No environment secrets, dependencies, build output or Git history copied.`)
