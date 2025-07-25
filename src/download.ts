import fs from "fs";
import { pipeline } from "stream/promises";

import { tempFileTask } from "./tempfile";
import { extract } from "./unarchive";

/**
 * Downloads a file `url` to `dest`.
 */
export async function download(url: string, dest: string) {
    const resp = await fetch(url);
    const writeStream = fs.createWriteStream(dest);

    if(!resp.ok) {
        throw new Error(`HTTP error (${resp.status}): ${resp.statusText}`);
    }

    if(!resp.body) {
        throw new Error("Empty response body!");
    }

    await pipeline(resp.body, writeStream).catch(err => {
        try {
            fs.unlinkSync(dest);
        } catch(err) {}
        throw new Error(`Failed to download ${url}: ${err}`);
    });
}

/**
 * Downloads an archive from `url` to `dest` and extract it.
 */
export async function downloadAndExtract(url: string, dest: string) {
    await tempFileTask(async temp => {
        await download(url, temp);
        await extract(temp, dest, "tar");
    });
}
