# Changelog

## [0.1.1] - 2026-03-07

### Fixed

- Skip npm publish step when the package version is already published to avoid failed CI runs ([#16](https://github.com/coloneljade/auldrant-api/pull/16))
- Use npm view to check if version exists before attempting publish ([#16](https://github.com/coloneljade/auldrant-api/pull/16))
- Gate merge bot notification on successful publish, not just publish attempt ([#16](https://github.com/coloneljade/auldrant-api/pull/16))

## [0.1.0] - 2026-03-06

### Added

- Redesign API with RESTful method helpers (get, post, put, patch, delete, head, options) ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Replace apiCall/logging with typed api.* methods ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Add discriminated ApiResponse<T> union for type-safe response handling ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Add RequestOptions/RequestBodyOptions interfaces with proper separation ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Add MimeType.FORM_DATA/URL_ENCODED support ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Implement intelligent compression with 1KB threshold guard for all BodyInit types ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Add comprehensive test suite (16 tests, 87.76% coverage) ([#13](https://github.com/coloneljade/auldrant-api/pull/13))
- Update README for new API ([#13](https://github.com/coloneljade/auldrant-api/pull/13))

## 0.0.4

- Initial release
