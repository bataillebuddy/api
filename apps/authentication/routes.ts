import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.group(() => {
    Route.post('/login', 'authentication_controller.login').as('authentication.login')

    Route.group(() => {
      Route.get('/me', 'authentication_controller.me').as('authentication.me')
    }).middleware('auth')
  }).namespace('App/authentication/controllers')
}
