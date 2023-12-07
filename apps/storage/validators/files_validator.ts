import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { type HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class CreateFileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    file: schema.file(),
    name: schema.string({ trim: true }),
    location: schema.string({ trim: true })
  })

  public messages: CustomMessages = {}
}
