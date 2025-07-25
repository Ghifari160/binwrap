import path from "path";

import * as tar from "tar";

export type ArchiveFormat = |
    "tar" |
    "zip";

/**
 * Extracts archive in `filepath` to `dest`.
 */
export async function extract(filepath: string, dest: string, format: ArchiveFormat = "tar") {
    switch(format) {
    case "tar":
        return extractTar(filepath, dest);

    default:
        throw new Error(`Unsupported file type: ${path.extname(filepath)}`);
    }
}

/**
 * Extracts tar archive from `filepath` to `dest`.
 * @private
 */
async function extractTar(filepath: string, dest: string) {
    return tar.extract({
        file: filepath,
        cwd: dest,
    });
}
