export class RoleEntity {
  constructor(
    readonly id: string,
    readonly code: string,
    readonly name: string,
    readonly description: string | null,
    readonly isSystem: boolean,
    readonly permissions: string[],
  ) {}
}
