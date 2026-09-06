import assert from 'node:assert/strict'
import {toJSON} from 'seroval'
const origin=process.env.TEST_URL||'http://localhost:3000'
let cookie=''
const ids=new Map<string,string>()
async function call(file:string,name:string,method='GET',data?:unknown){
 if(!ids.has(name)){
  const response=await fetch(`${origin}/src/${file}.functions.ts`)
  assert.equal(response.status,200,'Development server module must be available')
  const source=await response.text()
  for(const block of source.split('export const ')){const name=block.match(/^(\w+) =/)?.[1],id=block.match(/createClientRpc\("([^"]+)"\)/)?.[1];if(name&&id)ids.set(name,id)}
 }
 const id=ids.get(name);assert.ok(id,`Missing ${name}`)
 const payload=JSON.stringify(toJSON({data})),url=new URL(`/_serverFn/${id}`,origin)
 if(method==='GET')url.searchParams.set('payload',payload)
 return fetch(url,{method,headers:{origin,cookie,'x-tsr-serverFn':'true','content-type':'application/json'},...(method==='POST'?{body:payload}:{})})
}
for(const path of ['/','/login','/blog','/catalogue','/services','/stays','/shop','/shop/cart','/privacy']){
 const response=await fetch(origin+path);assert.equal(response.status,200,path)
 const html=await response.text();assert.ok(!html.includes('Invalid `getPrisma')&&!html.includes('Something needs attention'),path+' must render content')
 assert.equal(response.headers.get('x-content-type-options'),'nosniff')
}
for(const path of ['/unknown-page','/catalogue/not-a-published-product','/services/not-a-service','/stays/not-a-property'])assert.equal((await fetch(origin+path)).status,404,path)
assert.equal((await call('product','getAdminProducts')).status,401)
const login=await call('identity','createDemoIdentitySession','POST');assert.equal(login.status,200)
cookie=login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');assert.ok(cookie)
for(const path of ['/admin','/admin/products','/admin/posts','/admin/services','/admin/properties','/admin/orders','/admin/bookings','/admin/reservations','/admin/access','/admin/privacy','/account']){
 const response=await fetch(origin+path,{headers:{cookie},redirect:'manual'});assert.equal(response.status,200,path)
 const html=await response.text();assert.ok(!html.includes('Something needs attention')&&!html.includes('data service is unavailable'),path+' must render')
}
console.log('HTTP smoke passed: public routes, missing resources, anonymous isolation, signed-in admin modules, account and security headers. No browser used.')
