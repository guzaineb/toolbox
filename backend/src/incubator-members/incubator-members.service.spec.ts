import { Test, TestingModule } from '@nestjs/testing';
import { IncubatorMembersService } from './incubator-members.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

describe('IncubatorMembersService', () => {
  let service: IncubatorMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncubatorMembersService,
        { provide: PrismaService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: NotificationMessageBuilder, useValue: {} },
      ],
    }).compile();

    service = module.get<IncubatorMembersService>(IncubatorMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
