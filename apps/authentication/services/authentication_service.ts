import User from 'Domains/users/models/user'
import Logger from '@ioc:Adonis/Core/Logger'

interface UserCreateDTO {
  email: string
  name: string
  lastname: string
  password: string
}
class AuthenticationService {
  public async createUser(data: UserCreateDTO): Promise<User> {
    const user = await User.create({
      ...data,
      isAdmin: false,
      hasAccessPanel: false
    })

    Logger.info(`A user has just been created: ${user.id} - ${user.name} `)

    return user
  }
}

export default new AuthenticationService()
