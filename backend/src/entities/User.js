import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    username: { type: 'varchar' },
    email: { type: 'varchar' },
    homepage: { type: 'varchar', nullable: true },
    created_at: { type: 'timestamp', createDate: true },
  },
  relations: {
    comments: {
      type: 'one-to-many',
      target: 'Comment',
      inverseSide: 'user',
    },
  },
});
