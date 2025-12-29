import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('Database connected');
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
