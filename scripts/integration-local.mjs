import {spawn} from 'node:child_process'
import {createRequire} from 'node:module'
import {resolve,dirname} from 'node:path'
import {Client} from 'pg'
import {localDatabase,root} from './local-database.mjs'
const database=await localDatabase(),url=new URL(database.env.DATABASE_URL)
const name='nsheth_integration'
if(url.pathname==='/'+name)throw new Error('Normal app config must not point at the integration database')
const client=new Client({connectionString:database.env.DATABASE_URL})
const run=(args,env,cwd=root)=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,args,{env,stdio:'inherit',cwd,windowsHide:true});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error('Verification command failed')))})
try{
 await client.connect();if(!(await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[name])).rowCount)await client.query('CREATE DATABASE nsheth_integration')
 await client.end();url.pathname='/'+name
 const env={...database.env,DATABASE_URL:url.toString(),ALLOW_INTEGRATION_TESTS:'1'}
 const prisma=resolve(dirname(createRequire(new URL('../apps/playground/package.json',import.meta.url)).resolve('prisma/package.json')),'build/index.js')
 await run([prisma,'migrate','deploy'],env,resolve(root,'apps/playground'))
 await run(['--import','tsx','scripts/integration.mts'],env)
}finally{await client.end().catch(()=>{});await database.close()}
