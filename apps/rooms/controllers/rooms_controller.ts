import { type HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import RoomService from 'App/rooms/services/room_service'

@inject()
export default class RoomsController {
  private roomService = RoomService
  public async index({ response, request }: HttpContextContract) {
    const { page, size, players } = request.qs()
    const rooms = await this.roomService.findAll({
      page: page,
      size: size,
      preloadPlayers: !!players
    })

    return response.send(rooms)
  }
}
