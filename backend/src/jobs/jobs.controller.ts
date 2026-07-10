import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateJobPostingDto,
  UpdateJobPostingDto,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateOfferDto,
  UpdateApplicationNotesDto,
  CreateMockInterviewDto,
} from './dto/jobs.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get('postings')
  listJobs(@CurrentUser() user: { id: string }) {
    return this.service.listJobs(user.id);
  }

  @Get('postings/:id')
  getJob(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.getJob(user.id, id);
  }

  @Post('postings')
  createJob(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateJobPostingDto,
  ) {
    return this.service.createJob(user.id, dto);
  }

  @Patch('postings/:id')
  updateJob(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
  ) {
    return this.service.updateJob(user.id, id, dto);
  }

  @Delete('postings/:id')
  deleteJob(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.deleteJob(user.id, id);
  }

  @Get('applications')
  listApplications(@CurrentUser() user: { id: string }) {
    return this.service.listApplications(user.id);
  }

  @Get('applications/:id')
  getApplication(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.getApplication(user.id, id);
  }

  @Post('applications')
  createApplication(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateApplicationDto,
  ) {
    return this.service.createApplication(user.id, dto);
  }

  @Patch('applications/:id/status')
  updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateApplicationStatus(user.id, id, dto);
  }

  @Patch('applications/:id')
  updateNotes(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateApplicationNotesDto,
  ) {
    return this.service.updateApplicationNotes(user.id, id, dto);
  }

  @Post('mock-interviews')
  createMockInterview(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMockInterviewDto,
  ) {
    return this.service.createMockInterview(user.id, dto);
  }

  @Delete('applications/:id')
  deleteApplication(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.service.deleteApplication(user.id, id);
  }

  @Post('applications/:id/interviews')
  addInterview(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateInterviewDto,
  ) {
    return this.service.addInterview(user.id, id, dto);
  }

  @Patch('applications/:applicationId/interviews/:interviewId')
  updateInterview(
    @CurrentUser() user: { id: string },
    @Param('applicationId') applicationId: string,
    @Param('interviewId') interviewId: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.service.updateInterview(
      user.id,
      applicationId,
      interviewId,
      dto,
    );
  }

  @Post('applications/:id/offers')
  addOffer(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.service.addOffer(user.id, id, dto);
  }
}
