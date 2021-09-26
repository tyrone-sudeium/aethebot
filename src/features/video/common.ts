/**
 * Useful functions common to video reuploading features.
 */

import * as FS from "fs"
import { getHTTPData } from "../../util/http"

export const FILE_TOO_BIG = "never mind, that video is too chonk to upload here, or something else is cooked"

export interface AnchormeResult {
    reason: string
    protocol: string
    raw: string
    encoded: string
}

export interface DownloadMetadata {
    path: string
    size: number
}

export async function downloadFile(
    url: string,
    filePath: string,
    headers?: {[header: string]: string}): Promise<DownloadMetadata> {
    const fileStream = FS.createWriteStream(filePath)

    try {
        await getHTTPData(url, {
            outputStream: fileStream,
            headers,
        })
    } catch (error) {
        fileStream.close()
        FS.unlinkSync(filePath)
        throw error
    }
    fileStream.close()
    const stats = await new Promise<FS.Stats>((resolve, reject) => {
        FS.stat(filePath, (err, s) => {
            if (err) {
                reject(err)
            }
            resolve(s)
        })
    })
    return {
        path: filePath,
        size: stats.size,
    }
}
