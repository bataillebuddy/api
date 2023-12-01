import { ArchitectConfig } from '@ioc:Adonis/Core/Architect'

const architectConfig: ArchitectConfig = {
  domains: ['users'],
  applications: {
    authentication: {
      prefix: 'authentication',
      as: 'authentication',
    },
    security: {
      prefix: '',
      as: 'security',
    },
  },
}

export default architectConfig
