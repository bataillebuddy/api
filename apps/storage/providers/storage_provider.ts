import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class StorageProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
  }

  public async boot () {
    // IoC is ready
    const { DracoDriver } = await import('../drivers/draco_driver')

    const Drive = this.app.container.use('Adonis/Core/Drive')
    Drive.extend('draco', (_drive, _diskName, config) => {
      return new DracoDriver(config)
    })
  }
  public async ready() {}
  public async shutdown() {}
}
