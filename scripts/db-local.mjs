import {createRequire} from 'node:module'
import {spawn} from 'node:child_process'
import {resolve,dirname} from 'node:path'
import {root,localDatabase} from './local-database.mjs'
const action=process.argv[2]||'deploy'
if(!['deploy','generate'].includes(action))throw new Error('Usage: npm run db:local -- deploy|generate')
const database=await localDatabase({start:true})
try{const child=spawn(process.execPath,[resolve(dirname(createRequire(new URL('../apps/playground/package.json',import.meta.url)).resolve('prisma/package.json')),'build/index.js'),...(action==='deploy'?['migrate','deploy']:['generate'])],{cwd:resolve(root,'apps/playground'),env:database.env,stdio:'inherit',windowsHide:true});process.exitCode=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',code=>resolve(code??1))})}finally{await database.close()}
