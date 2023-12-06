import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.group(() => {
    Route.post('/login', 'authentication_controller.login').as('authentication.login')
    Route.post('/register', 'authentication_controller.register').as('authentication.register')

    Route.group(() => {
      Route.get('/me', 'authentication_controller.me').as('authentication.me')
    }).middleware('auth')
  }).namespace('App/authentication/controllers')
}
