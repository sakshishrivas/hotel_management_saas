import { prisma } from '../config/database';

export abstract class BaseRepository {
  protected readonly db = prisma;
}
