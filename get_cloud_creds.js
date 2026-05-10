const { MongoClient } = require('mongodb');

async function main() {
  const uriAuth = 'mongodb+srv://3bdhmeed_db_user:JmnfFLiS317Xn4hN@cluster0.hx9xs1i.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0';
  const uriRest = 'mongodb+srv://3bdhmeed_db_user:JmnfFLiS317Xn4hN@cluster0.hx9xs1i.mongodb.net/restaurant_db?retryWrites=true&w=majority&appName=Cluster0';

  try {
    const clientAuth = new MongoClient(uriAuth);
    await clientAuth.connect();
    const dbAuth = clientAuth.db();
    
    console.log("=== CUSTOMERS (authdb) ===");
    const customers = await dbAuth.collection('customers').find().limit(3).toArray();
    customers.forEach(c => console.log(`Email: ${c.email} | Name: ${c.firstName} ${c.lastName}`));
    
    console.log("\n=== SUPER ADMINS (authdb) ===");
    const superAdmins = await dbAuth.collection('superadmins').find().limit(3).toArray();
    superAdmins.forEach(s => console.log(`Email: ${s.email}`));
    
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
