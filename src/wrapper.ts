import type { Options, Result } from "execa";

import type { Arch, Platform } from "./platform";

import fs from "fs";
import path from "path";

import { downloadAndExtract } from "./download";
import { osArchPair } from "./platform";
import { execa } from "execa";

/**
 * Binary source.
 */
interface Source {
    /**
     * Operating System for this source.
     */
    os: Platform,
    /**
     * System Architecture for this source.
     */
    arch: Arch,
    /**
     * URL to download from.
     */
    url: string,
};

/**
 * Wrapper for native executable.
 */
export default class BinWrapper {
    private readonly sources: Source[];
    private destination: string;
    private binName: string;
    private binExt: string;
    private downloaded: string[];

    constructor() {
        this.sources = [];
        this.destination = "";
        this.binName = "";
        this.binExt = process.platform === "win32" ? ".exe" : "";
        this.downloaded = [];
    }

    /**
     * Registers a source URL for the current host platform and architecture.
     */
    src(url: string): this;
    /**
     * Registers a source URL for the given host platform and the current architecture.
     */
    src(url: string, os: Platform): this;
    /**
     * Registers a source URL for the given host platform and architecture.
     */
    src(url: string, os: Platform, arc: Arch): this;
    src(url: string, os: Platform = process.platform, arch: Arch = process.arch): this {
        this.sources.push({
            os: os,
            arch: arch,
            url: url,
        });
        return this;
    }

    /**
     * Returns a list of downloaded sources.
     */
    downloadedSrcs(): string[] {
        return this.downloaded;
    }

    /**
     * Returns path to destination directory.
     */
    dest(): string;
    /**
     * Sets destination directory.
     */
    dest(dest: string): this;
    dest(dest?: string): this | string {
        if(typeof dest === "undefined") {
            return this.destination;
        }

        if(!this.exist(dest)) {
            this.createDir(dest);
        } else if(!this.isDirectory(dest)) {
            throw new Error(`Destination ${dest} is not a directory`);
        }
        this.destination = dest;
        return this;
    }

    /**
     * Returns binary name and extension.
     */
    use(): string;
    /**
     * Sets binary name,
     */
    use(binName: string): this;
    /**
     * Sets binary name and extension.
     */
    use(binName: string, binExt: string): this;
    use(binName?: string, binExt?: string): this | string {
        if(typeof binName === "undefined") {
            return this.binName + this.binExt;
        }

        this.binName = binName;
        this.binExt = (typeof binExt !== "undefined") ? binExt : "";
        return this;
    }

    /**
     * Returns binary extension.
     */
    useExt(): string;
    /**
     * Sets binary extension.
     */
    useExt(binExt: string): string;
    useExt(binExt?: string): this | string {
        if(typeof binExt === "undefined") {
            return this.binExt;
        }

        this.binExt = binExt;
        return this;
    }

    /**
     * Returns path to binary.
     */
    path(): string {
        return path.join(this.dest(), this.use());
    }

    /**
     * Runs the binary.
     */
    async run(args: string[]): Promise<Result<Options>>;
    /**
     * Runs the binary.
     */
    async run(...args: string[]): Promise<Result<Options>>;
    async run(
        args: string[] | string = [ "--version" ],
        ...others: string[]
    ) {
        if(Array.isArray(args) && others.length > 0) {
            throw new Error("args must be array or list, not both");
        }

        if(typeof args === "string") {
            args = [args, ...others];
        }

        await this.ensureExist();

        return execa(this.path(), args, { stdout: "inherit", stderr: "inherit" });
    }

    /**
     * Ensures binary is downloaded.
     * If not downloaded, the appropriate sources for this host platform and architecture will be
     * downloaded.
     */
    async ensureExist() {
        if(fs.existsSync(this.path())) {
            return;
        }

        await this.download();
    }

    /**
     * Downloads the sources for the current host platform and architecture.
     */
    private async download() {
        const srcs = this.getSrcs();

        if(srcs.length < 1) {
            throw new Error(`No binary for ${osArchPair()}`);
        }

        await Promise.all(srcs.map(async src => {
            await downloadAndExtract(src.url, this.destination);
            this.downloaded.push(src.url);
        }));
    }

    /**
     * Returns sources for the current host platform and architecture.
     */
    private getSrcs(): Source[] {
        return this.sources.filter(src => src.os === process.platform &&
            src.arch === process.arch);
    }

    /**
     * Returns true if the path exists.
     */
    private exist(path: fs.PathLike) {
        return fs.existsSync(path);
    }

    /**
     * Returns true if the path is a directory.
     */
    private isDirectory(path: fs.PathLike) {
        return fs.statSync(path).isDirectory();
    }

    /**
     * Creates directory at the given path.
     */
    private createDir(path: fs.PathLike) {
        return fs.mkdirSync(path, { recursive: true });
    }
}
