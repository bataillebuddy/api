import { BaseModel, beforeCreate, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import User from 'Domains/users/models/user'
import Room from 'Domains/rooms/models/room'

export default class Player extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public roomId: string

  @column()
  public userId: string

  @column()
  public deck: string

  @column()
  public stack: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Room)
  public room: BelongsTo<typeof Room>


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid (model: Player) {
    model.id = randomUUID()
  }
}
