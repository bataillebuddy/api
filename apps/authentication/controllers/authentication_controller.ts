import { type HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'Domains/users/models/user'
import { CreateUserValidator } from 'App/authentication/validators/authentication_validator'
import AuthenticationService from 'App/authentication/services/authentication_service'

export default class AuthenticationController {
  private authenticationService = AuthenticationService
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

  public async register({ request, response }: HttpContextContract) {
    const data = await request.validate(CreateUserValidator)

    const user = await this.authenticationService.createUser(data)

    return response.send({
      message: 'A user has just been created',
      user
    })


  }

  public async me({ auth, response }: HttpContextContract) {
    const user = auth.user as User

    return response.send(user)
  }
}
