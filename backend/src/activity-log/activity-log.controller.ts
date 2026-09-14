import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ActivityLogService } from './activity-log.service';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';

// Journal d'activité (§28) : réservé au Super Admin (décision assumée faute de précision du
// cahier des charges sur ce point — voir README). Aucune autre action que la lecture n'est
// exposée : le journal est un historique, il n'est ni modifiable ni supprimable via l'API.
@Controller('admin/activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @RequirePermissions('activity-log:read')
  @Get()
  findAll(@Query() query: QueryActivityLogDto) {
    return this.activityLogService.findAll(query);
  }
}
