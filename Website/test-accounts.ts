import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/lib/models/User';
import Student from './src/lib/models/Student';
import Owner from './src/lib/models/Owner';
import Room from './src/lib/models/Room';
import bcryptjs from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

async function testAccounts() {
    console.log('\n📝 Testing Demo Accounts...\n');

    try {
        await mongoose.connect(MONGODB_URI!, { family: 4 });
        console.log('✅ MongoDB connected\n');

        // Test Student Account
        console.log('Testing Student Account:');
        console.log('Email: demo.student@student-nest.live');
        console.log('Password: Demo@123\n');

        const studentResult = await Student.findOne({ email: 'demo.student@student-nest.live' });
        if (studentResult) {
            console.log('✅ Student account exists');
            console.log(`   Name: ${studentResult.fullName}`);
            console.log(`   Phone: ${studentResult.phone}`);
            console.log(`   College: ${studentResult.collegeName}`);
            console.log(`   Course: ${studentResult.course}`);
            console.log(`   Year: ${studentResult.yearOfStudy}`);
            console.log(`   City: ${studentResult.city}`);
            console.log(`   Email Verified: ${studentResult.isEmailVerified}`);
            console.log(`   Identity Verified: ${studentResult.isIdentityVerified}`);
            
            // Test password
            const passwordMatch = await bcryptjs.compare('Demo@123', studentResult.password);
            console.log(`   Password Valid: ${passwordMatch ? '✅ YES' : '❌ NO'}`);
        } else {
            console.log('❌ Student account not found');
        }

        console.log('\n' + '─'.repeat(60) + '\n');

        // Test Owner Account
        console.log('Testing Owner Account:');
        console.log('Email: demo.owner@student-nest.live');
        console.log('Password: Demo@123\n');

        const ownerResult = await Owner.findOne({ email: 'demo.owner@student-nest.live' });
        if (ownerResult) {
            console.log('✅ Owner account exists');
            console.log(`   Name: ${ownerResult.fullName}`);
            console.log(`   Phone: ${ownerResult.phone}`);
            console.log(`   Business: ${ownerResult.businessName}`);
            console.log(`   Type: ${ownerResult.businessType}`);
            console.log(`   City: ${ownerResult.city}`);
            console.log(`   Email Verified: ${ownerResult.isEmailVerified}`);
            console.log(`   Identity Verified: ${ownerResult.isIdentityVerified}`);
            
            // Test password
            const passwordMatch = await bcryptjs.compare('Demo@123', ownerResult.password);
            console.log(`   Password Valid: ${passwordMatch ? '✅ YES' : '❌ NO'}`);

            // Check associated rooms/properties
            const rooms = await Room.find({ owner: ownerResult._id });
            console.log(`   Properties: ${rooms.length}`);
            rooms.forEach((room: any) => {
                console.log(`     - ${room.title} (₹${room.price}/month)`);
            });
        } else {
            console.log('❌ Owner account not found');
        }

        console.log('\n' + '═'.repeat(60) + '\n');
        console.log('🎉 Demo accounts are ready to use!\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testAccounts();
