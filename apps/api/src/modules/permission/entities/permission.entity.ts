export class PermissionEntity {
  constructor(
    readonly id: string,
    readonly code: string,
    readonly description: string | null,
  ) {}
}
