import { type MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import Logger from '@ioc:Adonis/Core/Logger'
import Drive from '@ioc:Adonis/Core/Drive'

class FilesServices {
  public async createFile(file: MultipartFileContract, location: string, name: string) {
    try {
      await file.moveToDisk(location, {
        name: name,
      }, 's3')
    } catch (err) {
      Logger.error(err.stack())
    }
  }

  public async deleteFile(key: string) {
    try {
      await Drive.getStats(key)

      await Drive.delete(key)
    } catch (error) {
      // Exception for file not found in S3
      throw error
    }
  }
}

export default new FilesServices()
