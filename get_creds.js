const { MongoClient } = require('mongodb');

async function main() {
  const uriAuth = 'mongodb://root:example@localhost:27017/auth_db?authSource=admin';
  const uriRest = 'mongodb://root:example@localhost:27017/restaurant_db?authSource=admin';

  try {
    const clientAuth = new MongoClient(uriAuth);
    await clientAuth.connect();
    const dbAuth = clientAuth.db();
    
    console.log("=== CUSTOMERS (auth_db) ===");
    const customers = await dbAuth.collection('customers').find().limit(3).toArray();
    customers.forEach(c => console.log(`Email: ${c.email} | Role: customer`));
    
    console.log("\n=== SUPER ADMINS (auth_db) ===");
    const superAdmins = await dbAuth.collection('superadmins').find().limit(3).toArray();
    superAdmins.forEach(s => console.log(`Email: ${s.email} | Role: superadmin`));
    
    await clientAuth.close();

    const clientRest = new MongoClient(uriRest);
    await clientRest.connect();
    const dbRest = clientRest.db();

    console.log("\n=== RESTAURANT ADMINS (restaurant_db) ===");
    const restaurants = await dbRest.collection('restaurants').find().limit(3).toArray();
    restaurants.forEach(r => console.log(`Email: ${r.admin.email} | Restaurant: ${r.name}`));

    await clientRest.close();
  } catch(e) {
    console.error(e);
  }
}
main();
