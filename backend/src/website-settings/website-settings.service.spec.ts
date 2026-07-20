import { Test, TestingModule } from '@nestjs/testing';
import { WebsiteSettingsService } from './website-settings.service';

describe('WebsiteSettingsService', () => {
  let service: WebsiteSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsiteSettingsService],
    }).compile();

    service = module.get<WebsiteSettingsService>(WebsiteSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
