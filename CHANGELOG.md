<!-- markdownlint-disable MD024 -->

# Changelog

All notable changes in BinWrap will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
THis project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.2.0] - 2025-07-25

### Added

- Added `.zip` archive support.

### Changed

- BinWrap now handles archive format selection based on the magic number of the downloaded archive.
  Supported archive types are:
- `application/gzip` (`.tar.gz`)
- `application/x-bzip2` (`.tar.bz2`)
- `application/zip` (`.zip`)

## [0.1.0] - 2025-07-25

### Added

- Added library for wrapping binary executable for distribution on NPM.
  Source files are filtered by host platform and architecture.
