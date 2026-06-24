import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateResumeDto,
  UpdateResumeDto,
  CreateResumeSectionDto,
  UpdateResumeSectionDto,
} from './dto/resumes.dto';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly service: ResumesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateResumeDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }

  @Post(':id/sections')
  addSection(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateResumeSectionDto,
  ) {
    return this.service.addSection(user.id, id, dto);
  }

  @Patch(':resumeId/sections/:sectionId')
  updateSection(
    @CurrentUser() user: { id: string },
    @Param('resumeId') resumeId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateResumeSectionDto,
  ) {
    return this.service.updateSection(user.id, resumeId, sectionId, dto);
  }
}
