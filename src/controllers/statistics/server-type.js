import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import _ from 'lodash';

const TYPE_INFO = {
    'server_type': {
        'key': 'server_type',
        'values': [
            'BAREMETAL',
            'HYPERVISOR',
            'VM',
            'UNKNOWN'
        ]
    },
    'vm_type': {
        'key': 'data.vm.platform_type',
        'values': [
            'AWS',
            'AZURE',
            'GCP',
            'OPENSTACK',
            'VMWARE'
        ]
    },
    'hypervisor_type': {
        'key': 'data.hypervisor.platform_type',
        'values': [
            'KVM',
            'VMWARE',
            'XENSERVER'
        ]
    },
    'os_type': {
        'key': 'os_type',
        'values': [
            'WINDOWS',
            'LINUX'
        ]
    }
}

const getServerType = async (params) => {
    if (!params.item_type) {
        throw new Error('Required parameter. (key = item_type)');
    } else {
        if (!params.item_type in TYPE_INFO) {
            throw new Error(`Parameter is invalid. (item_type = ${params.item_type})`);
        }
    }

    let itemTypeInfo = TYPE_INFO[params.item_type];

    let inventoryV1 = await grpcClient.get('inventory', 'v1');
    let reqParams = {
        domain_id: params.domain_id,
        query: {
            count_only: true
        }
    };

    let defaultFilter = {
        k: 'server_type',
        v: 'DELETED',
        o: 'not'
    };

    let response = {};
    let promises = itemTypeInfo.values.map(async (type) => {
        reqParams.query.filter = [_.clone(defaultFilter, true), {
            k: itemTypeInfo.key,
            v: type,
            o: 'eq'
        }];

        let typeResponse = await inventoryV1.Server.list(reqParams);
        response[type] = typeResponse.total_count;
    });

    await Promise.all(promises);
    return response;
};

export default getServerType;
