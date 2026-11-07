import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANONYMOUS_KEY = 'allowAnonymous';
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true);

export const ALLOW_TEMP_TOKEN_KEY = 'allowTempToken';
export const AllowTempToken = () => SetMetadata(ALLOW_TEMP_TOKEN_KEY, true);

// Valid JWT is enough: skips role/permission checks (e.g. creating the first property)
export const ALLOW_AUTHENTICATED_KEY = 'allowAuthenticated';
export const AllowAuthenticated = () =>
  SetMetadata(ALLOW_AUTHENTICATED_KEY, true);
