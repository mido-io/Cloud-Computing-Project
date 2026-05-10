const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uriAuth = 'mongodb+srv://3bdhmeed_db_user:JmnfFLiS317Xn4hN@cluster0.hx9xs1i.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0';
  const uriRest = 'mongodb+srv://3bdhmeed_db_user:JmnfFLiS317Xn4hN@cluster0.hx9xs1i.mongodb.net/restaurant_db?retryWrites=true&w=majority&appName=Cluster0';

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const clientAuth = new MongoClient(uriAuth);
    await clientAuth.connect();
    const dbAuth = clientAuth.db();
    
    // Create a guaranteed Super Admin
    await dbAuth.collection('superadmins').updateOne(
      { email: 'admin@skydish.com' },
      { $set: { email: 'admin@skydish.com', password: hashedPassword } },
      { upsert: true }
    );
    console.log("Seeded super admin: admin@skydish.com / password123");
    
    // Create a guaranteed Delivery User
    await dbAuth.collection('delivery').updateOne(
      { email: 'driver@skydish.com' },
      { $set: { 
          firstName: 'Fast', lastName: 'Driver',
          email: 'driver@skydish.com', password: hashedPassword,
          phone: '1234567890', vehicleType: 'Motorcycle', licenseNumber: 'DL12345'
      } },
      { upsert: true }
    );
    console.log("Seeded delivery user: driver@skydish.com / password123");
    
    await clientAuth.close();

    // Create a guaranteed Restaurant
    const clientRest = new MongoClient(uriRest);
    await clientRest.connect();
    const dbRest = clientRest.db();

    await dbRest.collection('restaurants').updateOne(
      { "admin.email": 'restaurant@skydish.com' },
      { $set: { 
          name: "SkyDish Test Kitchen",
          ownerName: "Chef John",
          location: "Downtown",
          contactNumber: "0987654321",
          admin: { email: 'restaurant@skydish.com', password: hashedPassword },
          availability: true
      } },
      { upsert: true }
    );
    console.log("Seeded restaurant admin: restaurant@skydish.com / password123");

    await clientRest.close();
  } catch(e) {
    console.error(e);
  }
}
main();
