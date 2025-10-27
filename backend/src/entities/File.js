import { EntitySchema } from 'typeorm';

export const File = new EntitySchema({
  name: 'File',
  tableName: 'files',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    file_url: { type: 'varchar' },
    file_type: { type: 'varchar' },
    created_at: { type: 'timestamp', createDate: true },
  },
  relations: {
    comment: {
      type: 'many-to-one',
      target: 'Comment',
      joinColumn: { name: 'commentId' },
      onDelete: 'CASCADE',
    },
  },
});
