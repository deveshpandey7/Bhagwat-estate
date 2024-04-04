import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.pngall.com%2Fwp-content%2Fuploads%2F5%2FProfile.png&f=1&nofb=1&ipt=076d617ebd29f2fd9443abd296c510d3a92af06168a4e6520396687f342bb361&ipo=images",
    },
}, { timestamps: true }); 


const User = mongoose.model('User', userSchema);

export default User;