import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {toJSON} from 'seroval'
import {ensureRoles} from '../apps/playground/src/session.server'
import {getPrisma} from '../apps/playground/src/db'
import {createSessionToken,hashSessionToken} from '@nsheth/identity'

// Run only against an explicitly selected disposable database.
if(process.env.ALLOW_INTEGRATION_TESTS!=='1')throw new Error('Set ALLOW_INTEGRATION_TESTS=1 and DATABASE_URL to a disposable database')
process.env.NODE_ENV='production'
const {default:server}=await import('../apps/playground/dist/server/server.js')
const db=getPrisma(),origin='https://integration.example'
const sources=await Promise.all((await readdir('apps/playground/dist/server/assets')).filter(n=>n.endsWith('.js')).map(n=>readFile(`apps/playground/dist/server/assets/${n}`,'utf8')))
const ids=new Map<string,string>()
for(const source of sources)for(const match of source.matchAll(/id: "([a-f0-9]{64})",\s*name: "([^"]+)"/g))ids.set(match[2],match[1])
async function call(name:string,data?:unknown,cookie?:string,method='POST'){
  const id=ids.get(name);assert.ok(id,`Missing compiled function ${name}`)
  const payload=JSON.stringify(toJSON({data})),url=new URL(`/_serverFn/${id}`,origin)
  if(method==='GET')url.searchParams.set('payload',payload)
  const response=await server.fetch(new Request(url,{method,headers:{origin,'sec-fetch-site':'same-origin','x-tsr-serverFn':'true','content-type':'application/json',...(cookie?{cookie}:{})},...(method==='POST'?{body:payload}:{})}))
  await response.text()
  return response
}
const attempt=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')
const suffix=crypto.randomUUID(),email=`integration-${suffix}@example.com`
const user=await db.user.create({data:{email}})
const token=createSessionToken(),cookie=`__Host-session=${token}`
await db.session.create({data:{userId:user.id,tokenHash:await hashSessionToken(token),expiresAt:new Date(Date.now()+600000)}})
const product=await db.product.create({data:{name:'Integration product',slug:`integration-${suffix}`,summary:'Test',description:'Test',status:'PUBLISHED',publishedAt:new Date(),forSale:true,price:10000,stock:1}})
const service=await db.service.create({data:{name:'Integration service',slug:`integration-${suffix}`,summary:'Test',description:'Test',status:'PUBLISHED',durationMinutes:60,maxAdvanceDays:3650}})
const slot=await db.availabilitySlot.create({data:{serviceId:service.id,startsAt:new Date('2030-01-01'),endsAt:new Date('2030-01-01T01:00:00Z'),capacity:1}})
const property=await db.property.create({data:{name:'Integration property',slug:`integration-${suffix}`,summary:'Test',description:'Test',location:'Test city',timezone:'UTC',status:'PUBLISHED'}})
const room=await db.roomType.create({data:{propertyId:property.id,name:'Test room',description:'Test',inventory:1,maxGuests:2,nightlyRate:10000}})
try{
  for(const name of ['getAdminProducts','getAdminBookings','getReservations','getOrders','getAccessUsers','getEnquiries','getPrivacyRequests']){
    const response=await call(name,undefined,undefined,'GET');assert.equal(response.status,401,`${name} anonymous access`)
    const forbidden=await call(name,undefined,cookie,'GET');assert.equal(forbidden.status,403,`${name} customer access`)
  }
  assert.equal((await call('createDemoIdentitySession')).status,404,'Production demo bootstrap disabled')
  const badOrigin=await server.fetch(new Request(new URL(`/_serverFn/${ids.get('requestBooking')}`,origin),{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json','x-tsr-serverFn':'true'},body:JSON.stringify(toJSON({data:{slotId:slot.id,name:'Test',email,notes:''}}))}));assert.equal(badOrigin.status,403)
  const competing=await Promise.all([call('requestBooking',{key:attempt(),slotId:slot.id,name:'Test',email,notes:''}),call('requestBooking',{key:attempt(),slotId:slot.id,name:'Test',email,notes:''})]);assert.deepEqual(competing.map(r=>r.status).sort(),[200,409])
  assert.equal(await db.bookingRequest.count({where:{slotId:slot.id}}),1)
  const stay={key:attempt(),expectedTotal:20000,roomTypeId:room.id,checkIn:'2030-01-01',checkOut:'2030-01-03',guests:1,name:'Test',email}
  const stays=await Promise.all([call('requestReservation',stay),call('requestReservation',{...stay,key:attempt()})])
  assert.deepEqual(stays.map(r=>r.status).sort(),[200,409])
  assert.equal((await call('requestReservation',{...stay,key:attempt(),expectedTotal:10000,checkIn:'2030-01-03',checkOut:'2030-01-04'})).status,200,'Exclusive checkout allows adjacent stays')
  const key=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')
  const checkout={key,lines:[{productId:product.id,quantity:1}],expectedTotal:10000,name:'Test',email,address:'Test delivery address'}
  const retries=await Promise.all([call('placeOrder',checkout),call('placeOrder',checkout)])
  assert.deepEqual(retries.map(r=>r.status),[200,200])
  assert.equal(await db.order.count({where:{email}}),1)
  assert.equal((await db.product.findUniqueOrThrow({where:{id:product.id}})).stock,0)
  assert.equal((await call('placeOrder',{...checkout,address:'Changed address for retry'})).status,409)
  const second=await call('placeOrder',{...checkout,key:'a'.repeat(64)});assert.equal(second.status,409)
  await ensureRoles()
  const adminRole=await db.role.findUniqueOrThrow({where:{key:'admin'}})
  await db.userRole.create({data:{userId:user.id,roleId:adminRole.id}})
  const appointment=await db.bookingRequest.findFirstOrThrow({where:{slotId:slot.id}})
  const repeat={key:attempt(),slotId:slot.id,name:'Test',email,notes:''}
  const alternate=await db.availabilitySlot.create({data:{serviceId:service.id,startsAt:new Date('2030-01-02'),endsAt:new Date('2030-01-02T01:00:00Z'),capacity:1}})
  assert.equal((await call('rescheduleBooking',{id:appointment.id,slotId:alternate.id,expectedVersion:appointment.version,note:'Customer requested a different day'},cookie)).status,200)
  const duplicateBooking=await Promise.all([call('requestBooking',repeat),call('requestBooking',repeat)])
  assert.deepEqual(duplicateBooking.map(r=>r.status),[200,200],'Identical booking retries reuse the request')
  assert.equal((await call('requestBooking',{...repeat,name:'Changed name'})).status,409)
  assert.equal((await call('addAvailability',{serviceId:service.id,startsAt:'2030-01-01T00:30:00Z',capacity:1},cookie)).status,409,'Overlapping service slots rejected')
  assert.equal((await call('pauseAvailability',{id:slot.id,paused:true},cookie)).status,200)
  assert.equal((await call('requestBooking',{...repeat,key:attempt()})).status,404,'Paused slots reject new requests')
  assert.equal((await call('cancelOwnRequest',{kind:'booking',id:appointment.id},cookie)).status,200)
  assert.equal((await call('cancelOwnRequest',{kind:'booking',id:appointment.id},cookie)).status,200,'Customer cancellation retry is safe')
  const heldStay=await db.reservation.findFirstOrThrow({where:{roomTypeId:room.id,checkIn:new Date(stay.checkIn)}})
  assert.equal((await call('requestReservation',{...stay,key:attempt(),checkIn:'2030-02-01',checkOut:'2030-02-03',expectedTotal:1})).status,409,'A changed stay quote requires rechecking')
  const roomInput={id:room.id,propertyId:property.id,name:room.name,description:room.description,inventory:1,maxGuests:2,nightlyRate:10000,active:true,expectedVersion:room.version}
  assert.equal((await call('saveRoom',roomInput,cookie)).status,200)
  assert.equal((await call('saveRoom',roomInput,cookie)).status,409,'Stale room edits rejected')
  assert.equal((await call('cancelOwnRequest',{kind:'reservation',id:heldStay.id},cookie)).status,200)
  const order=await db.order.findFirstOrThrow({where:{email}})
  assert.equal((await call('updateOrder',{id:order.id,status:'FULFILLED',note:'Should require payment'},cookie)).status,409)
  assert.equal((await call('updateOrder',{id:order.id,status:'CANCELLED',note:'Integration cancellation'},cookie)).status,200)
  assert.equal((await db.product.findUniqueOrThrow({where:{id:product.id}})).stock,1)
  assert.equal((await call('updateOrder',{id:order.id,status:'CANCELLED',note:'Duplicate cancellation'},cookie)).status,409)
  const stock=await db.product.findUniqueOrThrow({where:{id:product.id}})
  const adjustment={productId:product.id,expectedVersion:stock.version,expectedStock:stock.stock,stock:3,price:10000,category:'Test',imageUrl:'',forSale:true,reason:'Integration stock count'}
  assert.equal((await call('saveProductSale',adjustment,cookie)).status,200)
  assert.equal((await call('saveProductSale',adjustment,cookie)).status,409,'Stale stock form cannot overwrite latest balance')
  const current=await db.product.findUniqueOrThrow({where:{id:product.id}})
  const update={currentSlug:product.slug,expectedVersion:current.version,name:product.name,slug:product.slug,summary:'Detailed product',description:'Validated specifications and gallery',status:'PUBLISHED',sku:'test-'+suffix,gallery:[{url:'https://example.com/image.jpg',alt:'Example product'}],specifications:[{label:'Material',value:'Ceramic'}]}
  assert.equal((await call('updateAdminProduct',update,cookie)).status,200)
  assert.equal((await call('updateAdminProduct',update,cookie)).status,409,'Stale content form rejected')
  assert.equal((await call('deleteAdminProduct',{slug:product.slug},cookie)).status,409,'Stock/order history preserved')
  assert.equal((await call('createProductOption',{parentId:product.id,label:'Blue / Large',sku:'option-'+suffix},cookie)).status,200)
  const option=await db.product.findFirstOrThrow({where:{parentId:product.id}})
  await db.product.update({where:{id:option.id},data:{status:'PUBLISHED',publishedAt:new Date(),forSale:true,stock:1}})
  assert.equal((await call('quoteCart',[{productId:product.id,quantity:1}],undefined,'GET')).status,409,'A family with active options requires an option')
  assert.equal((await call('quoteCart',[{productId:option.id,quantity:1}],undefined,'GET')).status,200)
  assert.equal((await call('createProductOption',{parentId:option.id,label:'Nested',sku:'nested-'+suffix},cookie)).status,409,'No nested option families')
  const closedKey=key.split('').reverse().join('')
  assert.equal((await call('recoverCheckout',{key:closedKey})).status,200)
  assert.equal((await call('placeOrder',{...checkout,key:closedKey,email:'closed-'+email})).status,409,'A recovered absent attempt cannot arrive late')
  await db.closedCheckoutKey.delete({where:{requestHash:await hashSessionToken(closedKey)}})
  const edited=await db.product.findUniqueOrThrow({where:{id:product.id}})
  assert.equal((await call('changeProductLifecycle',{id:product.id,expectedVersion:edited.version,action:'retire'},cookie)).status,200)
  const retired=await server.fetch(new Request(new URL(`/catalogue/${product.slug}`,origin)))
  await retired.text()
  assert.equal(retired.status,404,'Retired product is not public')
  const hiddenOption=await server.fetch(new Request(new URL(`/shop/${option.slug}`,origin)))
  await hiddenOption.text()
  assert.equal(hiddenOption.status,404,'Retired parent hides options')
  assert.equal(await db.inventoryMovement.count({where:{productId:product.id}}),3,'Order, cancellation and adjustment recorded')
  console.log('Passed: anonymous and role isolation, production bootstrap, CSRF, concurrent booking and stays, adjacent stays, checkout idempotency, payload binding, stock limits, fulfilment policy, stock movement history, stale edits, and retirement.')
}finally{
  const fixtureStays=await db.reservation.findMany({where:{roomTypeId:room.id},select:{id:true}})
  await db.auditEvent.deleteMany({where:{entityId:{in:fixtureStays.map(row=>row.id)}}})
  await db.reservation.deleteMany({where:{roomTypeId:room.id}})
  await db.property.delete({where:{id:property.id}})
  const fixtureBookings=await db.bookingRequest.findMany({where:{slot:{serviceId:service.id}},select:{id:true}})
  await db.auditEvent.deleteMany({where:{entityId:{in:fixtureBookings.map(row=>row.id)}}})
  await db.bookingRequest.deleteMany({where:{slot:{serviceId:service.id}}})
  await db.service.delete({where:{id:service.id}})
  const fixtureOrders=await db.order.findMany({where:{email},select:{id:true}})
  await db.auditEvent.deleteMany({where:{entityId:{in:fixtureOrders.map(o=>o.id)}}})
  await db.order.deleteMany({where:{email}})
  await db.inventoryMovement.deleteMany({where:{productId:product.id}})
  await db.auditEvent.deleteMany({where:{OR:[{entityId:product.id},{entityType:'order',summary:'Integration cancellation'}]}})
  await db.product.deleteMany({where:{parentId:product.id}})
  await db.product.delete({where:{id:product.id}})
  await db.user.delete({where:{id:user.id}})
  await db.$disconnect()
}
