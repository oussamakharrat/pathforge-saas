import { ApplicationStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { APPLICATION_PIPELINE } from './types';

export function validateStatusTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
  hasInterviews: boolean,
  hasOffers: boolean,
): void {
  if (to === from) return;

  if (to === ApplicationStatus.rejected) return;

  const fromIdx = APPLICATION_PIPELINE.indexOf(from);
  const toIdx = APPLICATION_PIPELINE.indexOf(to);

  if (fromIdx === -1 || toIdx === -1) {
    throw new BadRequestException('Invalid application status');
  }

  if (toIdx < fromIdx) {
    throw new BadRequestException(
      'Cannot move application backward in pipeline',
    );
  }

  if (to === ApplicationStatus.interview && !hasInterviews) {
    throw new BadRequestException(
      'Cannot set interview status without at least one interview',
    );
  }

  if (to === ApplicationStatus.final_round && !hasInterviews) {
    throw new BadRequestException(
      'Cannot set final round status without at least one interview',
    );
  }

  if (to === ApplicationStatus.offer && !hasOffers) {
    throw new BadRequestException(
      'Cannot set offer status without at least one offer',
    );
  }
}
