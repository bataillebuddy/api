import { type HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import FilesServices from 'App/storage/services/files_service'
import { CreateFileValidator } from 'App/storage/validators/files_validator'
import Logger from '@ioc:Adonis/Core/Logger'

export default class FilesController {
  private filesServices = FilesServices
  public async get({ response, request }: HttpContextContract) {
    const key = request.input('key')
    const file = await Drive.getSignedUrl(key)

    return response.send({
      url: file
    })
  }

  public async create({ request, response}: HttpContextContract) {
    const data = await request.validate(CreateFileValidator)

    await this.filesServices.createFile(data.file, data.location, data.name)
    Logger.info('The file has been successfully saved in S3')

    return response.send(data.file)
  }

  public async delete({ request, response}: HttpContextContract) {
    const key = request.input('key')

    await this.filesServices.deleteFile(key)

    return response.ok({
      message: "file delete"
    })
  }
}
