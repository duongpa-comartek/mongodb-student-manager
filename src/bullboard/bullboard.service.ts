import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Injectable()
export class BullboardService {
    constructor() { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = {
            username: "duongpa",
            password: "123"
        }

        if (user.username === username && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
}

export const queuePool: Set<Queue> = new Set<Queue>();

export const getBullBoardQueues = (): BaseAdapter[] => {
    return [...queuePool].reduce((acc: BaseAdapter[], val) => {
        acc.push(new BullAdapter(val));
        return acc;
    }, []);
};

