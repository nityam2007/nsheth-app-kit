import {localDatabase,checkDatabase} from './local-database.mjs'
let database
try{database=await localDatabase();await checkDatabase(database.env);console.log('Local data setup is ready. Run npm run dev:local if the relay was needed.')}
catch(error){console.error(error instanceof Error?error.message:'Local setup check failed');process.exitCode=1}
finally{await database?.close()}
