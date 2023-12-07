import { DracoDriverContract } from '@ioc:Adonis/Addons/DracoDrive'
import {ContentHeaders, DriveFileStats,
  S3DriverConfig,
  Visibility,
  WriteOptions
} from "@ioc:Adonis/Core/Drive"
import { format } from 'url'
import { Readable } from 'stream'
import getStream from 'get-stream'
import { string } from '@poppinss/utils/build/helpers'
import {
  _Object, CopyObjectCommand, DeleteObjectCommand, GetObjectAclCommand,
  GetObjectCommand,
  GetObjectCommandInput, HeadObjectCommand,
  ListObjectsV2Command, PutObjectAclCommand, PutObjectCommand,
  S3Client,
  Tag
} from '@aws-sdk/client-s3'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import {
  CannotCopyFileException,
  CannotMoveFileException,
  CannotReadFileException,
  CannotWriteFileException,
  CannotDeleteFileException,
  CannotGetMetaDataException,
  CannotSetVisibilityException,
} from '@adonisjs/core/build/standalone'
import {Upload} from '@aws-sdk/lib-storage'

export class DracoDriver implements DracoDriverContract {
  public adapter: S3Client
  public name: 'draco' = 'draco'
  private publicGrantUri = 'http://acs.amazonaws.com/groups/global/AllUsers'

  constructor(private config: S3DriverConfig) {
    if (this.config.key && this.config.secret) {
      this.config.credentials = {
        accessKeyId: this.config.key,
        secretAccessKey: this.config.secret
      }
    }

    this.adapter = new S3Client(this.config)
  }

  public async getFilesWithPrefix(prefix: string, bucketName: string): Promise<_Object[]> {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    })

    try {
      const response = await this.adapter.send(command)

      if (!response.Contents) {
        return []
      }

      const files: _Object[] = response.Contents.map((file: _Object) => ({
        ...file
      }))

      return files
    } catch (error) {
      throw new Error(`Error listing files in S3: ${error.message}`)
    }
  }

  private transformWriteOptions(options?: WriteOptions) {
    const {
      visibility,
      contentType,
      contentDisposition,
      contentEncoding,
      contentLanguage,
      contentLength,
      cacheControl,
      ...adapterOptions
    } = Object.assign({ visibility: this.config.visibility }, options)

    if (contentLength) {
      adapterOptions['ContentLength'] = contentLength
    }

    if (contentType) {
      adapterOptions['ContentType'] = contentType
    }

    if (contentDisposition) {
      adapterOptions['ContentDisposition'] = contentDisposition
    }

    if (contentEncoding) {
      adapterOptions['ContentEncoding'] = contentEncoding
    }

    if (contentLanguage) {
      adapterOptions['ContentLanguage'] = contentLanguage
    }

    if (cacheControl) {
      adapterOptions['CacheControl'] = cacheControl
    }

    if (visibility === 'public') {
      adapterOptions.ACL = 'public-read'
    } else if (visibility === 'private') {
      adapterOptions.ACL = 'private'
    }

    return adapterOptions
  }

  /**
   * Transform content headers to S3 response content type
   */
  private transformContentHeaders(options?: ContentHeaders) {
    const contentHeaders: Omit<GetObjectCommandInput, 'Key' | 'Bucket'> = {}
    const { contentType, contentDisposition, contentEncoding, contentLanguage, cacheControl } =
    options || {}

    if (contentType) {
      contentHeaders['ResponseContentType'] = contentType
    }

    if (contentDisposition) {
      contentHeaders['ResponseContentDisposition'] = contentDisposition
    }

    if (contentEncoding) {
      contentHeaders['ResponseContentEncoding'] = contentEncoding
    }

    if (contentLanguage) {
      contentHeaders['ResponseContentLanguage'] = contentLanguage
    }

    if (cacheControl) {
      contentHeaders['ResponseCacheControl'] = cacheControl
    }

    return contentHeaders
  }

  /**
   * Returns a new instance of the s3 driver with a custom runtime
   * bucket
   */
  public bucket(bucket: string): DracoDriver {
    return new DracoDriver(Object.assign({}, this.config, { bucket }))
  }

  /**
   * Returns the file contents as a buffer. The buffer return
   * value allows you to self choose the encoding when
   * converting the buffer to a string.
   */
  public async get(location: string): Promise<Buffer> {
    return getStream.buffer(await this.getStream(location))
  }

  /**
   * Returns the file contents as a stream
   */
  public async getStream(location: string): Promise<Readable> {
    try {
      const response = await this.adapter.send(
        new GetObjectCommand({ Key: location, Bucket: this.config.bucket })
      )

      /**
       * The value as per the SDK can be a blob, NodeJS.ReadableStream or Readable stream.
       * However, at runtime it is always a readable stream.
       *
       * There is an open issue on the same https://github.com/aws/aws-sdk-js-v3/issues/3064
       */
      return response.Body as unknown as Promise<Readable>
    } catch (error) {
      throw CannotReadFileException.invoke(location, error)
    }
  }

  /**
   * A boolean to find if the location path exists or not
   */
  public async exists(location: string): Promise<boolean> {
    try {
      await this.adapter.send(
        new HeadObjectCommand({
          Key: location,
          Bucket: this.config.bucket,
        })
      )

      return true
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false
      }

      throw CannotGetMetaDataException.invoke(location, 'exists', error)
    }
  }

  /**
   * Not supported
   */
  public async getVisibility(location: string): Promise<Visibility> {
    try {
      const acl = await this.adapter.send(
        new GetObjectAclCommand({
          Key: location,
          Bucket: this.config.bucket,
        })
      )

      const publicGrant = (acl.Grants || []).find((grant) => {
        return grant.Grantee?.URI === this.publicGrantUri && grant.Permission === 'READ'
      })

      return publicGrant ? ('public' as const) : ('private' as const)
    } catch (error) {
      throw CannotGetMetaDataException.invoke(location, 'visibility', error)
    }
  }

  /**
   * Returns the file stats
   */
  public async getStats(location: string): Promise<DriveFileStats> {
    try {
      const stats = await this.adapter.send(
        new HeadObjectCommand({
          Key: location,
          Bucket: this.config.bucket,
        })
      )

      return {
        modified: stats.LastModified!,
        size: stats.ContentLength!,
        isFile: true,
        etag: stats.ETag,
      }
    } catch (error) {
      throw CannotGetMetaDataException.invoke(location, 'stats', error)
    }
  }

  /**
   * Returns the signed url for a given path
   */
  public async getSignedUrl(
    location: string,
    options?: ContentHeaders & { expiresIn?: string | number }
  ): Promise<string> {
    try {
      return await getSignedUrl(
        this.adapter,
        new GetObjectCommand({
          Key: location,
          Bucket: this.config.bucket,
          ...this.transformContentHeaders(options),
        }),
        {
          expiresIn: string.toMs(options?.expiresIn || '15min') / 1000,
        }
      )
    } catch (error) {
      throw CannotGetMetaDataException.invoke(location, 'signedUrl', error)
    }
  }

  /**
   * Returns URL to a given path
   */
  public async getUrl(location: string): Promise<string> {
    /**
     * Use the CDN URL if defined
     */
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl}/${location}`
    }

    const href = format(await this.adapter.config.endpoint!())
    if (href.startsWith('https://s3.amazonaws')) {
      return `https://${this.config.bucket}.s3.amazonaws.com/${location}`
    }

    return `${href}/${this.config.bucket}/${location}`
  }

  /**
   * Write string|buffer contents to a destination. The missing
   * intermediate directories will be created (if required).
   */
  public async put(
    location: string,
    contents: Buffer | string,
    options?: WriteOptions
  ): Promise<void> {
    try {
      await this.adapter.send(
        new PutObjectCommand({
          Key: location,
          Body: contents,
          Bucket: this.config.bucket,
          ...this.transformWriteOptions(options),
        })
      )
    } catch (error) {
      throw CannotWriteFileException.invoke(location, error)
    }
  }

  /**
   * Write a stream to a destination. The missing intermediate
   * directories will be created (if required).
   */
  public async putStream(
    location: string,
    contents: any,
    options?: WriteOptions & {
      multipart?: boolean
      queueSize?: number
      partSize?: number
      leavePartsOnError?: boolean
      tags?: Tag[]
      tap?: (stream: Upload) => void
    }
  ): Promise<void> {
    try {
      options = Object.assign({}, options)

      /**
       * Upload as multipart stream
       */
      if (options.multipart) {
        const { tap, queueSize, partSize, leavePartsOnError, tags, ...others } = options
        const upload = new Upload({
          params: {
            Key: location,
            Body: contents,
            Bucket: this.config.bucket,
            ...this.transformWriteOptions(others),
          },
          queueSize,
          partSize,
          leavePartsOnError,
          tags,
          client: this.adapter,
        })

        if (typeof tap === 'function') {
          tap(upload)
        }

        await upload.done()
        return
      }

      await this.adapter.send(
        new PutObjectCommand({
          Key: location,
          Body: contents,
          Bucket: this.config.bucket,
          ...this.transformWriteOptions(options),
        })
      )
    } catch (error) {
      throw CannotWriteFileException.invoke(location, error)
    }
  }

  /**
   * Not supported
   */
  public async setVisibility(location: string, visibility: Visibility): Promise<void> {
    try {
      await this.adapter.send(
        new PutObjectAclCommand({
          Key: location,
          Bucket: this.config.bucket,
          ...this.transformWriteOptions({ visibility }),
        })
      )
    } catch (error) {
      throw CannotSetVisibilityException.invoke(location, error)
    }
  }

  /**
   * Remove a given location path
   */
  public async delete(location: string): Promise<void> {
    try {
      await this.adapter.send(
        new DeleteObjectCommand({
          Key: location,
          Bucket: this.config.bucket,
        })
      )
    } catch (error) {
      throw CannotDeleteFileException.invoke(location, error)
    }
  }

  /**
   * Copy a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async copy(source: string, destination: string, options?: WriteOptions): Promise<void> {
    options = options || {}

    try {
      /**
       * Copy visibility from the source. S3 doesn't retain the original
       * ACL. https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html
       */
      if (!options.visibility) {
        options.visibility = await this.getVisibility(source)
      }

      await this.adapter.send(
        new CopyObjectCommand({
          Key: destination,
          CopySource: `/${this.config.bucket}/${source}`,
          Bucket: this.config.bucket,
          ...this.transformWriteOptions(options),
        })
      )
    } catch (error) {
      throw CannotCopyFileException.invoke(source, destination, error.original || error)
    }
  }

  /**
   * Move a given location path from the source to the desination.
   * The missing intermediate directories will be created (if required)
   */
  public async move(source: string, destination: string, options?: WriteOptions): Promise<void> {
    try {
      await this.copy(source, destination, options)
      await this.delete(source)
    } catch (error) {
      throw CannotMoveFileException.invoke(source, destination, error.original || error)
    }
  }

}
