/**
 * Contract source: https://git.io/JBt3I
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type { InferDisksFromConfig } from '@adonisjs/core/build/config'
import type driveConfig from '../config/drive'
import { DracoDriverConfig, DracoDriverContract } from '@ioc:Adonis/Addons/DracoDrive'

declare module '@ioc:Adonis/Core/Drive' {
  interface DisksList extends InferDisksFromConfig<typeof driveConfig> {}

  interface DriversList {
    draco: {
      config: DracoDriverConfig,
      implementation: DracoDriverContract
    }
  }
}
