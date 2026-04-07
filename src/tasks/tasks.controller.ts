import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('api-price')
  async getAPIPrice() {
    return this.tasksService.getAPIPriceAndData();
  }

  @Get('bcv-price')
  async getBCVPrice() {
    return this.tasksService.getBCVPrice();
  }
}
