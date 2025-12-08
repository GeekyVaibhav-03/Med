require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medwatch';

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherHusbandName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'discharged', 'critical'], default: 'active' },
  mdrStatus: { type: String, enum: ['negative', 'positive', 'pending'], default: 'negative' },
  hospital: { type: String, default: 'myhospital' },
  ward: String,
  bedNumber: String,
  rfidTag: String
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

const patientsData = [
  { sno: 1, fullName: "Rohan Verma", fatherHusbandName: "Suresh Verma", gender: "Male", age: 28, address: "MG Road, Indore, MP", mobileNumber: "9876543210", aadharNumber: "4523 5689 2314" },
  { sno: 2, fullName: "Priya Sharma", fatherHusbandName: "Rajesh Sharma", gender: "Female", age: 24, address: "Shanti Nagar, Bhopal, MP", mobileNumber: "9123456780", aadharNumber: "6589 2345 7789" },
  { sno: 3, fullName: "Sunita Patel", fatherHusbandName: "Husband: Harish Patel", gender: "Female", age: 36, address: "Anand Colony, Ahmedabad, Gujarat", mobileNumber: "9988776655", aadharNumber: "3456 7812 3490" },
  { sno: 4, fullName: "Aman Singh", fatherHusbandName: "Raghav Singh", gender: "Male", age: 32, address: "Civil Lines, Kanpur, UP", mobileNumber: "9090901122", aadharNumber: "5678 9988 1122" },
  { sno: 5, fullName: "Meena Gupta", fatherHusbandName: "Husband: Arun Gupta", gender: "Female", age: 40, address: "Patel Chowk, Jaipur, Rajasthan", mobileNumber: "9098765432", aadharNumber: "7823 1144 9900" },
  { sno: 6, fullName: "Aditya Mishra", fatherHusbandName: "Mahesh Mishra", gender: "Male", age: 19, address: "Old City Road, Varanasi, UP", mobileNumber: "9812345678", aadharNumber: "9934 5566 7788" },
  { sno: 7, fullName: "Kavita Joshi", fatherHusbandName: "Husband: Mukesh Joshi", gender: "Female", age: 29, address: "Rajendra Nagar, Pune, Maharashtra", mobileNumber: "7878784545", aadharNumber: "6678 2233 9901" },
  { sno: 8, fullName: "Deepak Yadav", fatherHusbandName: "Manish Yadav", gender: "Male", age: 45, address: "Sector 21, Gurugram, Haryana", mobileNumber: "9000012345", aadharNumber: "5566 7788 3344" },
  { sno: 9, fullName: "Neha Tiwari", fatherHusbandName: "Rajendra Tiwari", gender: "Female", age: 22, address: "Lakshmi Nagar, Nagpur, Maharashtra", mobileNumber: "9123001122", aadharNumber: "8899 2211 7700" },
  { sno: 10, fullName: "Rajesh Kumar", fatherHusbandName: "Sohan Lal", gender: "Male", age: 50, address: "Gandhi Nagar, Delhi", mobileNumber: "9998887776", aadharNumber: "2233 4455 6677" },
  { sno: 11, fullName: "Anjali Deshmukh", fatherHusbandName: "Shankar Deshmukh", gender: "Female", age: 27, address: "Shivaji Nagar, Mumbai, MH", mobileNumber: "9822211234", aadharNumber: "5577 8899 1122" },
  { sno: 12, fullName: "Harish Babu", fatherHusbandName: "Raman Babu", gender: "Male", age: 38, address: "T. Nagar, Chennai, TN", mobileNumber: "7894561230", aadharNumber: "9900 1133 5522" },
  { sno: 13, fullName: "Lakshmi Devi", fatherHusbandName: "Husband: Ramesh Rao", gender: "Female", age: 41, address: "Kukatpally, Hyderabad, TS", mobileNumber: "9500011223", aadharNumber: "2211 3344 5566" },
  { sno: 14, fullName: "Vivek Kumar", fatherHusbandName: "Shyamlal Kumar", gender: "Male", age: 34, address: "Sector 10, Noida, UP", mobileNumber: "7788990011", aadharNumber: "3355 6677 8899" },
  { sno: 15, fullName: "Pooja Mehta", fatherHusbandName: "Husband: Kunal Mehta", gender: "Female", age: 30, address: "Satellite Road, Ahmedabad, Gujarat", mobileNumber: "9666554433", aadharNumber: "4488 9900 2211" },
  { sno: 16, fullName: "Suman Yadav", fatherHusbandName: "Suresh Yadav", gender: "Female", age: 26, address: "Dharampeth, Nagpur, MH", mobileNumber: "8855221133", aadharNumber: "6677 8899 0033" },
  { sno: 17, fullName: "Abhishek Rana", fatherHusbandName: "Gopal Rana", gender: "Male", age: 31, address: "Mall Road, Shimla, HP", mobileNumber: "8899441122", aadharNumber: "2299 4488 1199" },
  { sno: 18, fullName: "Ritu Chauhan", fatherHusbandName: "Husband: Amit Chauhan", gender: "Female", age: 35, address: "Rajpur Road, Dehradun, UK", mobileNumber: "9099554433", aadharNumber: "5566 7788 9911" },
  { sno: 19, fullName: "Sagar Jadhav", fatherHusbandName: "Nitin Jadhav", gender: "Male", age: 21, address: "Camp Area, Pune, MH", mobileNumber: "9345678123", aadharNumber: "4411 2233 7788" },
  { sno: 20, fullName: "Alka Singh", fatherHusbandName: "Husband: Manish Singh", gender: "Female", age: 33, address: "Hazratganj, Lucknow, UP", mobileNumber: "9331122554", aadharNumber: "3344 5566 1122" },
  { sno: 21, fullName: "Mohan Prasad", fatherHusbandName: "Kailash Prasad", gender: "Male", age: 47, address: "Kankarbagh, Patna, Bihar", mobileNumber: "9265483125", aadharNumber: "7788 3344 5566" },
  { sno: 22, fullName: "Sneha Nair", fatherHusbandName: "Hari Nair", gender: "Female", age: 28, address: "Kowdiar, Thiruvananthapuram, Kerala", mobileNumber: "9876549087", aadharNumber: "5566 7788 2299" },
  { sno: 23, fullName: "Devraj Ghosh", fatherHusbandName: "Subhash Ghosh", gender: "Male", age: 44, address: "Salt Lake City, Kolkata, WB", mobileNumber: "9033445566", aadharNumber: "3377 8899 2211" },
  { sno: 24, fullName: "Aarti Bajaj", fatherHusbandName: "Husband: Rohan Bajaj", gender: "Female", age: 37, address: "Sector 14, Chandigarh", mobileNumber: "8211122233", aadharNumber: "1155 6677 2233" },
  { sno: 25, fullName: "Rahul Chavan", fatherHusbandName: "Ganpat Chavan", gender: "Male", age: 25, address: "Navi Mumbai, MH", mobileNumber: "7500881122", aadharNumber: "9900 5544 1133" },
  { sno: 26, fullName: "Shreya Kulkarni", fatherHusbandName: "Mahesh Kulkarni", gender: "Female", age: 23, address: "FC Road, Pune, MH", mobileNumber: "9766332211", aadharNumber: "6677 1122 4433" },
  { sno: 27, fullName: "Virendra Patil", fatherHusbandName: "Suresh Patil", gender: "Male", age: 52, address: "Kopar Khairane, Navi Mumbai, MH", mobileNumber: "8899776655", aadharNumber: "7788 9900 2211" },
  { sno: 28, fullName: "Manju Rathi", fatherHusbandName: "Husband: Nitesh Rathi", gender: "Female", age: 39, address: "Shastri Nagar, Jaipur, RJ", mobileNumber: "9334478122", aadharNumber: "1122 3344 5566" },
  { sno: 29, fullName: "Harpreet Singh", fatherHusbandName: "Baldev Singh", gender: "Male", age: 29, address: "Model Town, Ludhiana, Punjab", mobileNumber: "9911557733", aadharNumber: "4433 2211 9988" },
  { sno: 30, fullName: "Nidhi Soni", fatherHusbandName: "Husband: Akhil Soni", gender: "Female", age: 34, address: "MP Nagar, Bhopal, MP", mobileNumber: "9877789900", aadharNumber: "5566 9900 1122" }
];

async function seedPatients() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing patients (optional - comment out if you want to keep existing data)
    // await Patient.deleteMany({});
    // console.log('Cleared existing patients');

    // Generate ward and bed numbers
    const wards = ['General Ward A', 'General Ward B', 'ICU', 'Emergency', 'Isolation Ward'];
    
    const patientsToInsert = patientsData.map((patient, index) => ({
      fullName: patient.fullName,
      fatherHusbandName: patient.fatherHusbandName,
      gender: patient.gender,
      age: patient.age,
      address: patient.address,
      mobileNumber: patient.mobileNumber,
      aadharNumber: patient.aadharNumber.replace(/\s/g, ''), // Remove spaces
      hospital: 'myhospital',
      ward: wards[Math.floor(Math.random() * wards.length)],
      bedNumber: `B${(index + 1).toString().padStart(3, '0')}`,
      rfidTag: `RFID${(1000 + index).toString()}`,
      status: 'active',
      mdrStatus: 'negative',
      admissionDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
    }));

    // Insert patients
    const result = await Patient.insertMany(patientsToInsert, { ordered: false });
    console.log(`✅ Successfully inserted ${result.length} patients`);

    // Display summary
    const totalPatients = await Patient.countDocuments();
    console.log(`\n📊 Total patients in database: ${totalPatients}`);
    
    // Show sample of inserted data
    const samples = await Patient.find().limit(5);
    console.log('\n📋 Sample patients:');
    samples.forEach(p => {
      console.log(`   - ${p.fullName} (${p.gender}, ${p.age}y) - Ward: ${p.ward}, Bed: ${p.bedNumber}`);
    });

    console.log('\n✅ Patient data seeding completed successfully!');
    
  } catch (error) {
    if (error.code === 11000) {
      console.error('❌ Duplicate aadhar numbers found. Some patients may already exist.');
      console.error('   Unique patients that could be inserted were added.');
    } else {
      console.error('❌ Error seeding patients:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedPatients();
