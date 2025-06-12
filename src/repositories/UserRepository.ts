import { User } from "../models/User";

export class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({ email })
  }

  async create(data: any) {
    return User.create(data)
  }

  async verifyUser(userId: string) {
    return User.findByIdAndUpdate(userId, {isVerified: true})
  }

  async updatePassword(userId: string, newPassword: string) {
    return User.findByIdAndUpdate(userId, { password: newPassword });
  }
  
}