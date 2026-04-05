import {
    UUID,
    HubId,
    City,
    PhoneNumber
} from './shared.js';

export interface Hub {
    id: HubId;
    name: string;
    cityId: UUID;
    city?: City;
    address: string;
    managerName: string;
    managerPhone: PhoneNumber;
    vendorIds: UUID[];
    isActive: boolean;
}
