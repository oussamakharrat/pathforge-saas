import { NotFoundException, ForbiddenException } from '@nestjs/common';

export function assertFound<T>(entity: T | null, label = 'Resource'): T {
  if (!entity) throw new NotFoundException(`${label} not found`);
  return entity;
}

export function assertOwner(entityUserId: string, currentUserId: string): void {
  if (entityUserId !== currentUserId) {
    throw new ForbiddenException('Access denied');
  }
}
