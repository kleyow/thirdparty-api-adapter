/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Lewis Daly <lewisd@crosslaketech.com>
 --------------
 ******/

import { EventActionEnum, EventTypeEnum } from '@mojaloop/central-services-shared'
import eventHandlers from './eventHandlers'
import { ServiceConfig } from '../shared/config'
import Consumer from '../shared/consumer'
import { mapServiceConfigToConsumerConfig } from '../shared/util'

export class HandlerNotFoundError extends Error {
  public constructor (eventAction: EventActionEnum, eventType: EventTypeEnum) {
    super(`No Handler found for action: ${eventAction} and type: ${eventType}`)
  }
}

/**
 * @function create
 * @description Creates the Kafka Consumer server based on config
 * @param { ServiceConfig } config
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function create (config: ServiceConfig): Consumer<any>[] {
  const topicTemplate = config.KAFKA.TOPIC_TEMPLATES.GENERAL_TOPIC_TEMPLATE.TEMPLATE
  const consumerConfigs = config.KAFKA.CONSUMER

  return consumerConfigs.map(config => {
    // lookup the handler based on our Action + Event Pair
    const handler = eventHandlers.get({ action: config.eventAction, type: config.eventType })
    if (!handler) {
      throw new HandlerNotFoundError(config.eventAction, config.eventType)
    }

    return new Consumer(mapServiceConfigToConsumerConfig(config), topicTemplate, handler)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function start (consumers: Consumer<any>[]): Promise<void> {
  await Promise.all(consumers.map(c => c.start()))
}
