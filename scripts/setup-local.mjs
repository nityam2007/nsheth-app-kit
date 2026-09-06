import {spawn} from 'node:child_process'
import {createRequire} from 'node:module'
import {resolve,dirname} from 'node:path'
import {root,localDatabase,checkDatabase} from './local-database.mjs'
const database=await localDatabase({start:true})
try{
 const prisma=resolve(dirname(createRequire(new URL('../apps/playground/package.json',import.meta.url)).resolve('prisma/package.json')),'build/index.js')
 for(const args of [['generate'],['migrate','deploy']])await new Promise((resolveTask,reject)=>{
  const child=spawn(process.execPath,[prisma,...args],{cwd:resolve(root,'apps/playground'),env:database.env,stdio:'inherit',windowsHide:true})
  child.on('error',reject);child.on('exit',code=>code===0?resolveTask():reject(new Error('Setup failed; no database reset was performed.')))
 })
 await checkDatabase(database.env)
 console.log('Setup complete. Run npm run dev.')
}finally{await database.close()}
