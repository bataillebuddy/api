import Room from 'Domains/rooms/models/room'

interface FindAllProps {
  page: number
  size: number
  preloadPlayers?: boolean
}
class RoomService {
  public async findAll({
    page = 1, size = 10,
    preloadPlayers
  }: FindAllProps) {
    return Room.query()
      .if(preloadPlayers, (query) => {
        query.preload('players')
      })
      .paginate(page, size)
  }
}

export default new RoomService()
