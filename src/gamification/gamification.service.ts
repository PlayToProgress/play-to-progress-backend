import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JourneyCard } from '../schemas/journey-card.schema';
import { Badge } from '../schemas/badge.schema';
import { Participant } from '../schemas/participant.schema';

const TOTAL_STAMPS = 10;

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(JourneyCard.name) private journeyCardModel: Model<JourneyCard>,
    @InjectModel(Badge.name) private badgeModel: Model<Badge>,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
  ) {}

  /**
   * Called whenever a coordinator marks a participant "present" for a session.
   * Awards a Journey Card stamp (idempotent), unlocks the reward at 10/10, and
   * awards the relevant badges.
   */
  async awardStampForAttendance(
    participantId: Types.ObjectId | string,
    cohortId: Types.ObjectId | string,
    sessionNumber: number,
  ) {
    let card = await this.journeyCardModel.findOne({ participantId });
    if (!card) {
      card = await this.journeyCardModel.create({
        participantId,
        cohortId,
        stamps: [],
        stampCount: 0,
        rewardUnlocked: false,
        rewardIssued: false,
      });
    }

    const alreadyStamped = card.stamps.some(
      (s) => s.sessionNumber === sessionNumber,
    );
    if (alreadyStamped) return card;

    card.stamps.push({ sessionNumber, earnedAt: new Date() });
    card.stampCount = card.stamps.length;

    if (card.stampCount === 1) {
      await this.badgeModel.create({
        participantId,
        type: 'first_session',
        label: 'First Session Attended',
        sessionNumber,
      });
    }

    if (card.stampCount >= TOTAL_STAMPS && !card.rewardUnlocked) {
      card.rewardUnlocked = true;
      card.rewardUnlockedAt = new Date();
      await this.badgeModel.create({
        participantId,
        type: 'journey_complete',
        label: 'Journey Card Complete — Reward Unlocked',
      });
    }

    await card.save();
    await this.participantModel.updateOne(
      { _id: participantId },
      { $inc: { xp: 10 } },
    );

    return card;
  }

  /**
   * Removes a stamp if a coordinator corrects an attendance record from
   * "present" back to "absent"/"late" — keeps the Journey Card accurate.
   */
  async revokeStampForSession(
    participantId: Types.ObjectId | string,
    sessionNumber: number,
  ) {
    const card = await this.journeyCardModel.findOne({ participantId });
    if (!card) return null;

    const before = card.stamps.length;
    card.stamps = card.stamps.filter((s) => s.sessionNumber !== sessionNumber);
    card.stampCount = card.stamps.length;

    if (
      card.stampCount < TOTAL_STAMPS &&
      card.rewardUnlocked &&
      !card.rewardIssued
    ) {
      card.rewardUnlocked = false;
      card.rewardUnlockedAt = undefined;
    }

    if (card.stamps.length !== before) {
      await card.save();
    }
    return card;
  }
}

export { TOTAL_STAMPS };
