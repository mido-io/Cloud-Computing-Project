const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uriRest = 'mongodb+srv://3bdhmeed_db_user:JmnfFLiS317Xn4hN@cluster0.hx9xs1i.mongodb.net/restaurantdb?retryWrites=true&w=majority&appName=Cluster0';

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const clientRest = new MongoClient(uriRest);
    await clientRest.connect();
    const dbRest = clientRest.db();

    await dbRest.collection('superadmins').updateOne(
      { email: 'admin@skydish.com' },
      { $set: { name: 'Super Admin', email: 'admin@skydish.com', password: hashedPassword } },
      { upsert: true }
    );
    console.log("Seeded super admin in restaurantdb: admin@skydish.com / password123");

    await clientRest.close();
  } catch(e) {
    console.error(e);
  }
}
main();
