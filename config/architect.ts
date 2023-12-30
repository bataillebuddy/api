import { ArchitectConfig } from '@ioc:Adonis/Core/Architect'

const architectConfig: ArchitectConfig = {
  domains: ['users', 'rooms'],
  applications: {
    authentication: {
      prefix: 'authentication',
      as: 'authentication',
    },
    security: {
      prefix: '',
      as: 'security',
    },
    storage: {
      prefix: 'storage',
      as: 'storage'
    },
    rooms: {
      prefix: '',
      as: 'rooms'
    }
  },
}

export default architectConfig
