import Route from '@ioc:Adonis/Core/Route'

export default () => {
  Route.group(() => {

    Route.group(() => {
      Route.get('/', 'files_controller.get').as('storage.files.get')
      Route.post('/', 'files_controller.create').as('storage.files.store')
      Route.delete('/', 'files_controller.delete').as('storage.files.delete')

    }).prefix('/files')


  }).namespace('App/storage/controllers')
}
