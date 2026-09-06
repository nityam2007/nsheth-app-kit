import {readFile,readdir} from 'node:fs/promises'
import {createConnection,createServer} from 'node:net'
import {execFile,spawn} from 'node:child_process'
import {promisify} from 'node:util'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parse} from 'dotenv'
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const exec=promisify(execFile)
export async function configuration(){
 const file=await readFile(resolve(root,'apps/playground/.env.local'),'utf8').catch(()=>readFile(resolve(root,'apps/playground/.env.example'),'utf8'))
 return {...parse(file),...process.env}
}
export async function dockerTransport(){
 try{await exec('docker',['info','--format','{{.ServerVersion}}'],{windowsHide:true,timeout:10000});return {command:'docker',prefix:[]}}
 catch{
  if(process.platform!=='win32')throw new Error('Docker is unavailable. Start Docker or configure an existing PostgreSQL DATABASE_URL.')
  const distro=process.env.DEV_WSL_DISTRO||'Ubuntu'
  await exec('wsl',['-d',distro,'--','docker','info','--format','{{.ServerVersion}}'],{windowsHide:true,timeout:15000}).catch(()=>{throw new Error('No Docker engine available through Windows or WSL. Start your local Docker engine.')})
  const {stdout}=await exec('wsl',['-d',distro,'--','wslpath','-a',root.replaceAll('\\','/')],{windowsHide:true})
  return {command:'wsl',prefix:['-d',distro,'--cd',stdout.trim(),'--','docker']}
 }
}
export function tcpReachable(host,port){return new Promise(resolve=>{const socket=createConnection({host,port});let done=false;const finish=value=>{if(done)return;done=true;socket.destroy();resolve(value)};socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));socket.setTimeout(1200,()=>finish(false))})}
export async function localDatabase({start=false}={}){
 const env=await configuration(),url=new URL(env.DATABASE_URL||'')
 if(!['postgres:','postgresql:'].includes(url.protocol))throw new Error('DATABASE_URL must use PostgreSQL.')
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname)
 const managed=env.DEV_DATABASE_MODE==='compose'||(!env.DEV_DATABASE_MODE&&url.pathname==='/nsheth_app_kit'&&url.username==='nsheth')
 if(!managed){if(await tcpReachable(url.hostname,Number(url.port||5432)))return {env,close:async()=>{}};throw new Error('Configured database is unreachable. Use DEV_DATABASE_MODE=compose only for the bundled local database.')}
 const availableTransport=process.platform==='win32'&&local?await dockerTransport().catch(()=>null):null
 const needsRelay=availableTransport?.command==='wsl'
 if(!needsRelay&&await tcpReachable(url.hostname,Number(url.port||5432)))return {env,close:async()=>{}}
 if(!local)throw new Error('Configured database is unreachable. Check the host/network; configuration was not modified.')
 const transport=availableTransport??await dockerTransport()
 const run=args=>exec(transport.command,[...transport.prefix,...args],{cwd:root,windowsHide:true,timeout:60000,maxBuffer:1024*1024})
 if(start)await run(['compose','-f','compose.yaml','up','-d','--wait','postgres'])
 if(!needsRelay&&await tcpReachable(url.hostname,Number(url.port||5432)))return {env,close:async()=>{}}
 const {stdout}=await run(['compose','-f','compose.yaml','ps','-q','postgres'])
 const id=stdout.trim();if(!/^[a-f0-9]{12,64}$/.test(id))throw new Error('Local PostgreSQL is not running. Run npm run dev:local.')
 await run(['exec',id,'sh','-c','command -v nc']).catch(()=>{throw new Error('The local PostgreSQL container requires nc for the Windows loopback relay.')})
 const children=new Set(),sockets=new Set()
 const server=createServer(socket=>{
  sockets.add(socket)
  const child=spawn(transport.command,[...transport.prefix,'exec','-i',id,'nc','127.0.0.1','5432'],{windowsHide:true,stdio:['pipe','pipe','ignore']})
  children.add(child)
  child.on('error',()=>socket.destroy());child.stdin.on('error',()=>socket.destroy())
  child.on('close',()=>{children.delete(child);socket.destroy()})
  socket.on('error',()=>child.kill());socket.on('close',()=>{sockets.delete(socket);child.kill()})
  socket.pipe(child.stdin);child.stdout.pipe(socket)
 })
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)})
 url.hostname='127.0.0.1';url.port=String(server.address().port)
 console.log('PostgreSQL: managed Windows loopback relay enabled (no public listener).')
 return {env:{...env,DATABASE_URL:url.toString()},close:async()=>{for(const socket of sockets)socket.destroy();for(const child of children)child.kill();await new Promise(resolve=>server.close(resolve))}}
}
export async function checkDatabase(env){
 const {Client}=await import('pg');const client=new Client({connectionString:env.DATABASE_URL,connectionTimeoutMillis:5000,query_timeout:5000})
 try{
  await client.connect()
  const {rows}=await client.query('SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"')
  const expected=(await readdir(resolve(root,'apps/playground/prisma/migrations'),{withFileTypes:true})).filter(f=>f.isDirectory()).map(f=>f.name)
  const applied=new Set(rows.filter(r=>r.finished_at&&!r.rolled_back_at).map(r=>r.migration_name))
  const missing=expected.filter(name=>!applied.has(name));if(missing.length)throw new Error('Pending migrations: '+missing.join(', ')+'. Run npm run db:local -- deploy.')
  console.log(`PostgreSQL: query succeeded; ${expected.length} migrations applied.`)
 }catch(error){if(error.message?.startsWith('Pending migrations:'))throw error;throw new Error('PostgreSQL authentication/schema check failed. Check DATABASE_URL and run npm run db:local -- deploy.')}
 finally{await client.end().catch(()=>{})}
}
