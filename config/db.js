import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use environment variable or fallback to hardcoded connection string
    const mongoURI = process.env.MONGODB_URI || 
      "mongodb+srv://nooserkhandeshwali_db_user:x4DBWcJpz94eNhwl@cluster0.7bptzru.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";
    
    // Add database name to connection string if not present
    const connectionString = mongoURI.includes('/?') 
      ? mongoURI.replace('/?', '/geotree?') 
      : mongoURI;

    const conn = await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB connected successfully!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📍 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes('IP')) {
      console.error("\n🔒 IP Whitelist Issue:");
      console.error("Your IP address is not whitelisted in MongoDB Atlas.");
      console.error("Please follow these steps:");
      console.error("1. Go to: https://cloud.mongodb.com/");
      console.error("2. Select your cluster");
      console.error("3. Click 'Network Access' in the left menu");
      console.error("4. Click 'Add IP Address'");
      console.error("5. Click 'Allow Access from Anywhere' (0.0.0.0/0) for development");
      console.error("   OR add your current IP address");
      console.error("6. Wait 1-2 minutes for changes to take effect");
    }
    
    if (error.message.includes('authentication')) {
      console.error("\n🔐 Authentication Issue:");
      console.error("Please check your MongoDB username and password in .env file");
    }
    
    console.error("\n💡 Tip: Make sure MONGODB_URI is set in your .env file");
    process.exit(1);
  }
};

export default connectDB;