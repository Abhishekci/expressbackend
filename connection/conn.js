const mongoose = require('mongoose');
const conn = async() => {
    try {
        const response = await mongoose.connect(`${process.env.MONGO_URL}`);
        if (response) {
            console.log("Database connected successfully")
        }
    } catch (err) {
        // console.log("ff");
    }
}
conn()