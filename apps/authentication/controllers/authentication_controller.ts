import { type HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'Domains/users/models/user'

export default class AuthenticationController {
  public async login({ request, response, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      const oat = await auth.attempt(email, password)
      response.cookie('token', oat.token, {
        httpOnly: true,
        secure: true,
      })
      return response.send(oat)
    } catch (error) {
      return response.unauthorized('Invalid credentials')
    }
  }

  public async me({ auth, response }: HttpContextContract) {
    const user = auth.user as User

    return response.send(user)
  }
}
