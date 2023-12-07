import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true, escape: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    name: schema.string({ trim: true, escape: true }),
    lastname: schema.string({ trim: true, escape: true }),
    password: schema.string({ trim: true, escape: true })
  })

  public messages: CustomMessages = {}
}
