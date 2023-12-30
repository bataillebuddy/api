import { BaseModel, beforeCreate, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import User from 'Domains/users/models/user'
import Player from 'Domains/rooms/models/player'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public archived: boolean

  @column()
  public state: string

  @column()
  public code: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Player)
  public players: HasMany<typeof Player>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid (model: Room) {
    model.id = randomUUID()
  }
}
