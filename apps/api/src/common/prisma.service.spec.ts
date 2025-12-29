import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { vi } from 'vitest';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    const connectSpy = vi.spyOn(service, '$connect').mockResolvedValue();
    const consoleSpy = vi.spyOn(console, 'log');

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Database connected');
  });

  it('should enable shutdown hooks', async () => {
    const mockApp = {
      close: vi.fn(),
    } as any;

    const onSpy = vi.spyOn(service, '$on');

    await service.enableShutdownHooks(mockApp);

    expect(onSpy).toHaveBeenCalledWith('beforeExit', expect.any(Function));
  });
});
