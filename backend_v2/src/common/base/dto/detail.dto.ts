export abstract class BaseDetailDto<TEntity> {
  id: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt?: Date;
  abstract fromEntity(entity: TEntity): void;
}
