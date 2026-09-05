import {createServer} from 'node:http'
import {createReadStream} from 'node:fs'
import {stat} from 'node:fs/promises'
import {resolve,sep,extname} from 'node:path'
import {Readable} from 'node:stream'
import {fileURLToPath} from 'node:url'

process.env.NODE_ENV ??= 'production'
const root=resolve(fileURLToPath(new URL('../apps/playground/dist/client/',import.meta.url)))
const {default:app}=await import('../apps/playground/dist/server/server.js')
const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.json':'application/json','.txt':'text/plain'}
const server=createServer(async(req,res)=>{
  try{
    const origin=process.env.PUBLIC_ORIGIN??`http://${req.headers.host??'localhost'}`
    const url=new URL(req.url??'/',origin)
    const candidate=resolve(root,'.'+decodeURIComponent(url.pathname))
    if(candidate.startsWith(root+sep)&&['GET','HEAD'].includes(req.method??'GET')){
      const file=await stat(candidate).catch(()=>null)
      if(file?.isFile()){
        res.writeHead(200,{'Content-Type':types[extname(candidate)]??'application/octet-stream','Content-Length':file.size,'Cache-Control':url.pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'public, max-age=300','X-Content-Type-Options':'nosniff'})
        if(req.method==='HEAD')res.end();else createReadStream(candidate).pipe(res)
        return
      }
    }
    if(url.pathname.startsWith('/assets/')){res.writeHead(404);res.end('Not found');return}
    const headers=new Headers()
    for(const [name,value]of Object.entries(req.headers)){if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(','):value)}
    const request=new Request(url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method??'GET')?{body:Readable.toWeb(req),duplex:'half'}:{})})
    const response=await app.fetch(request)
    res.statusCode=response.status
    for(const [name,value]of response.headers){if(name!=='set-cookie')res.setHeader(name,value)}
    const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('set-cookie',cookies)
    if(response.body&&req.method!=='HEAD')Readable.fromWeb(response.body).pipe(res);else res.end()
  }catch{
    if(!res.headersSent)res.writeHead(500,{'Content-Type':'text/plain'})
    res.end('Unable to serve this request.')
  }
})
server.listen(Number(process.env.PORT??3000),process.env.HOST??'0.0.0.0',()=>console.log(`App ready on port ${process.env.PORT??3000}`))
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)))
