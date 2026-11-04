import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContractStatus } from 'src/common/enums/contract.enum';
import { RoomStatus } from 'src/common/enums/room.enum';
import { getCurrentDate } from 'src/common/utils';
import { DataSource, Not } from 'typeorm';
import { Rooms } from '../property/entities/rooms.entity';
import { hasStarted } from './contract-workflow.util';
import { Contracts } from './entities/contracts.entity';

@Injectable()
export class ContractSchedulerService {
  private readonly logger = new Logger(ContractSchedulerService.name);

  constructor(private readonly dataSource: DataSource) {}

  @Cron('5 0 * * *')
  async handleDailyActivation(): Promise<void> {
    const count = await this.activateStartedContracts();
    this.logger.log(`Activated ${count} contract(s) whose start date arrived`);
  }

  /**
   * PENDING_START -> ACTIVE (+ room OCCUPIED) once the start date is reached.
   * Each contract runs in its own transaction so one conflict cannot block the rest.
   */
  async activateStartedContracts(
    now: Date = getCurrentDate(true),
  ): Promise<number> {
    this.logger.warn(
      `Checking for contracts to activate at ${now.toISOString()}`,
    );
    const pending = await this.dataSource.manager.find(Contracts, {
      where: { status: ContractStatus.PENDING_START },
    });
    const due = pending.filter((contract) =>
      hasStarted(contract.startDate, now),
    );

    let activated = 0;
    for (const contract of due) {
      try {
        await this.dataSource.transaction(async (manager) => {
          const otherActive = await manager.count(Contracts, {
            where: {
              roomId: contract.roomId,
              status: ContractStatus.ACTIVE,
              id: Not(contract.id),
            },
          });
          if (otherActive > 0) {
            throw new Error('Room already has an active contract');
          }
          await manager.update(Contracts, contract.id, {
            status: ContractStatus.ACTIVE,
          });
          await manager.update(Rooms, contract.roomId, {
            status: RoomStatus.OCCUPIED,
          });
        });
        activated++;
      } catch (error) {
        this.logger.error(
          `Cannot activate contract ${contract.id}: ${error.message}`,
        );
      }
    }
    return activated;
  }
}
