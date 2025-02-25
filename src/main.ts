/* eslint-disable @typescript-eslint/no-explicit-any */

import {RuleEngine , Operator} from "./RuleEngine.js";

const functions = {
  getCourier: getCourier,
  logCourierInfo: logCourierInfo
};

export async function getCourier(params : any): Promise<any> {
  throw new Error('Before')
  return {
    id: params?.courierId,
    status: 200,
    vehicle: 'Bike',
    courierInfo: {
      name: 'John Doe',
      warehouse: 'Izmir'
    }
  };
}

export async function logCourierInfo(courier : any , params: any) : Promise<any> {

  console.log(JSON.stringify({
    courierInfo: {
      status: courier.status,
      vehicle: courier.vehicle,
    },
    params
  }, null, 2));
}

// Example usage:
const engine = new RuleEngine(functions);

//success rule example
engine.addRule({
  before: {func : 'getCourier'  , params: {
    courierId: '6633d4699c759c778ab5b399'
  }},
  conditions: {
    and: [
      {
        fact: 'status',
        operator: Operator.STRICT_EQUAL,
        value: 200
      }
    ],
    or: [
      {
        fact: 'vehicle',
        operator: Operator.STRICT_EQUAL,
        value: 'Bike'
      },
      {
        fact: 'vehicle',
        operator: Operator.STRICT_EQUAL,
        value: 'Car'
      }
    ]
  },
  after: {func : 'logCourierInfo'  , params: {
    message: 'Rule work with success!',
    success: true,
  }},
});

//failed rule example
engine.addRule({
  before: {func : 'getCourier'  , params: {
    courierId: '6633d4699c759c778ab5b399'
  }},
  conditions: {
    and: [
      {
        fact: 'status',
        operator: Operator.STRICT_EQUAL,
        value: 400
      }
    ],
  },
  after: {func : 'logCourierInfo'  , params: {
    message: 'Rule work with success!',
    success: true,
  }},
});
 
engine.obey();
