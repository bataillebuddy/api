import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.group(() => {
    Route.group(() => {
      Route.get('/', 'rooms_controller.index').as('rooms.index')
      Route.get('/:id', 'rooms_controller.show').as('rooms.show')
    }).prefix('/rooms')
  }).namespace('App/rooms/controllers')
}
