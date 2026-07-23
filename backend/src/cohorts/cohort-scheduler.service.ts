import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CohortsService } from './cohorts.service';

@Injectable()
export class CohortSchedulerService {
  private readonly logger = new Logger(CohortSchedulerService.name);

  constructor(private readonly cohortsService: CohortsService) {}

  @Cron('0 * * * * *')
  async handleAutoClose() {
    const closedIds = await this.cohortsService.closeCohortsAutomatically();

    if (closedIds.length > 0) {
      this.logger.log(
        `Fermeture automatique : ${closedIds.length} cohorte(s) fermée(s) [${closedIds.join(', ')}]`,
      );
    }
  }
}
