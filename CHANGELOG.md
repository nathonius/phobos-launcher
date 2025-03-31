# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--
## [0.0.0] - YYYY-MM-DD

### Changed

### Fixed

-->

## [0.0.5] - 2025-03-30

### Changed

- New build and publish framework for the app. Some things may be a bit wonky. You may need to reinstall.
- Images for profiles are compressed at render-time and stored on disk
- Lots of library updates, maintenance, invisible changes

### Fixed

- Fixed loading the app with no SGDB key set

<!-- ## Unreleased -->

## [0.0.4] - 2025-01-12

### Changed

- Can specify a config file for GZDoom in engines settings
- Mark profiles complete, will show a badge when hovering

## [0.0.3] - 2025-01-01

### Changed

- Added a way to sort profiles by alphabetical, create date, and last played date
- Sort setting is saved

## [0.0.2] - 2024-11-24

### Changed

- Clean up references to the template repo
- CI changes so I don't run out of free artifact storage
- Better readme with attributions
- Better feedback on save
- For profiles with no images, show 3d text on a nice Doom texture
- Very simple tag system

### Fixed

- Correct profile and category deletion behaviors
- Better grid behavior at varying screen sizes

## [0.0.1] - 2024-11-11

Initial release.

[0.0.4]: https://github.com/nathonius/phobos-launcher/compare/0.0.3...0.0.4
[0.0.3]: https://github.com/nathonius/phobos-launcher/compare/0.0.2...0.0.3
[0.0.2]: https://github.com/nathonius/phobos-launcher/compare/0.0.1...0.0.2
[0.0.1]: https://github.com/nathonius/phobos-launcher/releases/tag/0.1.0
