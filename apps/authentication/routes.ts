import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.group(() => {
    Route.get('/', async ({ response }) => {
      return response.send('ok')
    }).as('ok')
  })
}
