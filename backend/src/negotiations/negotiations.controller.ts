import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { NegotiationsService } from './negotiations.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateNegotiationDto,
  UpdateNegotiationDto,
} from './dto/negotiations.dto';
import { AnalyzeOfferDto } from './dto/analyze-offer.dto';

@Controller('negotiations')
export class NegotiationsController {
  constructor(private readonly service: NegotiationsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Post('analyze')
  analyzeOffer(
    @CurrentUser() user: { id: string },
    @Body() dto: AnalyzeOfferDto,
  ) {
    return this.service.analyzeOffer(user.id, dto);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNegotiationDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateNegotiationDto,
  ) {
    return this.service.update(user.id, id, dto);
  }
}
