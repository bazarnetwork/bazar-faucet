import {apiClient} from '@liskhq/lisk-client';

let clientCache: any;
const nodeAPIURL = 'ws://localhost:8080/ws';

export const getClient = async () => {
    console.log("conecting to BRZ Node......")
    if (!clientCache) {
        clientCache = await apiClient.createWSClient(nodeAPIURL);
    }
    return clientCache;
};
