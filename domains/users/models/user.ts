import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, beforeCreate, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { randomUUID } from 'node:crypto'
import Player from 'Domains/rooms/models/player'
import Room from 'Domains/rooms/models/room'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string

  @column()
  public name: string

  @column()
  public lastname: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public isAdmin: boolean

  @column()
  public hasAccessPanel: boolean

  @column()
  public rememberMeToken: string | null

  @hasMany(() => Room)
  public rooms: HasMany<typeof Room>

  @hasMany(() => Player)
  public players: HasMany<typeof Player>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeCreate()
  public static async generateUuid(model: User) {
    model.id = randomUUID()
  }
}
