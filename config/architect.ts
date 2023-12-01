import { ArchitectConfig } from '@ioc:Adonis/Core/Architect'

const architectConfig: ArchitectConfig = {
  domains: [],
  applications: {
    authentication: {
      prefix: 'authentication',
      as: 'authentication',
    },
  },
}

export default architectConfig
