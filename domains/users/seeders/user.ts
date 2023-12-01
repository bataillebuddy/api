import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from '../models/user'

export default class extends BaseSeeder {
  public async run() {
    await User.create({
      email: 'nathael@gmail.com',
      password: '123456789',
    })
  }
}
