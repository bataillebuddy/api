declare module '@ioc:Adonis/Addons/DracoDrive' {
  import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3'
  import { DriverContract, Visibility } from '@ioc:Adonis/Core/Drive'

  export type DracoDriverConfig = S3ClientConfig & {
    driver: 'draco',
    visibility?: Visibility;
    bucket: string;
    cdnUrl?: string;
    key?: string;
    secret?: string;
  }

  export interface DracoDriverContract extends DriverContract {
    name: 'draco'
    adapter: S3Client

    getFilesWithPrefix(prefix: string, bucketName: string): any
  }
}
