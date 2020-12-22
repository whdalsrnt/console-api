import grpcClient from '@lib/grpc-client';
import logger from '@lib/logger';
import httpContext from 'express-http-context';
import { PhdSummaryFactory } from '@factories/statistics/topic/phd-summary';

const getDefaultQuery = () => {
    return {
        'resource_type': 'inventory.CloudService',
        'query': {
            'aggregate': {
                'group': {
                    'keys': [
                        {
                            'name': 'resource_id',
                            'key': 'reference.resource_id'
                        }
                    ],
                    'fields': [
                        {
                            'name': 'affected_projects',
                            'key': 'project_id',
                            'operator': 'add_to_set'
                        },
                        {
                            'name': 'event_title',
                            'key': 'data.event_title',
                            'operator': 'first'
                        },
                        {
                            'name': 'event_type_category',
                            'key': 'data.event_type_category',
                            'operator': 'first'
                        },
                        {
                            'name': 'region_code',
                            'key': 'region_code',
                            'operator': 'first'
                        },
                        {
                            'name': 'service',
                            'key': 'data.service',
                            'operator': 'first'
                        },
                        {
                            'name': 'last_update_time',
                            'key': 'data.last_update_time',
                            'operator': 'first'
                        }
                    ]
                }
            },
            'filter': [
                {
                    'key': 'provider',
                    'value': 'aws',
                    'operator': 'eq'
                },
                {
                    'key': 'cloud_service_group',
                    'value': 'PersonalHealthDashboard',
                    'operator': 'eq'
                },
                {
                    'key': 'cloud_service_type',
                    'value': 'Event',
                    'operator': 'eq'
                },
                // {
                //     'key': 'data.status_code',
                //     'value': 'closed',
                //     'operator': 'not'
                // },
                {
                    'key': 'data.event_type_category',
                    'value': [
                        'issue',
                        'scheduledChange'
                    ],
                    'operator': 'in'
                }
            ],
            'sort': {
                'name': 'last_update_time',
                'desc': true
            }
        }
    };
};

const makeRequest = (params) => {
    let requestParams = getDefaultQuery();
    return requestParams;
};

const phdSummary = async (params) => {
    if (httpContext.get('mock_mode')) {
        return {
            results: PhdSummaryFactory.buildBatch(10),
            total_count: 10
        };
    }

    const statisticsV1 = await grpcClient.get('statistics', 'v1');
    const requestParams = makeRequest(params);
    const response = await statisticsV1.Resource.stat(requestParams);

    return response;
};

export default phdSummary;