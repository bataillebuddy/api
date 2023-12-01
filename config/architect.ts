import { ArchitectConfig } from '@ioc:Adonis/Core/Architect'

const architectConfig: ArchitectConfig = {
  domains: ['users'],
  applications: {
    authentication: {
      prefix: 'authentication',
      as: 'authentication',
    },
  },
}

export default architectConfig
