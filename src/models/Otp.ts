import mongoose from "mongoose"


const otpSchema = new mongoose.Schema({
  user: {
    type:mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'User',
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type:Date, 
    default: Date.now
  }
}, {timestamps:true} )

otpSchema.index(
  { expiresAt: 1}, { expireAfterSeconds: 300 }
)

export const otp = mongoose.model('Otp', otpSchema)