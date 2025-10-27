import { EntitySchema } from 'typeorm';

export const Comment = new EntitySchema({
  name: 'Comment',
  tableName: 'comments',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    text: { type: 'text' },
    created_at: { type: 'timestamp', createDate: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId' },
      eager: true,
      onDelete: 'CASCADE',
    },
    parent: {
      type: 'many-to-one',
      target: 'Comment',
      joinColumn: { name: 'parent_id' },
      nullable: true,
      onDelete: 'CASCADE',
    },
    replies: {
      type: 'one-to-many',
      target: 'Comment',
      inverseSide: 'parent',
      cascade: true,
    },
    files: {
      type: 'one-to-many',
      target: 'File',
      inverseSide: 'comment',
      cascade: true,
    },
  },
});
